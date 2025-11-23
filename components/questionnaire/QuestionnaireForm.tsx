"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, AlertCircle, ChevronRight, Upload, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for the form data
export type QuestionnaireData = {
  firstName: string;
  isWoman: boolean | null;
  ageRange: string;
  height: string;
  weight: string;

  deskJob: string;
  dailySteps: string;
  workoutFreq: string;
  workoutType: string[];

  sleepHours: string;
  sleepQuality: string;
  sleepRegularity: string;

  dietBalanced: string;
  dietType: string;
  dietOther: string;
  nutritionalDeficiencies: string;
  substanceUsage: string;
  substanceFrequency: string;

  stressLevel: number;
  stressReduction: string;

  menopause: string;
  hormonalContraception: string;
  pregnancyStatus: string;

  goals: string[];
  resultPreference: string;
  otherInfo: string;
  facePhoto?: string; // Base64 string
};

const initialData: QuestionnaireData = {
  firstName: '',
  isWoman: null,
  ageRange: '',
  height: '',
  weight: '',

  deskJob: '',
  dailySteps: '',
  workoutFreq: '',
  workoutType: [],

  sleepHours: '',
  sleepQuality: '',
  sleepRegularity: '',

  dietBalanced: '',
  dietType: '',
  dietOther: '',
  nutritionalDeficiencies: '',
  substanceUsage: '',
  substanceFrequency: '',

  stressLevel: 0,
  stressReduction: '',

  menopause: '',
  hormonalContraception: '',
  pregnancyStatus: '',

  goals: [],
  resultPreference: '',
  otherInfo: '',
  facePhoto: '',
};

