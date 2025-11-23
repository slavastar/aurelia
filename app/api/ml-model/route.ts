import { NextRequest, NextResponse } from 'next/server';
import { generateMockRiskScore } from '@/lib/ml-model/mock-client';

/**
 * ML Model API Endpoint (MOCK)
 * 
 * TODO: Replace with real ML model endpoint when ready
 * See TODO.md for integration details
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.biomarkers || typeof body.biomarkers !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid biomarkers data' },
        { status: 400 }
      );
    }

    if (!body.context || typeof body.context !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid context data' },
        { status: 400 }
      );
    }

    // Generate mock risk score
    const result = await generateMockRiskScore({
      biomarkers: body.biomarkers,
      context: body.context,
    });

    return NextResponse.json({
      success: true,
      data: result,
      mock: true,
      message: 'This is a mock response. Real ML model integration pending.',
    });

  } catch (error) {
    console.error('ML Model API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'operational',
    service: 'ML Model API (Mock)',
    version: '1.0.0',
    mock: true,
    message: 'Mock ML model endpoint. Real integration pending from ML team.',
    timestamp: new Date().toISOString(),
  });
}
