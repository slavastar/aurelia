'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Biomarkers, QuestionnaireData } from '@/types';
import HealthScoreGauge from '@/components/results/HealthScoreGauge';
import BiomarkerChart from '@/components/results/BiomarkerChart';
import PDFExport from '@/components/results/PDFExport';
import { AlertTriangle, TrendingUp, Activity, Heart, BarChart3, Lightbulb } from 'lucide-react';
import { saveHistoricalEntry } from '@/lib/storage/history';
import toast, { Toaster } from 'react-hot-toast';
import { useAchievements } from '@/lib/achievements/useAchievements';
import UnlockAnimation from '@/components/achievements/UnlockAnimation';
import { Trophy } from 'lucide-react';
import Header from '@/components/ui/Header';

interface AnalysisResult {
  success: boolean;
  isEmergency: boolean;
  emergencyMessage?: string;
  mlRiskScore?: number;
  mlConfidence?: number;
  riskFactors?: string[];
  aureliaAnalysis?: string;
  error?: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [biomarkers, setBiomarkers] = useState<Biomarkers>({});
  const [questionnaireData, setQuestionnaireData] = useState<any | null>(null);
  
  // Achievement tracking
  const {
    checkForNewAchievements,
    showUnlockAnimation,
    currentUnlock,
    handleCloseAnimation
  } = useAchievements();

  useEffect(() => {
    // Load data from storage
    const uploadResultStr = sessionStorage.getItem('uploadResult');
    const questionnaireStr = localStorage.getItem('aurelia_questionnaire_data');

    if (!uploadResultStr || !questionnaireStr) {
      router.push('/upload');
      return;
    }

    const uploadResult = JSON.parse(uploadResultStr);
    const questionnaireDataParsed = JSON.parse(questionnaireStr);

    // Extract biomarkers from upload result
    // Assuming uploadResult.parsing.biomarkers is the correct path based on UploadPage
    const biomarkersData = uploadResult.parsing?.biomarkers || {};

    setBiomarkers(biomarkersData);
    setQuestionnaireData(questionnaireDataParsed);

    // Call analysis API
    analyzeData(biomarkersData, questionnaireDataParsed);
  }, [router]);

