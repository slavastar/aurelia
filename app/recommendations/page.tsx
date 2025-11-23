'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Sparkles, ArrowLeft, Lightbulb } from 'lucide-react';
import ActionPlan from '@/components/recommendations/ActionPlan';
import { generateRecommendations, getLifestyleRecommendations, Recommendation } from '@/lib/recommendations/generator';
import { getLatestEntry } from '@/lib/storage/history';
import { motion } from 'framer-motion';
import Header from '@/components/ui/Header';

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [lifestyleRecs, setLifestyleRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personalized' | 'lifestyle'>('personalized');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = () => {
    const latestEntry = getLatestEntry();
    
    if (latestEntry) {
      const personalizedRecs = generateRecommendations(
        latestEntry.biomarkers,
        latestEntry.analysis.riskFactors
      );
      setRecommendations(personalizedRecs);
    }

    const lifestyle = getLifestyleRecommendations();
    setLifestyleRecs(lifestyle);
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-aurelia-lime border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/60">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-aurelia-lime mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-10 h-10 text-aurelia-lime" />
            <h1 className="text-4xl font-bold gradient-aurelia-text-lime">Your Action Plan</h1>
          </div>
          <p className="text-lg text-white/60">
            Evidence-based recommendations tailored to your unique health profile
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 mb-8"
        >
          <button
            onClick={() => setActiveTab('personalized')}
            className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
              activeTab === 'personalized'
                ? 'gradient-aurelia-lime text-aurelia-purple shadow-lg'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Personalized for You</span>
              {recommendations.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-aurelia-purple/20 rounded-full text-xs">
                  {recommendations.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('lifestyle')}
            className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
              activeTab === 'lifestyle'
                ? 'gradient-aurelia-lime text-aurelia-purple shadow-lg'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Lightbulb className="w-5 h-5" />
              <span>Lifestyle Foundations</span>
            </div>
          </button>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'personalized' ? (
            <>
              {recommendations.length > 0 ? (
                <>
                  <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-xl p-6 text-white mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-aurelia-lime">Your Personalized Recommendations</h2>
                    <p className="text-white/80">
                      Based on your biomarkers and health profile, here are the most impactful actions you can take.
                      Start with high-priority items for the biggest improvements.
                    </p>
                  </div>
                  <ActionPlan recommendations={recommendations} />
                </>
              ) : (
                <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-xl shadow-lg p-12 text-center">
                  <Target className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">No Analysis Yet</h3>
                  <p className="text-white/60 mb-6">
                    Complete your first health analysis to receive personalized recommendations.
                  </p>
                  <button
                    onClick={() => router.push('/upload')}
                    className="px-6 py-3 gradient-aurelia-lime text-aurelia-purple rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Start Analysis
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-xl p-6 text-white mb-8">
                <h2 className="text-2xl font-bold mb-2 text-aurelia-lime">Lifestyle Foundations</h2>
                <p className="text-white/80">
                  These fundamental practices support optimal health for all women, regardless of biomarker levels.
                  Master these basics for lasting vitality.
                </p>
              </div>
              <ActionPlan recommendations={lifestyleRecs} />
            </>
          )}
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white/10 border border-white/10 backdrop-blur-md rounded-xl shadow-lg p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Take Action?
          </h3>
          <p className="text-white/60 mb-6">
            Track your progress and see how your biomarkers improve over time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 gradient-aurelia-lime text-aurelia-purple rounded-lg font-semibold hover:opacity-90 transition"
            >
              View Dashboard
            </button>
            <button
              onClick={() => router.push('/upload')}
              className="px-6 py-3 bg-transparent border-2 border-aurelia-lime text-aurelia-lime rounded-lg font-semibold hover:bg-aurelia-lime/10 transition"
            >
              New Analysis
            </button>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg"
        >
          <p className="text-sm text-amber-900">
            <strong>Important:</strong> These recommendations are for educational purposes only and should not replace 
            professional medical advice. Always consult with your healthcare provider before making significant changes 
            to your diet, exercise routine, or supplement regimen.
          </p>
        </motion.div>
      </div>
    </div>
    </div>
  );
}
// End of component
