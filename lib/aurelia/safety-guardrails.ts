/**
 * Safety Guardrails for AUREL✦A
 * Detects emergency values and out-of-scope conditions
 */

export interface EmergencyThreshold {
  biomarker: string;
  min?: number;
  max?: number;
  unit: string;
  reason: string;
}

export interface SafetyCheckResult {
  isEmergency: boolean;
  emergencyValues: Array<{
    biomarker: string;
    value: number;
    threshold: string;
    reason: string;
  }>;
  outOfScope: Array<{
    issue: string;
    recommendation: string;
  }>;
}

/**
 * Emergency value thresholds that require immediate medical attention
 */
export const EMERGENCY_THRESHOLDS: EmergencyThreshold[] = [
  {
    biomarker: 'Glucose',
    min: 50,
    max: 400,
    unit: 'mg/dL',
    reason: 'Severe hypoglycemia or hyperglycemia - risk of diabetic emergency',
  },
  {
    biomarker: 'Troponin',
    min: 0,
    max: 0.04,
    unit: 'ng/mL',
    reason: 'Elevated troponin indicates possible heart attack',
  },
  {
    biomarker: 'Creatinine',
    max: 3.0,
    unit: 'mg/dL',
    reason: 'Severe kidney dysfunction',
  },
  {
    biomarker: 'Potassium',
    min: 2.5,
    max: 6.0,
    unit: 'mEq/L',
    reason: 'Critical potassium levels - risk of cardiac arrhythmia',
  },
  {
    biomarker: 'Hemoglobin',
    min: 7.0,
    unit: 'g/dL',
    reason: 'Severe anemia requiring immediate evaluation',
  },
  {
    biomarker: 'WBC',
    min: 2.0,
    max: 30.0,
    unit: '10^9/L',
    reason: 'Critically low or high white blood cell count',
  },
  {
    biomarker: 'Platelets',
    min: 50,
    unit: '10^9/L',
    reason: 'Severe thrombocytopenia - bleeding risk',
  },
];

/**
 * Out-of-scope conditions that should be referred to specialists
 */
export const OUT_OF_SCOPE_KEYWORDS = [
  'cancer',
  'tumor',
  'malignancy',
  'chemotherapy',
  'radiation',
  'pregnancy',
  'pregnant',
  'trimester',
  'prenatal',
  'medication dosage',
  'drug interaction',
  'prescription',
  'chest pain',
  'suicidal',
  'suicide',
  'self-harm',
];

/**
 * Check biomarkers for emergency values
 */
export function checkEmergencyValues(
  biomarkers: Record<string, number | undefined>
): SafetyCheckResult {
  const emergencyValues: SafetyCheckResult['emergencyValues'] = [];

  for (const threshold of EMERGENCY_THRESHOLDS) {
    const value = biomarkers[threshold.biomarker];
    
    if (value === undefined) continue;

    let isEmergency = false;
    let thresholdDescription = '';

    if (threshold.min !== undefined && value < threshold.min) {
      isEmergency = true;
      thresholdDescription = `below ${threshold.min} ${threshold.unit}`;
    }

    if (threshold.max !== undefined && value > threshold.max) {
      isEmergency = true;
      thresholdDescription = `above ${threshold.max} ${threshold.unit}`;
    }

    if (isEmergency) {
      emergencyValues.push({
        biomarker: threshold.biomarker,
        value,
        threshold: thresholdDescription,
        reason: threshold.reason,
      });
    }
  }

  return {
    isEmergency: emergencyValues.length > 0,
    emergencyValues,
    outOfScope: [],
  };
}

/**
 * Check user input for out-of-scope conditions
 */
export function checkOutOfScope(
  symptoms: string[],
  userInput?: string
): SafetyCheckResult['outOfScope'] {
  const outOfScope: SafetyCheckResult['outOfScope'] = [];
  const allText = [...symptoms, userInput || ''].join(' ').toLowerCase();

  for (const keyword of OUT_OF_SCOPE_KEYWORDS) {
    if (allText.includes(keyword.toLowerCase())) {
      let recommendation = '';

      if (keyword.includes('cancer') || keyword.includes('tumor')) {
        recommendation = 'Please consult with an oncologist for cancer-related concerns.';
      } else if (keyword.includes('pregnancy') || keyword.includes('pregnant')) {
        recommendation = 'Please consult with your OB-GYN for pregnancy-related health matters.';
      } else if (keyword.includes('medication') || keyword.includes('prescription')) {
        recommendation = 'Please consult with your doctor or pharmacist about medication concerns.';
      } else if (keyword.includes('chest pain') || keyword.includes('suicid')) {
        recommendation = 'Please seek immediate emergency medical care or call emergency services.';
      }

      outOfScope.push({
        issue: `Detected: ${keyword}`,
        recommendation,
      });
    }
  }

  return outOfScope;
}

/**
 * Comprehensive safety check
 */
export function performSafetyCheck(
  biomarkers: Record<string, number | undefined>,
  symptoms: string[],
  userInput?: string
): SafetyCheckResult {
  const emergencyCheck = checkEmergencyValues(biomarkers);
  const scopeCheck = checkOutOfScope(symptoms, userInput);

  return {
    isEmergency: emergencyCheck.isEmergency || scopeCheck.length > 0,
    emergencyValues: emergencyCheck.emergencyValues,
    outOfScope: scopeCheck,
  };
}

/**
 * Generate emergency message for user
 */
export function generateEmergencyMessage(result: SafetyCheckResult): string {
  if (!result.isEmergency) return '';

  let message = '⚠️ **URGENT: Immediate Medical Attention Required**\n\n';

  if (result.emergencyValues.length > 0) {
    message += 'Your blood test results show critical values that require immediate medical evaluation:\n\n';
    
    for (const emergency of result.emergencyValues) {
      message += `- **${emergency.biomarker}**: ${emergency.value} (${emergency.threshold})\n`;
      message += `  *${emergency.reason}*\n\n`;
    }
  }

  if (result.outOfScope.length > 0) {
    message += '\n**Important:**\n';
    for (const scope of result.outOfScope) {
      message += `- ${scope.recommendation}\n`;
    }
  }

  message += '\n**Please contact your healthcare provider or visit an emergency room as soon as possible. Do not delay seeking medical care.**\n\n';
  message += 'This system cannot provide analysis for emergency medical situations.';

  return message;
}

/**
 * Validate mandatory biomarkers are present
 */
export const MANDATORY_BIOMARKERS = ['HbA1c', 'Ferritin', 'CRP', 'TSH'];

export function validateMandatoryBiomarkers(
  biomarkers: Record<string, number | undefined>
): {
  isValid: boolean;
  missing: string[];
} {
  const missing = MANDATORY_BIOMARKERS.filter(
    (biomarker) => biomarkers[biomarker] === undefined
  );

  return {
    isValid: missing.length === 0,
    missing,
  };
}
