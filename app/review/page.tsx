'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Biomarkers } from '@/types';
import Header from '@/components/ui/Header';

interface UploadResult {
  file: {
    name: string;
    size: number;
    url: string;
  };
  parsing: {
    biomarkers: Biomarkers;
    parsed: Array<{
      name: string;
      value: number;
      unit: string;
      confidence: number;
    }>;
  };
  validation: {
    isValid: boolean;
    canProceed: boolean;
    criticalMissing: string[];
    optionalMissing: string[];
    message: string;
  };
}

export default function ReviewPage() {
  const router = useRouter();
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [biomarkers, setBiomarkers] = useState<Biomarkers>({});
  const [editingField, setEditingField] = useState<string | null>(null);

  useEffect(() => {
    // Load data from sessionStorage
    const stored = sessionStorage.getItem('uploadResult');
    if (stored) {
      const data = JSON.parse(stored);
      setUploadResult(data);
      setBiomarkers(data.parsing.biomarkers);
    } else {
      // Redirect to upload if no data
      router.push('/upload');
    }
  }, [router]);

  const handleBiomarkerChange = (name: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setBiomarkers(prev => ({
        ...prev,
        [name]: numValue,
      }));
    } else if (value === '') {
      setBiomarkers(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleAddBiomarker = (name: string) => {
    setBiomarkers(prev => ({
      ...prev,
      [name]: 0,
    }));
    setEditingField(name);
  };

  const handleProceedToQuestionnaire = () => {
    // Store updated biomarkers
    sessionStorage.setItem('biomarkers', JSON.stringify(biomarkers));
    router.push('/questionnaire');
  };

  if (!uploadResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aurelia-lime"></div>
      </div>
    );
  }

  const criticalBiomarkers = ['HbA1c', 'Ferritin', 'CRP', 'TSH'];
  const presentCritical = criticalBiomarkers.filter(name => biomarkers[name]);
  const missingCritical = criticalBiomarkers.filter(name => !biomarkers[name]);
  const canProceed = presentCritical.length >= 3;

  return (
    <div className="min-h-screen">
      <Header showNav={false} />
      <div className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-aurelia-text-lime mb-4">
            Review & Correct Your Data
          </h1>
          <p className="text-lg text-white/60">
            Verify the extracted biomarkers and add any missing values
          </p>
        </div>

        {/* File Info */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-aurelia-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="font-semibold text-white">{uploadResult.file.name}</p>
              <p className="text-sm text-white/60">
                {uploadResult.parsing.parsed.length} biomarkers extracted
              </p>
            </div>
          </div>
        </div>

        {/* Validation Status */}
        <div className={`rounded-xl p-6 mb-6 ${
          canProceed ? 'bg-green-500/20 border-2 border-green-500/30' : 'bg-yellow-500/20 border-2 border-yellow-500/30'
        }`}>
          <div className="flex items-start gap-3">
            <svg className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
              canProceed ? 'text-green-400' : 'text-yellow-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className={`font-bold mb-2 ${
                canProceed ? 'text-green-100' : 'text-yellow-100'
              }`}>
                {canProceed ? 'Ready to Proceed' : 'Additional Data Needed'}
              </h3>
              <p className={canProceed ? 'text-green-200' : 'text-yellow-200'}>
                {presentCritical.length}/4 critical biomarkers present
                {!canProceed && ' - Please add at least one more critical biomarker'}
              </p>
            </div>
          </div>
        </div>

        {/* Critical Biomarkers */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Critical Biomarkers</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {criticalBiomarkers.map(name => {
              const value = biomarkers[name];
              const isPresent = value !== undefined;
              
              return (
                <div key={name} className={`border-2 rounded-lg p-4 ${
                  isPresent ? 'border-green-500/30 bg-green-500/10' : 'border-white/10 bg-white/5'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-white">{name}</label>
                    {isPresent && (
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={value || ''}
                    onChange={(e) => handleBiomarkerChange(name, e.target.value)}
                    onFocus={() => setEditingField(name)}
                    onBlur={() => setEditingField(null)}
                    placeholder="Enter value"
                    className={`w-full px-3 py-2 border rounded-lg bg-white/5 text-white placeholder-white/20 focus:ring-2 focus:ring-aurelia-lime focus:border-transparent ${
                      isPresent ? 'border-green-500/50' : 'border-white/10'
                    }`}
                  />
                  <p className="text-xs text-white/40 mt-1">
                    {name === 'HbA1c' && 'Optimal: < 5.7%'}
                    {name === 'Ferritin' && 'Optimal: 30-200 ng/mL'}
                    {name === 'CRP' && 'Optimal: < 1.0 mg/L'}
                    {name === 'TSH' && 'Optimal: 0.5-2.5 mIU/L'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optional Biomarkers */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Optional Biomarkers</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(biomarkers)
              .filter(([name]) => !criticalBiomarkers.includes(name))
              .map(([name, value]) => (
                <div key={name} className="border-2 border-white/10 rounded-lg p-4">
                  <label className="font-semibold text-white block mb-2">{name}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={value || ''}
                    onChange={(e) => handleBiomarkerChange(name, e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white rounded-lg focus:ring-2 focus:ring-aurelia-lime focus:border-transparent"
                  />
                </div>
              ))}
          </div>
          
          {/* Add More Button */}
          <div className="mt-4">
            <button
              onClick={() => {
                const newMarker = prompt('Enter biomarker name (e.g., VitaminD, Glucose):');
                if (newMarker) {
                  handleAddBiomarker(newMarker);
                }
              }}
              className="text-aurelia-lime hover:text-aurelia-lime/80 font-medium text-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Biomarker
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/upload')}
            className="flex-1 px-6 py-3 border-2 border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
          >
            ← Upload Different File
          </button>
          <button
            onClick={handleProceedToQuestionnaire}
            disabled={!canProceed}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors ${
              canProceed
                ? 'gradient-aurelia-lime text-aurelia-purple hover:opacity-90'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            Continue to Questionnaire →
          </button>
        </div>

        {/* Help Text */}
        {!canProceed && (
          <div className="mt-6 bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
            <p className="text-sm text-blue-100">
              <strong>Need help?</strong> If your blood test doesn't include these biomarkers, 
              you can manually enter values from previous tests or request these specific tests 
              from your healthcare provider.
            </p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
