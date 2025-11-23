/**
 * Main Analysis API Endpoint
 * Orchestrates: Safety Check → ML Model → Mistral Analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { performSafetyCheck, generateEmergencyMessage } from '@/lib/aurelia/safety-guardrails';
import { buildAureliaPrompt } from '@/lib/aurelia/system-prompt';
import { generateAureliaAnalysis } from '@/lib/mistral/client';
import { generateMockRiskScore } from '@/lib/ml-model/mock-client';
import type { AnalysisInput, AnalysisOutput } from '@/types';

// Allow execution up to 5 minutes (if supported by hosting plan)
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisInput = await request.json();
    const { biomarkers, context, wearables } = body;

    // Validate input
    if (!biomarkers || !context) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: biomarkers and context',
        },
        { status: 400 }
      );
    }

    // Step 1: Safety Check (CRITICAL - must run first)
    console.log('🔒 Running safety checks...');
    const safetyResult = performSafetyCheck(
      biomarkers,
      context.symptoms,
      context.medical_history?.conditions?.join(' ')
    );

    if (safetyResult.isEmergency) {
      console.log('⚠️ Emergency detected!');
      const emergencyMessage = generateEmergencyMessage(safetyResult);

      return NextResponse.json<AnalysisOutput>({
        success: true,
        isEmergency: true,
        emergencyMessage,
        timestamp: new Date().toISOString(),
      });
    }

    // Step 2: Call Python AI Health Coach
    console.log('🤖 Calling AI Health Coach...');

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:8000'; // Default to local python server

    // Map context to HealthProfile
    const healthProfile = {
      age: typeof context.age === 'string' ? parseInt(context.age) : context.age,
      height: context.height || 165,
      weight: context.weight || 60,
      bioage: typeof context.age === 'string' ? parseInt(context.age) : context.age, // Default to chronological
      lifestyle_quiz: {
        ...context.lifestyle,
        symptoms: context.symptoms,
        goals: context.goals,
        cycle_status: context.cycle_status
      },
      biomarkers: biomarkers,
      skin_age: null
    };

    let analysisResult;
    try {
      let pythonResponse;

      if (context.face_photo) {
        // If photo exists, use the photo endpoint with multipart/form-data
        const formData = new FormData();
        formData.append('profile', JSON.stringify(healthProfile));

        // Convert base64 to blob
        const base64Data = context.face_photo.split(',')[1];
        const binaryData = Buffer.from(base64Data, 'base64');
        const blob = new Blob([binaryData], { type: 'image/jpeg' });
        
        formData.append('profile_json', JSON.stringify(healthProfile));
        formData.append('face_photo', blob, 'face.jpg');

        pythonResponse = await fetch(`${baseUrl}/api/py/generate-report-with-photo`, {
          method: 'POST',
          body: formData,
        });
      } else {
        // Standard JSON endpoint
        pythonResponse = await fetch(`${baseUrl}/api/py/generate-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(healthProfile)
        });
      }

      if (pythonResponse.ok) {
        const data = await pythonResponse.json();
        analysisResult = data.report; // The structured report
      } else {
        console.warn('Python backend failed, falling back to Mistral:', await pythonResponse.text());
        // Fallback logic below
      }
    } catch (e) {
      console.warn('Python backend connection failed:', e);
    }

    let aureliaAnalysis = '';
    let riskScore = 0;
    let riskFactors: string[] = [];

    if (analysisResult) {
      // Format JSON report to Markdown
      const assessment = analysisResult.health_assessment;
      riskScore = 85; // Default optimistic score if not provided
      if (assessment.primary_risks) riskFactors = assessment.primary_risks;

      aureliaAnalysis = `
## 🏥 Health Assessment
**Bioage Gap:** ${assessment.bioage_gap > 0 ? `+${assessment.bioage_gap} years (Accelerated)` : `${assessment.bioage_gap} years (Decelerated)`}

### Primary Risks
${assessment.primary_risks.map((r: string) => `- ${r}`).join('\n')}

## 📋 Recommendations

${analysisResult.recommendations.map((rec: any) => `
### ${rec.priority}. ${rec.title}
**Action:** ${rec.action}
**Rationale:** ${rec.rationale}
**Timeline:** ${rec.expected_timeline}
`).join('\n')}

## 💊 Supplement Protocol
${analysisResult.supplement_protocol.map((supp: any) => `- **${supp.supplement}**: ${supp.dosage} (${supp.rationale})`).join('\n')}
      `;
    } else {
      // Fallback to Mistral (Existing Logic)
      console.log('📝 Building AUREL✦A prompt (Fallback)...');
      const mlResult = await generateMockRiskScore({
        biomarkers,
        context: {
          age: context.age,
          cycle_status: context.cycle_status,
          symptoms: context.symptoms,
          lifestyle: context.lifestyle,
        },
      });
      riskScore = mlResult.risk_score;
      riskFactors = mlResult.risk_factors;

      const prompt = buildAureliaPrompt(
        biomarkers,
        {
          age: context.age,
          cycle_status: context.cycle_status,
          symptoms: context.symptoms,
          goals: context.goals,
          lifestyle: context.lifestyle,
        },
        riskScore,
        false
      );

      const mistralResult = await generateAureliaAnalysis({
        systemPrompt: prompt,
        complexity: 'complex',
      });

      if (mistralResult.success) {
        aureliaAnalysis = mistralResult.analysis;
      } else {
        throw new Error('All analysis methods failed');
      }
    }

    console.log('✅ Analysis complete!');

    // Step 5: Return Complete Analysis
    const response: AnalysisOutput = {
      success: true,
      isEmergency: false,
      mlRiskScore: riskScore,
      mlConfidence: 0.9,
      riskFactors: riskFactors,
      aureliaAnalysis: aureliaAnalysis,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'AUREL✦A Analysis API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
