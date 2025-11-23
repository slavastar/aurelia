/**
 * Recommendation Generator
 * Creates personalized health recommendations based on biomarkers and risk factors
 */

import { Biomarkers } from '@/types';

export interface Recommendation {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionSteps: string[];
  resources?: Array<{
    title: string;
    url: string;
  }>;
}

/**
 * Generate personalized recommendations based on biomarkers and risk factors
 */
export function generateRecommendations(
  biomarkers: Biomarkers,
  riskFactors: string[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Check HbA1c (Glucose Control)
  if (biomarkers.HbA1c !== undefined) {
    if (biomarkers.HbA1c > 5.6) {
      recommendations.push({
        category: 'Metabolic Health',
        title: 'Optimize Blood Sugar Control',
        description: `Your HbA1c is ${biomarkers.HbA1c}%, which is above the optimal range. This indicates your average blood sugar levels over the past 3 months need attention.`,
        priority: biomarkers.HbA1c > 6.4 ? 'high' : 'medium',
        actionSteps: [
          'Reduce refined carbohydrates and added sugars in your diet',
          'Incorporate 30 minutes of moderate exercise daily (walking, cycling, swimming)',
          'Practice time-restricted eating (12-14 hour overnight fast)',
          'Consider adding cinnamon and apple cider vinegar to your routine',
          'Monitor your blood sugar levels and track patterns',
        ],
        resources: [
          {
            title: 'Understanding HbA1c and Blood Sugar',
            url: 'https://www.diabetes.org/a1c',
          },
          {
            title: 'Low Glycemic Index Foods Guide',
            url: 'https://www.health.harvard.edu/diseases-and-conditions/glycemic-index-and-glycemic-load-for-100-foods',
          },
        ],
      });
    }
  }

  // Check Ferritin (Iron Stores)
  if (biomarkers.Ferritin !== undefined) {
    if (biomarkers.Ferritin < 50) {
      recommendations.push({
        category: 'Energy & Vitality',
        title: 'Boost Iron Stores',
        description: `Your ferritin is ${biomarkers.Ferritin} ng/mL. For women, optimal ferritin should be 50-150 ng/mL for energy and vitality. Low ferritin is a common cause of fatigue.`,
        priority: biomarkers.Ferritin < 30 ? 'high' : 'medium',
        actionSteps: [
          'Increase iron-rich foods: red meat, liver, spinach, lentils, pumpkin seeds',
          'Pair iron sources with vitamin C (citrus, bell peppers) for better absorption',
          'Avoid tea and coffee within 1 hour of iron-rich meals',
          'Consider iron supplementation (consult your doctor for dosage)',
          'Cook in cast iron cookware to increase dietary iron',
          'Get retested in 3 months to track progress',
        ],
        resources: [
          {
            title: 'Iron-Rich Foods for Women',
            url: 'https://www.healthline.com/nutrition/iron-rich-plant-foods',
          },
          {
            title: 'Understanding Ferritin Levels',
            url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4836595/',
          },
        ],
      });
    }
  }

  // Check CRP (Inflammation)
  if (biomarkers.CRP !== undefined) {
    if (biomarkers.CRP > 3) {
      recommendations.push({
        category: 'Inflammation Control',
        title: 'Reduce Systemic Inflammation',
        description: `Your CRP is ${biomarkers.CRP} mg/L, indicating elevated inflammation. Chronic inflammation is linked to accelerated aging and disease risk.`,
        priority: biomarkers.CRP > 10 ? 'high' : 'medium',
        actionSteps: [
          'Adopt an anti-inflammatory diet rich in omega-3s, colorful vegetables, and berries',
          'Eliminate or reduce processed foods, refined sugars, and trans fats',
          'Incorporate turmeric, ginger, and green tea into your daily routine',
          'Prioritize 7-9 hours of quality sleep per night',
          'Practice stress management (meditation, yoga, deep breathing)',
          'Consider omega-3 supplementation (EPA/DHA 1-2g daily)',
        ],
        resources: [
          {
            title: 'Anti-Inflammatory Diet Guide',
            url: 'https://www.health.harvard.edu/staying-healthy/foods-that-fight-inflammation',
          },
          {
            title: 'Understanding CRP and Health',
            url: 'https://www.mayoclinic.org/tests-procedures/c-reactive-protein-test/about/pac-20385228',
          },
        ],
      });
    }
  }

  // Check TSH (Thyroid Function)
  if (biomarkers.TSH !== undefined) {
    if (biomarkers.TSH > 2.5 || biomarkers.TSH < 0.5) {
      recommendations.push({
        category: 'Thyroid Health',
        title: 'Optimize Thyroid Function',
        description: `Your TSH is ${biomarkers.TSH} mIU/L. Optimal TSH for women is typically 0.5-2.5 mIU/L. Thyroid health is crucial for metabolism, energy, and mood.`,
        priority: biomarkers.TSH > 4.5 || biomarkers.TSH < 0.4 ? 'high' : 'medium',
        actionSteps: [
          'Ensure adequate iodine intake (seaweed, iodized salt, fish)',
          'Support thyroid with selenium-rich foods (Brazil nuts, eggs, fish)',
          'Avoid excessive raw cruciferous vegetables if hypothyroid',
          'Manage stress levels (cortisol affects thyroid function)',
          'Consider testing for thyroid antibodies (TPO, TG)',
          'Consult an endocrinologist for comprehensive thyroid panel',
        ],
        resources: [
          {
            title: 'Thyroid Function and Women\'s Health',
            url: 'https://www.thyroid.org/thyroid-function-tests/',
          },
          {
            title: 'Nutrition for Thyroid Health',
            url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6822815/',
          },
        ],
      });
    }
  }

  // Check Vitamin D
  if (biomarkers.VitaminD !== undefined) {
    if (biomarkers.VitaminD < 40) {
      recommendations.push({
        category: 'Immune & Bone Health',
        title: 'Optimize Vitamin D Levels',
        description: `Your vitamin D is ${biomarkers.VitaminD} ng/mL. Optimal levels are 40-80 ng/mL for immune function, bone health, and mood regulation.`,
        priority: biomarkers.VitaminD < 20 ? 'high' : 'medium',
        actionSteps: [
          'Get 15-20 minutes of midday sun exposure (without sunscreen) several times per week',
          'Supplement with vitamin D3: 2000-4000 IU daily (adjust based on levels)',
          'Take vitamin D with a meal containing healthy fats for better absorption',
          'Include vitamin D-rich foods: fatty fish, egg yolks, fortified foods',
          'Retest in 3 months to ensure levels are improving',
        ],
        resources: [
          {
            title: 'Vitamin D and Women\'s Health',
            url: 'https://www.health.harvard.edu/staying-healthy/vitamin-d-and-your-health',
          },
          {
            title: 'Safe Sun Exposure Guidelines',
            url: 'https://www.skincancer.org/blog/sun-protection-and-vitamin-d/',
          },
        ],
      });
    }
  }

  // Check B12
  if (biomarkers.B12 !== undefined) {
    if (biomarkers.B12 < 400) {
      recommendations.push({
        category: 'Neurological Health',
        title: 'Boost Vitamin B12 Levels',
        description: `Your B12 is ${biomarkers.B12} pg/mL. Optimal levels are 400-900 pg/mL for energy, cognitive function, and nerve health.`,
        priority: biomarkers.B12 < 200 ? 'high' : 'low',
        actionSteps: [
          'Increase B12-rich foods: meat, fish, eggs, dairy products',
          'If vegetarian/vegan, supplement with methylcobalamin B12 (1000 mcg daily)',
          'Consider sublingual B12 for better absorption',
          'Check for absorption issues (intrinsic factor, stomach acid)',
          'Retest in 2-3 months',
        ],
        resources: [
          {
            title: 'Vitamin B12 Deficiency in Women',
            url: 'https://www.healthline.com/nutrition/vitamin-b12-deficiency-symptoms',
          },
        ],
      });
    }
  }

  // General recommendations based on risk factors
  if (riskFactors.includes('low_ferritin') || riskFactors.includes('fatigue')) {
    if (!recommendations.some(r => r.category === 'Energy & Vitality')) {
      recommendations.push({
        category: 'Energy & Vitality',
        title: 'Combat Fatigue',
        description: 'Address underlying causes of low energy and optimize daily vitality.',
        priority: 'medium',
        actionSteps: [
          'Prioritize 7-9 hours of quality sleep with consistent sleep/wake times',
          'Stay hydrated (aim for 2-3 liters of water daily)',
          'Balance blood sugar with protein at every meal',
          'Take short movement breaks every hour',
          'Limit caffeine after 2 PM',
        ],
        resources: [
          {
            title: 'Energy Optimization Guide',
            url: 'https://www.sleepfoundation.org/sleep-hygiene',
          },
        ],
      });
    }
  }

  // Menstrual cycle support
  if (riskFactors.includes('cycle_irregularity') || riskFactors.includes('pms')) {
    recommendations.push({
      category: 'Hormonal Balance',
      title: 'Support Menstrual Cycle Health',
      description: 'Optimize hormonal balance for regular, comfortable cycles.',
      priority: 'medium',
      actionSteps: [
        'Track your cycle to identify patterns (use an app or journal)',
        'Support liver detoxification with cruciferous vegetables',
        'Ensure adequate magnesium intake (dark leafy greens, nuts, seeds)',
        'Manage stress during luteal phase (days 15-28)',
        'Consider seed cycling (flax/pumpkin in follicular, sesame/sunflower in luteal)',
        'Limit alcohol and caffeine, especially in luteal phase',
      ],
      resources: [
        {
          title: 'Understanding Your Menstrual Cycle',
          url: 'https://www.acog.org/womens-health/faqs/your-menstrual-cycle',
        },
      ],
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Get quick wins - easy, high-impact recommendations
 */
export function getQuickWins(recommendations: Recommendation[]): Recommendation[] {
  return recommendations
    .filter(r => r.priority === 'high' || r.priority === 'medium')
    .slice(0, 3);
}

/**
 * Get lifestyle recommendations
 */
export function getLifestyleRecommendations(): Recommendation[] {
  return [
    {
      category: 'Sleep Optimization',
      title: 'Master Your Sleep',
      description: 'Quality sleep is the foundation of health, affecting everything from hormones to immune function.',
      priority: 'high',
      actionSteps: [
        'Maintain consistent sleep/wake times (even on weekends)',
        'Create a dark, cool bedroom (65-68°F)',
        'Avoid screens 1-2 hours before bed',
        'Use blackout curtains or sleep mask',
        'Consider magnesium glycinate before bed',
      ],
      resources: [
        {
          title: 'Sleep Hygiene Guide',
          url: 'https://www.sleepfoundation.org/sleep-hygiene',
        },
      ],
    },
    {
      category: 'Stress Management',
      title: 'Build Stress Resilience',
      description: 'Chronic stress accelerates aging and disrupts hormones. Building resilience is key.',
      priority: 'high',
      actionSteps: [
        'Practice daily meditation or deep breathing (even 5 minutes helps)',
        'Spend time in nature regularly',
        'Maintain strong social connections',
        'Set boundaries with work and technology',
        'Consider adaptogenic herbs (ashwagandha, rhodiola)',
      ],
      resources: [
        {
          title: 'Stress Management Techniques',
          url: 'https://www.apa.org/topics/stress/manage',
        },
      ],
    },
    {
      category: 'Movement & Exercise',
      title: 'Move Your Body Daily',
      description: 'Regular movement is medicine for body and mind, supporting longevity at every level.',
      priority: 'medium',
      actionSteps: [
        'Aim for 150 minutes of moderate activity per week',
        'Include strength training 2-3x per week',
        'Take walking breaks throughout the day',
        'Try activities you enjoy (dance, hiking, swimming)',
        'Sync exercise with your menstrual cycle (intense in follicular, gentle in luteal)',
      ],
      resources: [
        {
          title: 'Exercise Guidelines for Women',
          url: 'https://www.cdc.gov/physicalactivity/basics/adults/index.htm',
        },
      ],
    },
  ];
}
