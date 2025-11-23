/**
 * Type definitions for AUREL✦A
 */

// ============================================================================
// Biomarker Types
// ============================================================================

export interface Biomarkers {
  // Mandatory baseline biomarkers
  HbA1c?: number; // Glycated hemoglobin (%)
  Ferritin?: number; // Iron stores (ng/mL)
  CRP?: number; // C-Reactive Protein (mg/L)
  TSH?: number; // Thyroid Stimulating Hormone (mIU/L)

  // Optional but valuable biomarkers
  VitaminD?: number; // 25-OH Vitamin D (ng/mL)
  VitaminB12?: number; // Cobalamin (pg/mL)
  Glucose?: number; // Fasting glucose (mg/dL)
  Hemoglobin?: number; // g/dL
  WBC?: number; // White Blood Cells (10^9/L)
  Platelets?: number; // 10^9/L
  Creatinine?: number; // mg/dL
  Potassium?: number; // mEq/L
  Troponin?: number; // ng/mL

  // Thyroid panel
  T3?: number; // Triiodothyronine (ng/dL)
  T4?: number; // Thyroxine (μg/dL)
  FreeT3?: number; // pg/mL
  FreeT4?: number; // ng/dL

  // Lipid panel
  TotalCholesterol?: number; // mg/dL
  LDL?: number; // mg/dL
  HDL?: number; // mg/dL
  Triglycerides?: number; // mg/dL
  ApoB?: number; // mg/dL

  // Liver function
  ALT?: number; // U/L
  AST?: number; // U/L

  // Hormones
  Estrogen?: number; // pg/mL
  Progesterone?: number; // ng/mL
  Testosterone?: number; // ng/dL
  Cortisol?: number; // μg/dL

  // Other
  Calcium?: number; // mg/dL
  Magnesium?: number; // mg/dL
  Zinc?: number; // μg/dL

  // Allow for additional biomarkers
  [key: string]: number | undefined;
}

export interface BiomarkerReference {
  name: string;
  unit: string;
  optimalMin?: number;
  optimalMax?: number;
  normalMin?: number;
  normalMax?: number;
  description: string;
}

export interface Biomarker {
  value: number;
  unit: string;
  status: 'optimal' | 'normal' | 'borderline' | 'attention' | 'critical';
  referenceRange?: {
    min: number;
    max: number;
  };
}

// ============================================================================
// User Context Types
// ============================================================================

export type CycleStatus =
  | 'follicular'
  | 'ovulation'
  | 'luteal'
  | 'menstruation'
  | 'perimenopause'
  | 'postmenopause'
  | 'not_applicable';

export type ExerciseFrequency =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type StressLevel = 'low' | 'moderate' | 'high' | 'severe';

export interface UserContext {
  age: number;
  height?: number; // cm
  weight?: number; // kg
  cycle_status?: CycleStatus | string;
  is_menstruating?: boolean;
  symptoms: string[];
  goals: string[];
  lifestyle?: {
    sleep_hours?: number;
    exercise_frequency?: ExerciseFrequency;
    stress_level?: StressLevel;
    diet_type?: string;
    supplements?: string[];
  };
  medical_history?: {
    conditions?: string[];
    medications?: string[];
    allergies?: string[];
  };
  face_photo?: string; // Base64 string
}

// ============================================================================
// Analysis Types
// ============================================================================

export interface AnalysisInput {
  biomarkers: Biomarkers;
  context: UserContext;
  wearables?: {
    avg_sleep?: number;
    hrv_trend?: number;
    resting_heart_rate?: number;
    steps_per_day?: number;
  };
}

export interface AnalysisOutput {
  success: boolean;
  isEmergency: boolean;
  emergencyMessage?: string;
  mlRiskScore?: number;
  mlConfidence?: number;
  riskFactors?: string[];
  aureliaAnalysis?: string;
  bioage?: number;
  skinAge?: number;
  error?: string;
  timestamp: string;
}

// ============================================================================
// PDF Upload Types
// ============================================================================

export interface PDFUploadResult {
  success: boolean;
  fileName: string;
  fileSize: number;
  extractedBiomarkers?: Biomarkers;
  error?: string;
}

export interface DocumentAIResult {
  success: boolean;
  extractedText: string;
  biomarkers: Biomarkers;
  confidence: number;
  error?: string;
}

// ============================================================================
// Questionnaire Types
// ============================================================================

// Legacy questionnaire (kept for backward compatibility)
export interface QuestionnaireData {
  // Personal info
  age: number;

  // Menstrual cycle
  cycleStatus: CycleStatus;
  cycleLength?: number;
  lastPeriodDate?: string;

  // Symptoms (multi-select)
  symptoms: string[];
  symptomSeverity?: Record<string, number>; // 1-10 scale

  // Lifestyle
  sleepHours: number;
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  exerciseFrequency: ExerciseFrequency;
  exerciseTypes?: string[];
  stressLevel: StressLevel;
  dietType?: string;

