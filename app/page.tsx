import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Shield, Heart, BarChart3, Sparkles } from "lucide-react"
import InteractiveBackground from "@/components/ui/InteractiveBackground"
import Header from "@/components/ui/Header"

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <InteractiveBackground />

      <div className="relative z-10">
        {/* Header */}
        <Header />

        {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-aurelia-lime/20 rounded-full text-aurelia-lime text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            <span>Powered by AI • Evidence-Based • Women-Focused</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Your Personal Longevity Strategist
          </h2>

          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Upload your blood test results and receive personalized, evidence-based health insights
            tailored to your unique female physiology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2 px-8 py-4 bg-aurelia-lime text-aurelia-purple rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              Start Your Analysis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <button className="px-8 py-4 border-2 border-aurelia-lime text-aurelia-lime rounded-lg font-semibold hover:bg-aurelia-lime/10 transition">
              Learn More
            </button>
          </div>

          <p className="text-sm text-white/70 mt-6">
            <Shield className="inline h-4 w-4 mr-1" />
            Your data is private and secure. We never store your health information.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
                    <h3 className="text-3xl font-bold text-center mb-12 text-white">
            Why Choose AURELIA?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-lg hover:bg-white/15 transition">
              <div className="w-12 h-12 bg-aurelia-lime/20 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-aurelia-lime" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-white">Female-Focused</h4>
              <p className="text-white/60">
                Analysis tailored to women's unique physiology, including menstrual cycle awareness,
                iron optimization, and thyroid prioritization.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-lg hover:bg-white/15 transition">
              <div className="w-12 h-12 bg-aurelia-lime/20 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-aurelia-lime" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-white">AI-Powered Insights</h4>
              <p className="text-white/60">
                Advanced AI analyzes your biomarkers and symptoms to provide personalized,
                evidence-based recommendations for optimal healthspan.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-lg hover:bg-white/15 transition">
              <div className="w-12 h-12 bg-aurelia-lime/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-aurelia-lime" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-white">Safe & Private</h4>
              <p className="text-white/60">
                Built-in safety guardrails detect emergency values. Your health data is processed
                securely and never stored without your consent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-white">
            How It Works
          </h3>

          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 gradient-aurelia-lime text-aurelia-purple rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-white">Complete Your Health Profile</h4>
                <p className="text-white/80">
                  Answer questions about your symptoms, menstrual cycle, lifestyle, and health goals
                  to personalize your analysis.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 gradient-aurelia-lime text-aurelia-purple rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-white">Upload Your Blood Test</h4>
                <p className="text-white/80">
                  Simply upload your blood test PDF. Our AI extracts biomarkers like HbA1c, Ferritin,
                  CRP, TSH, and more.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 gradient-aurelia-lime text-aurelia-purple rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-white">Receive Your Personalized Report</h4>
                <p className="text-white/80">
                  Get a comprehensive analysis with your health score, key observations, and
                  actionable recommendations tailored to your biology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-4xl font-bold mb-6 text-white">
            Ready to Optimize Your Healthspan?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of women taking control of their longevity journey.
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-8 py-4 gradient-aurelia-lime text-aurelia-purple rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
          >
            Get Started Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.svg" 
              alt="Aurelia Logo" 
              width={16} 
              height={16} 
              className="h-4 w-4 object-contain"
            />
            <span className="font-semibold text-white">AURELIA</span>
          </div>
          <p className="text-sm text-white/60 text-center">
            © 2024 AURELIA. Not medical advice. Consult healthcare professionals for medical decisions.
          </p>
          <div className="flex gap-6 text-sm text-white/60">
            <a href="#" className="hover:text-aurelia-lime transition">Privacy</a>
            <a href="#" className="hover:text-aurelia-lime transition">Terms</a>
            <a href="#" className="hover:text-aurelia-lime transition">Contact</a>
          </div>
        </div>
      </footer>
      </div>
    </main>
  )
}
