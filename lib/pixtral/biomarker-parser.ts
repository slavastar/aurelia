/**
 * Intelligent Biomarker Parser
 * Adaptively extracts biomarkers from OCR text regardless of lab format
 */

import { Biomarkers } from '@/types';

export interface ParsedBiomarker {
  name: string;
  value: number;
  unit: string;
  confidence: number;
  rawText: string;
}

export interface ParsingResult {
  biomarkers: Biomarkers;
  parsed: ParsedBiomarker[];
  confidence: number;
  warnings: string[];
}

// Comprehensive biomarker patterns with variations
// Updated to handle various separators (colons, spaces, dashes, dots)
const SEPARATOR = '[:\\s\\-\\.]*';

const BIOMARKER_PATTERNS = {
  // Glucose & Diabetes
  HbA1c: [
    new RegExp(`HbA1c${SEPARATOR}(\\d+\\.?\\d*)\\s*%?`, 'i'),
    new RegExp(`Hemoglobin\\s*A1c${SEPARATOR}(\\d+\\.?\\d*)\\s*%?`, 'i'),
    new RegExp(`Glycated\\s*Hemoglobin${SEPARATOR}(\\d+\\.?\\d*)\\s*%?`, 'i'),
    new RegExp(`A1C${SEPARATOR}(\\d+\\.?\\d*)\\s*%?`, 'i'),
  ],
  Glucose: [
    new RegExp(`Glucose${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:mg\\/dL|mmol\\/L)?`, 'i'),
    new RegExp(`Blood\\s*Glucose${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:mg\\/dL|mmol\\/L)?`, 'i'),
    new RegExp(`Fasting\\s*Glucose${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:mg\\/dL|mmol\\/L)?`, 'i'),
  ],

  // Iron Studies
  Ferritin: [
    new RegExp(`Ferritin${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:ng\\/mL|μg\\/L|ug\\/L)?`, 'i'),
    new RegExp(`Serum\\s*Ferritin${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:ng\\/mL|μg\\/L|ug\\/L)?`, 'i'),
  ],
  Iron: [
    new RegExp(`Iron${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:μg\\/dL|ug\\/dL|mcg\\/dL)?`, 'i'),
    new RegExp(`Serum\\s*Iron${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:μg\\/dL|ug\\/dL|mcg\\/dL)?`, 'i'),
  ],
  TIBC: [
    new RegExp(`TIBC${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:μg\\/dL|ug\\/dL|mcg\\/dL)?`, 'i'),
    new RegExp(`Total\\s*Iron\\s*Binding\\s*Capacity${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],

  // Inflammation
  CRP: [
    new RegExp(`CRP${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:mg\\/L|mg\\/dL)?`, 'i'),
    new RegExp(`C[-\\s]*Reactive\\s*Protein${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:mg\\/L|mg\\/dL)?`, 'i'),
    new RegExp(`hs[-\\s]*CRP${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:mg\\/L|mg\\/dL)?`, 'i'),
  ],
  ESR: [
    new RegExp(`ESR${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:mm\\/hr)?`, 'i'),
    new RegExp(`Erythrocyte\\s*Sedimentation\\s*Rate${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
    new RegExp(`Sed\\s*Rate${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],

  // Thyroid
  TSH: [
    new RegExp(`TSH${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:mIU\\/L|μIU\\/mL|uIU\\/mL)?`, 'i'),
    new RegExp(`Thyroid\\s*Stimulating\\s*Hormone${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],
  T3: [
    new RegExp(`T3${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:ng\\/dL|pmol\\/L)?`, 'i'),
    new RegExp(`Triiodothyronine${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
    new RegExp(`Free\\s*T3${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],
  T4: [
    new RegExp(`T4${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:μg\\/dL|ug\\/dL|pmol\\/L)?`, 'i'),
    new RegExp(`Thyroxine${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
    new RegExp(`Free\\s*T4${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],

  // Vitamins
  VitaminD: [
    new RegExp(`Vitamin\\s*D${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:ng\\/mL|nmol\\/L)?`, 'i'),
    new RegExp(`25[-\\s]*OH\\s*Vitamin\\s*D${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
    new RegExp(`Vit\\s*D${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],
  VitaminB12: [
    new RegExp(`Vitamin\\s*B[-\\s]*12${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:pg\\/mL|pmol\\/L)?`, 'i'),
    new RegExp(`B12${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:pg\\/mL|pmol\\/L)?`, 'i'),
    new RegExp(`Cobalamin${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],
  Folate: [
    new RegExp(`Folate${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:ng\\/mL|nmol\\/L)?`, 'i'),
    new RegExp(`Folic\\s*Acid${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],

  // Lipid Panel
  TotalCholesterol: [
    new RegExp(`Total\\s*Cholesterol${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:mg\\/dL|mmol\\/L)?`, 'i'),
    new RegExp(`Cholesterol${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:mg\\/dL|mmol\\/L)?`, 'i'),
  ],
  LDL: [
    new RegExp(`LDL${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:mg\\/dL|mmol\\/L)?`, 'i'),
    new RegExp(`LDL[-\\s]*Cholesterol${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
    new RegExp(`Low\\s*Density\\s*Lipoprotein${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],
  HDL: [
    new RegExp(`HDL${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:mg\\/dL|mmol\\/L)?`, 'i'),
    new RegExp(`HDL[-\\s]*Cholesterol${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
    new RegExp(`High\\s*Density\\s*Lipoprotein${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],
  Triglycerides: [
    new RegExp(`Triglycerides${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:mg\\/dL|mmol\\/L)?`, 'i'),
    new RegExp(`Trig${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],

  // Liver Function
  ALT: [
    new RegExp(`ALT${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:U\\/L|IU\\/L)?`, 'i'),
    new RegExp(`Alanine\\s*Aminotransferase${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
    new RegExp(`SGPT${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],
  AST: [
    new RegExp(`AST${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:U\\/L|IU\\/L)?`, 'i'),
    new RegExp(`Aspartate\\s*Aminotransferase${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
    new RegExp(`SGOT${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],

  // Kidney Function
  Creatinine: [
    new RegExp(`Creatinine${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:mg\\/dL|μmol\\/L|umol\\/L)?`, 'i'),
    new RegExp(`Serum\\s*Creatinine${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],
  eGFR: [
    new RegExp(`eGFR${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:mL\\/min)?`, 'i'),
    new RegExp(`Estimated\\s*GFR${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
    new RegExp(`Glomerular\\s*Filtration\\s*Rate${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],

  // Complete Blood Count
  Hemoglobin: [
    new RegExp(`Hemoglobin${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:g\\/dL|g\\/L)?`, 'i'),
    new RegExp(`Hgb${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:g\\/dL|g\\/L)?`, 'i'),
    new RegExp(`Hb${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:g\\/dL|g\\/L)?`, 'i'),
  ],
  WBC: [
    new RegExp(`WBC${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:×10³\\/μL|K\\/μL)?`, 'i'),
    new RegExp(`White\\s*Blood\\s*Cell${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
    new RegExp(`Leukocytes${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],
  Platelets: [
    new RegExp(`Platelets${SEPARATOR}(\\d+\\.?\\d*)\\s*(?:×10³\\/μL|K\\/μL)?`, 'i'),
    new RegExp(`PLT${SEPARATOR}(\\d+\\.?\\d*)`, 'i'),
  ],
};

/**
 * Parse biomarkers from OCR text
 */
export function parseBiomarkers(ocrText: string): ParsingResult {
  const parsed: ParsedBiomarker[] = [];
  const biomarkers: Biomarkers = {};
  const warnings: string[] = [];
  let totalConfidence = 0;
  let matchCount = 0;

  // Normalize text (remove extra whitespace, normalize line breaks)
  const normalizedText = ocrText
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();

  // Try to match each biomarker pattern
  for (const [biomarkerName, patterns] of Object.entries(BIOMARKER_PATTERNS)) {
    let matched = false;

    for (const pattern of patterns) {
      const match = normalizedText.match(pattern);

      if (match && match[1]) {
        const value = parseFloat(match[1]);

        if (!isNaN(value) && value > 0) {
          // Extract unit if present
          const unitMatch = match[0].match(/(\w+\/\w+|%|mg\/dL|ng\/mL|μg\/dL|U\/L)/i);
          const unit = unitMatch ? unitMatch[1] : '';

          parsed.push({
            name: biomarkerName,
            value,
            unit,
            confidence: 0.9, // High confidence for pattern match
            rawText: match[0],
          });

          biomarkers[biomarkerName] = value;
          totalConfidence += 0.9;
          matchCount++;
          matched = true;
          break; // Stop after first match for this biomarker
        }
      }
    }

    if (!matched && isCriticalBiomarker(biomarkerName)) {
      warnings.push(`Critical biomarker "${biomarkerName}" not found in document`);
    }
  }

  // Calculate overall confidence
  const overallConfidence = matchCount > 0 ? totalConfidence / matchCount : 0;

  return {
    biomarkers,
    parsed,
    confidence: Math.round(overallConfidence * 100) / 100,
    warnings,
  };
}

/**
 * Check if a biomarker is critical for analysis
 */
function isCriticalBiomarker(name: string): boolean {
  const critical = ['HbA1c', 'Ferritin', 'CRP', 'TSH'];
  return critical.includes(name);
}

/**
 * Validate parsed biomarkers
 */
export function validateBiomarkers(biomarkers: Biomarkers): {
  isValid: boolean;
  criticalMissing: string[];
  optionalMissing: string[];
  canProceed: boolean;
  message: string;
} {
  const critical = ['HbA1c', 'Ferritin', 'CRP', 'TSH'];
  const optional = ['VitaminD', 'VitaminB12', 'TotalCholesterol', 'Hemoglobin'];

  const criticalMissing = critical.filter(name => !biomarkers[name]);
  const optionalMissing = optional.filter(name => !biomarkers[name]);

  const criticalCount = critical.length - criticalMissing.length;
  const canProceed = criticalCount >= 3; // Need at least 3 out of 4 critical

  let message = '';
  if (criticalMissing.length === 0) {
    message = 'All critical biomarkers present. Analysis can proceed with high confidence.';
  } else if (canProceed) {
    message = `Missing ${criticalMissing.length} critical biomarker(s): ${criticalMissing.join(', ')}. Analysis can proceed with reduced confidence.`;
  } else {
    message = `Too many critical biomarkers missing (${criticalMissing.length}/4). Please upload a more complete blood test or add missing values manually.`;
  }

  return {
    isValid: criticalMissing.length === 0,
    criticalMissing,
    optionalMissing,
    canProceed,
    message,
  };
}

/**
 * Get suggestions for missing biomarkers
 */
export function getMissingBiomarkerSuggestions(
  criticalMissing: string[],
  optionalMissing: string[]
): string[] {
  const suggestions: string[] = [];

  if (criticalMissing.includes('HbA1c')) {
    suggestions.push('HbA1c test - Essential for assessing glucose control and diabetes risk');
  }
  if (criticalMissing.includes('Ferritin')) {
    suggestions.push('Ferritin test - Critical for evaluating iron stores and energy levels');
  }
  if (criticalMissing.includes('CRP')) {
    suggestions.push('CRP (C-Reactive Protein) - Important inflammation marker');
  }
  if (criticalMissing.includes('TSH')) {
    suggestions.push('TSH test - Essential for thyroid function assessment');
  }

  if (optionalMissing.includes('VitaminD')) {
    suggestions.push('Vitamin D test - Recommended for bone health and immune function');
  }
  if (optionalMissing.includes('VitaminB12')) {
    suggestions.push('Vitamin B12 test - Important for energy and neurological health');
  }

  return suggestions;
}