  // Health goals
  goals: string[];

  // Medical history
  conditions?: string[];
  medications?: string[];
  supplements?: string[];
  allergies?: string[];

  // Additional notes
  additionalInfo?: string;
}

// New comprehensive questionnaire types
export type AgeRange = '18-25' | '25-35' | '35-45' | '45-55' | '55-65' | '65+';
export type DeskJobStatus = 'yes' | 'no' | 'mixed';
export type DailySteps = '<3000' | '3000-6000' | '6000-10000' | '10000+';
export type TrainingFrequency = 'never' | '1-2x' | '3-4x' | '5+';
export type TrainingType = 'cardio' | 'strength' | 'mobility' | 'mixed' | 'none';
export type SleepHoursRange = '<5' | '5-6' | '6-7' | '7-8' | '>8';
export type SleepQualityLevel = 'poor' | 'average' | 'good' | 'excellent';
export type SleepRegularity = 1 | 2 | 3 | 4;
export type BalancedDiet = 'yes' | 'no' | 'dont-know';
export type DietaryRestriction = 'none' | 'vegetarian' | 'vegan' | 'low-carb' | 'lactose-free' | 'gluten-free' | 'paleo' | 'other';
export type NutritionalDeficiencies = 'yes' | 'no' | 'think-yes' | 'think-no';
export type SubstanceUse = 'never' | 'occasionally' | 'frequently';
export type SubstanceUseFrequency = 'daily' | 'few-times-week' | 'once-week' | 'few-times-month' | 'specific-occasions';
export type StressLevelScale = 1 | 2 | 3 | 4 | 5;
export type StressReductionFrequency = 'never' | 'occasionally' | 'regularly';
export type MenopauseStatus = 'yes' | 'no' | 'prefer-not-answer';
export type HormonalContraception = 'yes' | 'no' | 'prefer-not-answer';
export type PregnancyStatus = 'currently-pregnant' | 'planning-pregnancy' | 'previously-pregnant' | 'not-applicable' | 'prefer-not-answer';
export type PrimaryGoal = 'improve-energy' | 'optimize-performance' | 'prevent-diseases' | 'live-longer' | 'general-curiosity';
export type ResultsPreference = 'simple' | 'detailed' | 'both';

export interface ComprehensiveQuestionnaireData {
  // Section 1: Basic Information
  firstName?: string;
  isWoman: boolean;
  ageRange: AgeRange;
  height: number; // in meters
  weight: number; // in kg

  // Section 2: Activity & Movement
  hasDeskJob: DeskJobStatus;
  dailySteps: DailySteps;
  weeklyTrainingFrequency: TrainingFrequency;
  trainingTypes: TrainingType[];

  // Section 3: Sleep & Recovery
  sleepHours: SleepHoursRange;
  sleepQuality: SleepQualityLevel;
  sleepRegularity: SleepRegularity;

  // Section 4: Nutrition & Lifestyle
  balancedDiet: BalancedDiet;
  dietaryRestriction: DietaryRestriction;
  dietaryRestrictionOther?: string;
  nutritionalDeficiencies: NutritionalDeficiencies;
  substanceUse: SubstanceUse;
  substanceUseFrequency?: SubstanceUseFrequency;

  // Section 5: Stress & Mental Health
  stressLevel: StressLevelScale;
  stressReductionFrequency: StressReductionFrequency;

  // Section 6: Hormonal & Reproductive Status
  menopauseStatus: MenopauseStatus;
  hormonalContraception?: HormonalContraception;
  pregnancyStatus: PregnancyStatus;

  // Section 7: Goals & Expectations
  primaryGoals: PrimaryGoal[];
  resultsPreference: ResultsPreference;
  additionalInfo?: string;
}

// ============================================================================
// Common Symptoms List
// ============================================================================

export const COMMON_SYMPTOMS = [
  'Fatigue',
  'Brain fog',
  'Low energy',
  'Difficulty sleeping',
  'Anxiety',
  'Depression',
  'Mood swings',
  'Weight gain',
  'Weight loss',
  'Hair loss',
  'Dry skin',
  'Cold intolerance',
  'Heat intolerance',
  'Irregular periods',
  'Heavy periods',
  'Painful periods',
  'Hot flashes',
  'Night sweats',
  'Low libido',
  'Headaches',
  'Joint pain',
  'Muscle weakness',
  'Digestive issues',
  'Bloating',
  'Food sensitivities',
] as const;

// ============================================================================
// Health Goals List
// ============================================================================

export const HEALTH_GOALS = [
  'Increase energy levels',
  'Improve sleep quality',
  'Optimize weight',
  'Reduce inflammation',
  'Balance hormones',
  'Improve mental clarity',
  'Reduce stress',
  'Enhance athletic performance',
  'Support fertility',
  'Manage menopause symptoms',
  'Improve skin health',
  'Strengthen immune system',
  'Optimize longevity',
  'Prevent chronic disease',
] as const;
