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

    console.log('✅ Safety checks passed');

    // Step 2: Get ML Risk Score
    console.log('🤖 Generating ML risk score...');
    const mlResult = await generateMockRiskScore({
      biomarkers,
      context: {
        age: context.age,
        cycle_status: context.cycle_status,
        symptoms: context.symptoms,
        lifestyle: context.lifestyle,
      },
    });

    console.log(`📊 ML Risk Score: ${mlResult.risk_score}/100`);

    // Step 3: Build Mistral Prompt
    console.log('📝 Building AUREL✦A prompt...');
    const prompt = buildAureliaPrompt(
      biomarkers,
      {
        age: context.age,
        cycle_status: context.cycle_status,
        symptoms: context.symptoms,
        goals: context.goals,
        lifestyle: context.lifestyle,
      },
      mlResult.risk_score,
      false
    );

    // Step 4: Generate Analysis with Mistral
    console.log('✨ Generating AUREL✦A analysis...');
    const mistralResult = await generateAureliaAnalysis({
      systemPrompt: prompt,
      complexity: 'complex', // Use large model for medical analysis
    });

    if (!mistralResult.success) {
      console.error('❌ Mistral analysis failed:', mistralResult.error);
      return NextResponse.json(
        {
          success: false,
          error: `Analysis generation failed: ${mistralResult.error}`,
        },
        { status: 500 }
      );
    }

    console.log('✅ Analysis complete!');

    // Step 5: Return Complete Analysis
    const response: AnalysisOutput = {
      success: true,
      isEmergency: false,
      mlRiskScore: mlResult.risk_score,
      mlConfidence: mlResult.confidence,
      riskFactors: mlResult.risk_factors,
      aureliaAnalysis: mistralResult.analysis,
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
