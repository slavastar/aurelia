'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Check, ArrowRight, Shield } from 'lucide-react';
import Header from '@/components/ui/Header';

export default function PaywallPage() {
  const router = useRouter();
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [questionnaireData, setQuestionnaireData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Load data from sessionStorage
    const upload = sessionStorage.getItem('uploadResult');
    const questionnaire = localStorage.getItem('aurelia_questionnaire_data');

    if (!upload || !questionnaire) {
      // Redirect to start if missing data
      router.push('/questionnaire');
      return;
    }

    setUploadResult(JSON.parse(upload));
    setQuestionnaireData(JSON.parse(questionnaire));
  }, [router]);

  const handleSubscribe = async () => {
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // In production, this would integrate with Stripe/PayPal
      // For now, just redirect to results
      router.push('/results');
    }, 2000);
  };

  const handleSkipForNow = () => {
    // Allow user to see limited preview or come back later
    router.push('/');
  };

  const handleDemoSkip = () => {
    // Demo mode: Skip paywall and go to results
    router.push('/results');
  };

  if (!uploadResult || !questionnaireData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aurelia-lime"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header showNav={false} />
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              Your Analysis is Ready! 🎉
            </h2>
            <p className="text-lg text-white/80">
              We've processed your blood test and health profile. Subscribe to unlock your personalized longevity insights.
            </p>
          </div>

        {/* Preview Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Data Successfully Processed
              </h3>
              <div className="space-y-2 text-gray-600">
                <p>✓ {uploadResult.parsing?.parsed?.length || 0} biomarkers extracted from your blood test</p>
                <p>✓ Health profile completed ({questionnaireData.symptoms?.length || 0} symptoms, {questionnaireData.goals?.length || 0} goals)</p>
                <p>✓ AI analysis complete with personalized recommendations</p>
              </div>
            </div>
          </div>

          {/* Blurred Preview */}
          <div className="relative">
            <div className="blur-sm pointer-events-none select-none">
              <div className="bg-gradient-to-r from-aurelia-purple/10 to-aurelia-lime/20 rounded-lg p-6 mb-4">
                <h4 className="font-bold text-gray-900 mb-2">Your Health Score</h4>
                <div className="text-4xl font-bold text-aurelia-lime">78/100</div>
                <p className="text-sm text-gray-600 mt-2">Good - Room for optimization</p>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-1">Key Observation #1</h5>
                  <p className="text-gray-600">Your ferritin levels suggest...</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-1">Key Observation #2</h5>
                  <p className="text-gray-600">Your HbA1c indicates...</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-1">Personalized Recommendations</h5>
                  <p className="text-gray-600">Based on your biology...</p>
                </div>
              </div>
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg">
              <div className="text-center">
                <Lock className="h-16 w-16 text-aurelia-purple mx-auto mb-4" />
                <p className="text-xl font-bold text-gray-900 mb-2">
                  Subscribe to Unlock Your Full Report
                </p>
                <p className="text-gray-600">
                  Get personalized insights, recommendations, and ongoing tracking
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-aurelia-lime/30">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              AUREL✦A Premium
            </h3>
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <span className="text-5xl font-bold text-aurelia-purple">$29</span>
              <span className="text-gray-600">/month</span>
            </div>
            <p className="text-gray-600">
              Cancel anytime • 30-day money-back guarantee
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {[
              'Complete biomarker analysis with AI insights',
              'Personalized action plans tailored to your biology',
              'Cycle-aware recommendations for women',
              'Track progress over time with dashboard',
              'Achievement system and health goals',
              'Export reports as PDF',
              'Priority email support',
              'Monthly health check-ins',
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSubscribe}
            disabled={processing}
            className="w-full py-4 bg-gradient-aurelia text-aurelia-purple rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                Subscribe & Unlock Results
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          <button
            onClick={handleSkipForNow}
            className="w-full mt-4 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Maybe Later
          </button>

          {/* Demo Mode Button */}
          <button
            onClick={handleDemoSkip}
            className="w-full mt-2 py-2 text-sm text-aurelia-lime hover:text-aurelia-accent font-medium transition-colors border border-aurelia-lime/30 rounded-lg hover:bg-aurelia-lime/10"
          >
            Demo Mode: Skip Paywall
          </button>
        </div>

        {/* Trust Signals */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <Shield className="h-8 w-8 text-aurelia-purple mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Secure & Private</h4>
              <p className="text-sm text-gray-600">Your data is encrypted and never shared</p>
            </div>
            <div>
              <Sparkles className="h-8 w-8 text-aurelia-lime mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Evidence-Based</h4>
              <p className="text-sm text-gray-600">Backed by scientific research</p>
            </div>
            <div>
              <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Cancel Anytime</h4>
              <p className="text-sm text-gray-600">No long-term commitment required</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          <Shield className="inline h-4 w-4 mr-1" />
          Not medical advice. Consult healthcare professionals for medical decisions.
        </p>
      </div>
    </div>
    </div>
  );
}
