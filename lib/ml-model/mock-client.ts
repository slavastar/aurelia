/**
 * Mock ML Model Client
 * TODO: Replace with real ML model endpoint when team delivers it
 * See TODO.md for integration details
 */

export interface MLModelInput {
  biomarkers: Record<string, number | undefined>;
  context: {
    age: number;
    cycle_status?: string;
    symptoms: string[];
    lifestyle?: {
      sleep_hours?: number;
      exercise_frequency?: string;
      stress_level?: string;
    };
  };
}

export interface MLModelOutput {
  risk_score: number; // 0-100 (higher = better health)
  confidence: number; // 0-1
  risk_factors: string[];
  model_version: string;
}

/**
 * Mock ML model that generates realistic risk scores
 * This simulates what the real ML model will return
 */
export async function generateMockRiskScore(
  input: MLModelInput
): Promise<MLModelOutput> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const { biomarkers, context } = input;

  // Simple heuristic-based scoring (replace with real ML model)
  let score = 70; // Start with baseline
  const riskFactors: string[] = [];

  // HbA1c scoring
  if (biomarkers.HbA1c) {
    if (biomarkers.HbA1c < 5.7) {
      score += 5;
    } else if (biomarkers.HbA1c >= 5.7 && biomarkers.HbA1c < 6.5) {
      score -= 5;
      riskFactors.push('elevated_hba1c');
    } else {
      score -= 15;
      riskFactors.push('high_hba1c');
    }
  }

  // Ferritin scoring (women-specific)
  if (biomarkers.Ferritin) {
    if (biomarkers.Ferritin < 30) {
      score -= 10;
      riskFactors.push('low_ferritin');
    } else if (biomarkers.Ferritin >= 30 && biomarkers.Ferritin < 50) {
      score -= 5;
      riskFactors.push('suboptimal_ferritin');
    } else if (biomarkers.Ferritin > 200) {
      score -= 8;
      riskFactors.push('elevated_ferritin');
    } else {
      score += 5;
    }
  }

  // CRP scoring (inflammation)
  if (biomarkers.CRP) {
    if (biomarkers.CRP < 1.0) {
      score += 5;
    } else if (biomarkers.CRP >= 1.0 && biomarkers.CRP < 3.0) {
      score -= 3;
      riskFactors.push('mild_inflammation');
    } else {
      score -= 10;
      riskFactors.push('elevated_crp');
    }
  }

  // TSH scoring (thyroid)
  if (biomarkers.TSH) {
    if (biomarkers.TSH >= 0.5 && biomarkers.TSH <= 2.5) {
      score += 5;
    } else if (biomarkers.TSH > 2.5 && biomarkers.TSH < 4.5) {
      score -= 3;
      riskFactors.push('suboptimal_tsh');
    } else {
      score -= 10;
      riskFactors.push('abnormal_thyroid');
    }
  }

  // Vitamin D scoring
  if (biomarkers.VitaminD) {
    if (biomarkers.VitaminD < 30) {
      score -= 8;
      riskFactors.push('low_vitamin_d');
    } else if (biomarkers.VitaminD >= 40) {
      score += 5;
    }
  }

  // Lifestyle factors
  if (context.lifestyle) {
    if (context.lifestyle.sleep_hours && context.lifestyle.sleep_hours < 7) {
      score -= 5;
      riskFactors.push('insufficient_sleep');
    }

    if (context.lifestyle.stress_level === 'high') {
      score -= 5;
      riskFactors.push('high_stress');
    }

    if (context.lifestyle.exercise_frequency === 'sedentary') {
      score -= 5;
      riskFactors.push('sedentary_lifestyle');
    }
  }

  // Symptom impact
  if (context.symptoms.length > 3) {
    score -= 5;
    riskFactors.push('multiple_symptoms');
  }

  // Age adjustment
  if (context.age > 45) {
    score -= 2; // Natural decline with age
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Calculate confidence based on data completeness
  const totalPossibleBiomarkers = 10;
  const providedBiomarkers = Object.keys(biomarkers).length;
  const confidence = Math.min(0.95, providedBiomarkers / totalPossibleBiomarkers + 0.3);

  return {
    risk_score: Math.round(score * 10) / 10, // Round to 1 decimal
    confidence: Math.round(confidence * 100) / 100,
    risk_factors: riskFactors,
    model_version: 'mock-v1.0.0',
  };
}

/**
 * Check if real ML model is available
 */
export function isRealMLModelAvailable(): boolean {
  return (
    !!process.env.ML_MODEL_API_URL &&
    process.env.ML_MODEL_API_URL !== 'http://localhost:3000/api/ml-model'
  );
}

/**
 * Get ML model status
 */
export function getMLModelStatus(): {
  available: boolean;
  type: 'mock' | 'real';
  endpoint?: string;
} {
  const isReal = isRealMLModelAvailable();
  
  return {
    available: true,
    type: isReal ? 'real' : 'mock',
    endpoint: isReal ? process.env.ML_MODEL_API_URL : 'mock',
  };
}