export default function QuestionnaireForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<QuestionnaireData>(initialData);
  const [direction, setDirection] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 8) {
        // Save data to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('aurelia_questionnaire_data', JSON.stringify(formData));
        }
        router.push('/upload');
        return;
      }
      setDirection(1);
      setStep(prev => prev + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(prev => prev - 1);
    setError(null);
  };

  const updateField = (field: keyof QuestionnaireData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error if field is updated
    if (error) setError(null);
  };

  const toggleSelection = (field: keyof QuestionnaireData, value: string, max?: number) => {
    setFormData(prev => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        if (max && current.length >= max) return prev;
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Allow up to 10MB initially, we will resize it
      if (file.size > 10 * 1024 * 1024) {
        setError("File size too large. Please upload a photo under 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Resize image to avoid localStorage limits
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG with 0.8 quality
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            updateField('facePhoto', dataUrl);
          } else {
            // Fallback if canvas fails
            updateField('facePhoto', reader.result as string);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    // Basic validation logic
    switch (currentStep) {
      case 0: // Intro
        return true;
      case 1: // Basic Info
        if (!formData.firstName) { setError("Please enter your first name"); return false; }
        if (formData.isWoman === null) { setError("Please answer the gender question"); return false; }
        if (formData.isWoman === false) { return false; } // Handled in UI
        if (!formData.ageRange) { setError("Please select your age range"); return false; }
        if (!formData.height) { setError("Please enter your height"); return false; }
        if (!formData.weight) { setError("Please enter your weight"); return false; }
        return true;
      case 2: // Activity
        if (!formData.deskJob) { setError("Please answer the question about your job"); return false; }
        if (!formData.dailySteps) { setError("Please enter your daily steps"); return false; }
        if (!formData.workoutFreq) { setError("Please enter your workout frequency"); return false; }
        // Workout type is optional or can be "None"
        return true;
      case 3: // Sleep
        if (!formData.sleepHours) { setError("Please enter your sleep hours"); return false; }
        if (!formData.sleepQuality) { setError("Please rate your sleep quality"); return false; }
        if (!formData.sleepRegularity) { setError("Please enter your sleep regularity"); return false; }
        return true;
      case 4: // Nutrition
        if (!formData.dietBalanced) { setError("Please answer about diet balance"); return false; }
        if (!formData.dietType) { setError("Please select your diet type"); return false; }
        if (formData.dietType === 'Other' && !formData.dietOther) { setError("Please specify your diet"); return false; }
        if (!formData.nutritionalDeficiencies) { setError("Please answer about deficiencies"); return false; }
        if (!formData.substanceUsage) { setError("Please answer about substance usage"); return false; }
        if (formData.substanceUsage !== 'Never' && !formData.substanceFrequency) { setError("Please specify the frequency"); return false; }
        return true;
      case 5: // Stress
        if (formData.stressLevel === 0) { setError("Please rate your stress level"); return false; }
        if (!formData.stressReduction) { setError("Please answer about stress reduction activities"); return false; }
        return true;
      case 6: // Hormonal
        if (!formData.menopause) { setError("Please answer about menopause"); return false; }
        if (formData.menopause === 'No' && !formData.hormonalContraception) { setError("Please answer about contraception"); return false; }
        if (!formData.pregnancyStatus) { setError("Please answer about pregnancy"); return false; }
        return true;
      case 7: // Face Analysis (Optional)
        return true;
      case 8: // Goals
        if (formData.goals.length === 0) { setError("Please select at least one goal"); return false; }
        if (!formData.resultPreference) { setError("Please choose your result preference"); return false; }
        return true;
      default:
        return true;
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  if (formData.isWoman === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#241647] text-white p-6">
        <div className="max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-aurelia-lime" />
          </div>
          <h2 className="text-3xl font-bold">Sorry!</h2>
          <p className="text-lg text-white/80">
            This application is specifically designed for female physiology and health. The algorithms and recommendations would not be suitable for you.
          </p>
          <button
            onClick={() => updateField('isWoman', null)}
            className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurelia-purple-dark flex flex-col text-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-2 bg-white/10 z-50">
        <motion.div
          className="h-full bg-aurelia-lime"
          initial={{ width: 0 }}
          animate={{ width: `${(step / 7) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-6 pt-12 md:pt-24 pb-24">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="flex-1"
          >
            {step === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center space-y-8">
                <div className="w-24 h-24 bg-aurelia-lime/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">👋</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  It will only take a minute — let's get to know each other!
                </h1>
                <p className="text-xl text-white/80 max-w-xl">
                  We will personalize your experience to offer you the best possible recommendations.
                </p>
                <button
                  onClick={handleNext}
                  className="group flex items-center gap-2 bg-aurelia-lime text-aurelia-purple px-8 py-4 rounded-full text-lg font-medium hover:bg-aurelia-accent transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  Start
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-12">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-aurelia-lime">Basic Information</h2>
                  <p className="text-white/60">Let's start with introductions.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      👋 Before we start, what is your first name?
                    </label>
                    <p className="text-sm text-white/50 italic">
                      (This just helps us personalize your experience — you can skip this question if you want!)
                    </p>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      placeholder="Your first name"
                      className="w-full text-2xl p-4 border-b-2 border-white/20 focus:border-aurelia-lime outline-none bg-transparent transition-colors placeholder:text-white/20 text-white"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      ⚧️ Are you a woman?
                    </label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField('isWoman', option === 'Yes')}
                          className={cn(
                            "flex-1 py-4 px-6 rounded-xl border-2 text-lg font-medium transition-all",
                            (option === 'Yes' && formData.isWoman === true) || (option === 'No' && formData.isWoman === false)
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      🎂 What is your age range?
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['18–25', '25–35', '35–45', '45–55', '55–65', '65+'].map((age) => (
                        <button
                          key={age}
                          onClick={() => updateField('ageRange', age)}
                          className={cn(
                            "py-3 px-4 rounded-xl border-2 font-medium transition-all",
                            formData.ageRange === age
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="block text-xl font-medium text-white">
                        What is your height? (in m)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.height}
                        onChange={(e) => updateField('height', e.target.value)}
                        placeholder="1.65"
                        className="w-full text-2xl p-4 border-b-2 border-white/20 focus:border-aurelia-lime outline-none bg-transparent transition-colors placeholder:text-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-xl font-medium text-white">
                        What is your weight? (in kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => updateField('weight', e.target.value)}
                        placeholder="60"
                        className="w-full text-2xl p-4 border-b-2 border-white/20 focus:border-aurelia-lime outline-none bg-transparent transition-colors placeholder:text-white/20 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-12">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-aurelia-lime">Activity & Movement</h2>
                  <p className="text-white/60">Let's talk about your physical activity level.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      💻 Do you have a desk job (mostly sedentary)?
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {['Yes', 'No', 'Mixed'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField('deskJob', option)}
                          className={cn(
                            "flex-1 min-w-[100px] py-3 px-6 rounded-xl border-2 font-medium transition-all",
                            formData.deskJob === option
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      🚶 How many steps do you usually take per day?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['<3 000', '3 000–6 000', '6 000–10 000', '10 000+'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField('dailySteps', option)}
                          className={cn(
                            "py-3 px-4 rounded-xl border-2 font-medium transition-all text-left",
                            formData.dailySteps === option
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      💪 How often do you workout per week?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['Never', '1–2x', '3–4x', '5+'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField('workoutFreq', option)}
                          className={cn(
                            "py-3 px-4 rounded-xl border-2 font-medium transition-all",
                            formData.workoutFreq === option
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      🏋️ What type of workout do you do most often?
                    </label>
                    <p className="text-sm text-white/50">(Multiple choice)</p>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        'Cardio (e.g. running)',
                        'Strength training (e.g. weightlifting)',
                        'Mobility (e.g. yoga)',
                        'Mixed',
                        'None'
                      ].map((option) => (
                        <button
                          key={option}
                          onClick={() => toggleSelection('workoutType', option)}
                          className={cn(
                            "py-3 px-6 rounded-xl border-2 font-medium transition-all text-left flex items-center justify-between",
                            formData.workoutType.includes(option)
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                          {formData.workoutType.includes(option) && <Check className="w-5 h-5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-12">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-aurelia-lime">Sleep & Recovery</h2>
                  <p className="text-white/60">Sleep is the pillar of health.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      😴 On average, how many hours do you sleep per night?
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {['<5', '5–6', '6–7', '7–8', '>8'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField('sleepHours', option)}
                          className={cn(
                            "flex-1 min-w-[80px] py-3 px-4 rounded-xl border-2 font-medium transition-all",
                            formData.sleepHours === option
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      🌙 How would you rate your sleep quality?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['Bad', 'Average', 'Good', 'Excellent'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField('sleepQuality', option)}
                          className={cn(
                            "py-3 px-4 rounded-xl border-2 font-medium transition-all",
                            formData.sleepQuality === option
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      🕰️ Is your sleep regular?
                    </label>
                    <p className="text-sm text-white/50">
                      (Do you go to bed and wake up at about the same time every day?)
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {['Not regular at all', 'Somewhat regular', 'Fairly regular', 'Very regular'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField('sleepRegularity', option)}
                          className={cn(
                            "py-3 px-6 rounded-xl border-2 font-medium transition-all text-left",
                            formData.sleepRegularity === option
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-12">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-aurelia-lime">Nutrition & Lifestyle</h2>
                  <p className="text-white/60">Tell us more about your habits.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      🥦 Would you say your diet is balanced?
                    </label>
                    <div className="flex gap-3">
                      {['Yes', 'No', 'I don\'t know'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField('dietBalanced', option)}
                          className={cn(
                            "flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all",
                            formData.dietBalanced === option
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      🍽️ Do you follow a specific diet?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'No', 'Vegetarian', 'Vegan', 'Low-carb',
                        'Lactose-free', 'Gluten-free', 'Paleo', 'Other'
                      ].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField('dietType', option)}
                          className={cn(
                            "py-3 px-4 rounded-xl border-2 font-medium transition-all text-left",
                            formData.dietType === option
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {formData.dietType === 'Other' && (
                      <input
                        type="text"
                        value={formData.dietOther}
                        onChange={(e) => updateField('dietOther', e.target.value)}
                        placeholder="Specify your diet..."
                        className="w-full p-4 rounded-xl border-2 border-white/20 focus:border-aurelia-lime outline-none transition-colors bg-transparent text-white placeholder:text-white/20"
                        autoFocus
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      🪫 Do you know if you have any nutritional deficiencies?
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {['Yes', 'No', 'I think I do', 'I don\'t think so'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField('nutritionalDeficiencies', option)}
                          className={cn(
                            "py-3 px-6 rounded-xl border-2 font-medium transition-all text-left",
                            formData.nutritionalDeficiencies === option
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      🍷🚬 Do you regularly consume alcohol, tobacco, or other substances?
                    </label>
                    <div className="flex gap-3">
                      {['Never', 'Occasionally', 'Frequently'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField('substanceUsage', option)}
                          className={cn(
                            "flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all",
                            formData.substanceUsage === option
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.substanceUsage && formData.substanceUsage !== 'Never' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <label className="block text-xl font-medium text-white">
                        How often?
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          'Daily',
                          'A few times per week',
                          'Once a week',
                          'A few times per month',
                          'On specific occasions'
                        ].map((option) => (
                          <button
                            key={option}
                            onClick={() => updateField('substanceFrequency', option)}
                            className={cn(
                              "py-3 px-6 rounded-xl border-2 font-medium transition-all text-left",
                              formData.substanceFrequency === option
                                ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                                : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-12">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-aurelia-lime">Stress & Mental Health</h2>
                  <p className="text-white/60">Your mental well-being is essential.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      ⚡ How stressed do you feel in general?
                    </label>
                    <p className="text-sm text-white/50">1 = not at all, 5 = extremely</p>
                    <div className="flex justify-between gap-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          onClick={() => updateField('stressLevel', level)}
                          className={cn(
                            "w-12 h-12 md:w-16 md:h-16 rounded-full border-2 font-bold text-xl transition-all flex items-center justify-center",
                            formData.stressLevel === level
                              ? "border-aurelia-lime bg-aurelia-lime text-aurelia-purple shadow-lg scale-110"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      🌿 How often do you practice stress-reduction activities?
                    </label>
                    <p className="text-sm text-white/50">(meditation, breathing exercises, hobbies, etc.)</p>
                    <div className="grid grid-cols-1 gap-3">
                      {['Never', 'Occasionally', 'Regularly'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField('stressReduction', option)}
                          className={cn(
                            "py-3 px-6 rounded-xl border-2 font-medium transition-all text-left",
                            formData.stressReduction === option
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-12">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-aurelia-lime">Hormonal & Reproductive Status</h2>
                  <p className="text-white/60">These factors greatly influence your health.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      🌸 Have you reached menopause?
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {['Yes', 'No', 'Prefer not to answer'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField('menopause', option)}
                          className={cn(
                            "py-3 px-6 rounded-xl border-2 font-medium transition-all text-left",
                            formData.menopause === option
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.menopause === 'No' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <label className="block text-xl font-medium text-white">
                        💊 Do you use hormonal contraception?
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {['Yes', 'No', 'Prefer not to answer'].map((option) => (
                          <button
                            key={option}
                            onClick={() => updateField('hormonalContraception', option)}
                            className={cn(
                              "py-3 px-6 rounded-xl border-2 font-medium transition-all text-left",
                              formData.hormonalContraception === option
                                ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                                : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      🤰 Are you currently pregnant, planning a pregnancy, or have you been pregnant in the past?
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        'Currently pregnant',
                        'Planning a pregnancy',
                        'Previously pregnant',
                        'Not applicable',
                        'Prefer not to answer'
                      ].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField('pregnancyStatus', option)}
                          className={cn(
                            "py-3 px-6 rounded-xl border-2 font-medium transition-all text-left",
                            formData.pregnancyStatus === option
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Face Analysis (Optional) */}
            {step === 7 && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-aurelia-lime">Face Analysis (Optional)</h2>
                  <p className="text-white/60 mt-2">
                    Upload a selfie to estimate your biological skin age. This helps us provide more personalized skincare and longevity recommendations.
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl p-12 hover:border-aurelia-lime/50 transition-colors bg-white/5">
                    {formData.facePhoto ? (
                      <div className="relative w-full max-w-sm aspect-square rounded-xl overflow-hidden mb-4">
                        <img
                          src={formData.facePhoto}
                          alt="Selfie preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => updateField('facePhoto', '')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-aurelia-lime/20 rounded-full flex items-center justify-center mb-6">
                          <Camera className="w-10 h-10 text-aurelia-lime" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Upload a Selfie</h3>
                        <p className="text-white/50 text-center mb-6 max-w-xs">
                          Ensure good lighting and no makeup for best results. Your photo is processed securely and not stored.
                        </p>
                        <label className="cursor-pointer bg-aurelia-lime text-aurelia-purple px-8 py-3 rounded-full font-semibold hover:bg-aurelia-accent transition shadow-lg">
                          Choose Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                          />
                        </label>
                      </>
                    )}
                  </div>

                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-aurelia-lime" />
                      Privacy Note
                    </h4>
                    <p className="text-sm text-white/60">
                      Your photo is used solely for biological age estimation during this session. It is processed by our AI model and then immediately discarded. We do not store your photos.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 9: Goals & Preferences */}
            {step === 8 && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-aurelia-lime">Goals & Preferences</h2>
                  <p className="text-white/60 mt-2">
                    Tell us what you want to achieve and how you'd like to receive your results.
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      🎯 Which of these options best describes what you are looking for?
                    </label>
                    <p className="text-sm text-white/50">(multiple choice, max 3)</p>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        'Improve energy & vitality',
                        'Optimize performance',
                        'Prevent diseases',
                        'Live longer',
                        'General curiosity'
                      ].map((option) => (
                        <button
                          key={option}
                          onClick={() => toggleSelection('goals', option, 3)}
                          className={cn(
                            "py-3 px-6 rounded-xl border-2 font-medium transition-all text-left flex items-center justify-between",
                            formData.goals.includes(option)
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                          {formData.goals.includes(option) && <Check className="w-5 h-5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      📊 How do you prefer to receive your results & recommendations?
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        'Clear and simple action points',
                        'Detailed science',
                        'Both'
                      ].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField('resultPreference', option)}
                          className={cn(
                            "py-3 px-6 rounded-xl border-2 font-medium transition-all text-left",
                            formData.resultPreference === option
                              ? "border-aurelia-lime bg-aurelia-lime/20 text-aurelia-lime"
                              : "border-white/10 hover:border-aurelia-lime/50 text-white/60"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xl font-medium text-white">
                      Is there anything else we should know?
                    </label>
                    <p className="text-sm text-white/50">(chronic diseases, specific expectations…)</p>
                    <textarea
                      value={formData.otherInfo}
                      onChange={(e) => updateField('otherInfo', e.target.value)}
                      placeholder="Tell us everything..."
                      className="w-full p-4 rounded-xl border-2 border-white/20 focus:border-aurelia-lime outline-none transition-colors min-h-[120px] bg-transparent text-white placeholder:text-white/20"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-aurelia-purple-dark/90 backdrop-blur-md border-t border-white/10 p-4 z-40">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          {step > 0 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white/60 hover:text-aurelia-lime transition-colors px-4 py-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step > 0 && (
            <div className="flex items-center gap-4">
              {error && (
                <span className="text-red-400 text-sm font-medium animate-pulse">
                  {error}
                </span>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-aurelia-lime text-aurelia-purple px-6 py-3 rounded-full font-medium hover:bg-aurelia-accent transition-colors shadow-lg hover:shadow-xl"
              >
                {step === 8 ? 'Finish' : 'Next'}
                {step !== 8 && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