  const analyzeData = async (biomarkers: Biomarkers, questionnaire: any) => {
    try {
      // Construct cycle_status
      let cycleStatus = 'Regular';
      if (questionnaire.menopauseStatus && questionnaire.menopauseStatus !== 'No') {
        cycleStatus = questionnaire.menopauseStatus;
      } else if (questionnaire.pregnancyStatus && questionnaire.pregnancyStatus !== 'No') {
        cycleStatus = questionnaire.pregnancyStatus;
      } else if (questionnaire.hormonalContraception && questionnaire.hormonalContraception !== 'None') {
        cycleStatus = `Contraception: ${questionnaire.hormonalContraception}`;
      }

      // Construct symptoms
      const symptoms = [];
      if (questionnaire.nutritionalDeficiencies && questionnaire.nutritionalDeficiencies !== 'None') {
        symptoms.push(`Deficiency: ${questionnaire.nutritionalDeficiencies}`);
      }

      // Parse age
      let age = 30; // Default
      if (questionnaire.ageRange) {
        const match = questionnaire.ageRange.match(/(\d+)/);
        if (match) age = parseInt(match[0]);
      }

      // Parse height and weight
      const height = parseInt(questionnaire.height) || 165;
      const weight = parseInt(questionnaire.weight) || 60;

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          biomarkers,
          context: {
            age: age,
            height: height,
            weight: weight,
            cycle_status: cycleStatus,
            symptoms: symptoms,
            goals: questionnaire.goals || questionnaire.primaryGoals,
            face_photo: questionnaire.facePhoto, // Base64 string
            lifestyle: {
              sleep_hours: questionnaire.sleepHours,
              exercise_frequency: questionnaire.workoutFreq, // Mapped
              stress_level: questionnaire.stressLevel,
              diet_type: questionnaire.dietType,
              // supplements: questionnaire.supplements, // Not in new questionnaire?
            },
            medical_history: {
              // conditions: questionnaire.conditions,
              // medications: questionnaire.medications,
              // allergies: questionnaire.allergies,
            },
            other_info: questionnaire.otherInfo || questionnaire.additionalInfo // Added
          },
        }),
      });

      const data = await response.json();
      setResult(data);

      // Save to history if successful and not emergency
      if (data.success && !data.isEmergency) {
        saveHistoricalEntry(
          biomarkers,
          questionnaire,
          {
            mlRiskScore: data.mlRiskScore || 0,
            mlConfidence: data.mlConfidence || 0,
            riskFactors: data.riskFactors || [],
            aureliaAnalysis: data.aureliaAnalysis || '',
          }
        );
        toast.success('Analysis saved to your dashboard!');
        
        // Check for newly unlocked achievements
        setTimeout(() => {
          checkForNewAchievements();
        }, 1000);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setResult({
        success: false,
        isEmergency: false,
        error: 'Failed to analyze data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    sessionStorage.clear();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-aurelia-lime animate-spin"></div>
            <Heart className="absolute inset-0 m-auto w-10 h-10 text-aurelia-lime animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Health Data</h2>
          <p className="text-white/60">AUREL✦A is generating your personalized insights...</p>
        </div>
      </div>
    );
  }

  if (result?.isEmergency) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-900/20 backdrop-blur-md rounded-2xl shadow-xl p-8 border-4 border-red-500/50">
            <div className="flex items-start gap-4 mb-6">
              <AlertTriangle className="w-16 h-16 text-red-500 flex-shrink-0" />
              <div>
                <h1 className="text-3xl font-bold text-red-400 mb-4">Immediate Medical Attention Required</h1>
                <div className="prose prose-invert">
                  <p className="text-lg text-red-200 whitespace-pre-line">{result.emergencyMessage}</p>
                </div>
              </div>
            </div>
            <div className="mt-8 p-6 bg-red-500/10 border-2 border-red-500/30 rounded-lg">
              <p className="text-sm text-red-200 font-medium mb-4">
                ⚠️ Please contact your healthcare provider immediately or visit the nearest emergency room.
              </p>
              <div className="flex gap-4">
                <a
                  href="tel:911"
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-center"
                >
                  Call Emergency Services
                </a>
                <button
                  onClick={handleStartOver}
                  className="flex-1 px-6 py-3 border-2 border-red-500 text-red-400 rounded-lg font-semibold hover:bg-red-500/10 transition"
                >
                  Return Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result?.success) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Analysis Failed</h2>
            <p className="text-white/60 mb-6">{result?.error || 'An unexpected error occurred'}</p>
            <button
              onClick={handleStartOver}
              className="px-6 py-3 gradient-aurelia-lime text-aurelia-purple rounded-lg font-semibold hover:opacity-90 transition"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="py-12 px-4">
        <Toaster position="top-right" />
      
        {/* Achievement Unlock Animation */}
        {showUnlockAnimation && currentUnlock && (
          <UnlockAnimation
            achievement={currentUnlock}
            onClose={handleCloseAnimation}
          />
        )}
      
        <div className="max-w-7xl mx-auto">
          {/* Header */}
                    <div className="text-center mb-12">
            <h1 className="text-5xl font-bold gradient-aurelia-text-lime mb-4 flex items-center justify-center gap-3">
              Your
              <Image src="/logo.svg" alt="Aurelia" width={200} height={60} className="h-14 w-auto" />
              Analysis
            </h1>
            <p className="text-xl text-white/80">
              Based on your blood work and questionnaire
            </p>
          </div>

        {/* Health Score Section */}
        {result.mlRiskScore !== undefined && (
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-8 h-8 text-aurelia-lime" />
              <h2 className="text-2xl font-bold text-white">Your Health Score</h2>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <HealthScoreGauge score={result.mlRiskScore} size="md" />
              </div>

              <div className="flex-1 space-y-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-aurelia-lime" />
                    <h3 className="font-semibold text-white">Analysis Confidence</h3>
                  </div>
                  <p className="text-3xl font-bold text-aurelia-lime">
                    {((result.mlConfidence || 0) * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-white/60 mt-1">
                    Based on {Object.keys(biomarkers).length} biomarkers and your health profile
                  </p>
                </div>

                {result.riskFactors && result.riskFactors.length > 0 && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <h3 className="font-semibold text-amber-200 mb-3">Areas of Focus:</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.riskFactors.map((factor, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-200 rounded-full text-sm font-medium"
                        >
                          {factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Biomarker Visualization */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-8 h-8 text-aurelia-lime" />
            <h2 className="text-2xl font-bold text-white">Your Biomarkers</h2>
          </div>
          <BiomarkerChart biomarkers={biomarkers as Record<string, number>} />
          
          <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-sm text-white/80">
              <strong>How to read this chart:</strong> Your values are shown in color (green = optimal, amber = attention needed, red = warning). 
              The gray bars show optimal target ranges for comparison.
            </p>
          </div>
        </div>

        {/* AUREL✦A Analysis Report */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-8 h-8 text-aurelia-lime" />
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Image src="/logo.svg" alt="Aurelia" width={120} height={36} className="h-8 w-auto" />
              Personalized Analysis
            </h2>
          </div>
          
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="whitespace-pre-line text-white/90 leading-relaxed">
              {result.aureliaAnalysis}
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4 text-aurelia-lime">Save Your Report</h2>
          <p className="mb-6 text-white/80">
            Download your personalized health analysis to share with your healthcare provider or keep for your records.
          </p>
          <PDFExport
            analysisData={{
              mlRiskScore: result.mlRiskScore || 0,
              riskFactors: result.riskFactors || [],
              aureliaAnalysis: result.aureliaAnalysis || '',
              biomarkers: biomarkers as Record<string, number>,
              context: {
                age: questionnaireData?.age || 0,
                cycle_status: questionnaireData?.cycleStatus || '',
                symptoms: questionnaireData?.symptoms || [],
                goals: questionnaireData?.goals || [],
              },
            }}
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => router.push('/recommendations')}
            className="px-8 py-4 gradient-aurelia-lime text-aurelia-purple rounded-xl font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <Lightbulb className="w-5 h-5" />
            Action Plan
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-4 bg-white/10 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => router.push('/achievements')}
            className="px-8 py-4 bg-white/10 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Achievements
          </button>
          <button
            onClick={handleStartOver}
            className="px-8 py-4 bg-white/10 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all transform hover:scale-105 shadow-lg"
          >
            New Analysis
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-transparent border-2 border-aurelia-lime text-aurelia-lime rounded-xl font-semibold hover:bg-aurelia-lime/10 transition-all"
          >
            Home
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-2">Important Medical Disclaimer</h3>
              <p className="text-sm text-white/60">
                This analysis is for informational and educational purposes only. 
                AURELIA does not diagnose, treat, or cure any condition. The insights provided are based on 
                general health principles and should not replace professional medical advice. Always consult 
                with qualified healthcare professionals for medical advice, diagnosis, or treatment decisions. 
                If you experience severe symptoms or have concerns about your health, seek immediate medical attention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
