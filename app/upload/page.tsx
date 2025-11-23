'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/ui/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// Polyfill DOMMatrix for SSR to prevent pdfjs-dist from crashing during build/render
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  // @ts-ignore
  if (typeof global.DOMMatrix === 'undefined') {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {};
  }
}

// PDF.js will be imported dynamically to avoid SSR issues
const PDFJS_VERSION = '4.10.38'; // Use a stable version
const WORKER_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

interface UploadResponse {
  success: boolean;
  file: {
    name: string;
    size: number;
    url: string;
  };
  extraction: {
    text: string;
    confidence: number;
  };
  parsing: {
    biomarkers: Record<string, number>;
    parsed: Array<{
      name: string;
      value: number;
      unit: string;
      confidence: number;
    }>;
    confidence: number;
    warnings: string[];
  };
  validation: {
    isValid: boolean;
    canProceed: boolean;
    criticalMissing: string[];
    optionalMissing: string[];
    message: string;
  };
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const convertPdfToImage = async (file: File): Promise<Blob> => {
    setStatusMessage('Converting PDF to image for analysis...');

    // Dynamically import PDF.js
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_SRC;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    // Calculate dimensions
    let totalHeight = 0;
    let maxWidth = 0;
    const pageData = [];

    // Process first 3 pages max to avoid huge images
    const pagesToProcess = Math.min(numPages, 3);

    for (let i = 1; i <= pagesToProcess; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 }); // Scale 1.5 is sufficient for OCR and faster
      totalHeight += viewport.height;
      maxWidth = Math.max(maxWidth, viewport.width);
      pageData.push({ page, viewport });
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = maxWidth;
    canvas.height = totalHeight;
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Canvas context not available');

    // Render pages
    let currentHeight = 0;
    for (const { page, viewport } of pageData) {
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = viewport.width;
      pageCanvas.height = viewport.height;
      const pageContext = pageCanvas.getContext('2d');

      if (pageContext) {
        await page.render({ canvasContext: pageContext, viewport }).promise;
        context.drawImage(pageCanvas, 0, currentHeight);
        currentHeight += viewport.height;
      }
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob failed'));
      }, 'image/jpeg', 0.85);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const originalFile = acceptedFiles[0];
    setUploading(true);
    setError(null);
    setUploadResult(null);
    setStatusMessage('Preparing file...');

    try {
      let fileToUpload = originalFile;

      // If PDF, convert to image
      if (originalFile.type === 'application/pdf') {
        try {
          const imageBlob = await convertPdfToImage(originalFile);
          fileToUpload = new File([imageBlob], originalFile.name.replace('.pdf', '.jpg'), {
            type: 'image/jpeg',
          });
        } catch (conversionError) {
          console.error('PDF conversion failed:', conversionError);
          setError('Failed to process PDF. Please try converting it to an image (JPEG/PNG) manually.');
          setUploading(false);
          return;
        }
      }

      setStatusMessage('Uploading and analyzing...');
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadResult(data);

      // If validation passes, redirect to paywall page after 2 seconds
      if (data.validation.canProceed) {
        setStatusMessage('Analysis complete! Redirecting...');
        setTimeout(() => {
          // Store data in sessionStorage for paywall page
          sessionStorage.setItem('uploadResult', JSON.stringify(data));
          router.push('/paywall');
        }, 2000);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setStatusMessage('');
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="min-h-screen bg-aurelia-purple-dark text-white">
      <Header showNav={false} />
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-aurelia-text-lime mb-4">
            Upload Your Blood Test Results
          </h1>
          <p className="text-lg text-white/80">
            Upload a PDF of your blood test results. We'll extract and analyze your biomarkers.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8 mb-8">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
              transition-all duration-300 ease-in-out
              ${isDragActive
                ? 'border-aurelia-lime bg-aurelia-lime/10 scale-[1.02]'
                : 'border-white/20 hover:border-aurelia-lime/50 hover:bg-white/5'
              }
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} disabled={uploading} />

            <div className="flex flex-col items-center gap-4">
              {/* Upload Icon */}
              <div className={`p-4 rounded-full transition-colors ${isDragActive ? 'bg-aurelia-lime/20' : 'bg-white/5'}`}>
                <Upload className={`w-12 h-12 ${isDragActive ? 'text-aurelia-lime' : 'text-white/60'}`} />
              </div>

              {uploading ? (
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-aurelia-lime animate-spin mx-auto mb-4" />
                  <p className="text-lg font-medium text-white">{statusMessage || 'Processing your file...'}</p>
                  <p className="text-sm text-white/60 mt-2">
                    Extracting biomarkers with AI
                  </p>
                </div>
              ) : isDragActive ? (
                <p className="text-lg font-medium text-aurelia-lime">
                  Drop your PDF here
                </p>
              ) : (
                <>
                  <p className="text-lg font-medium text-white">
                    Drag & drop your blood test PDF here
                  </p>
                  <p className="text-sm text-white/60">
                    or click to browse files
                  </p>
                  <p className="text-xs text-white/40 mt-2">
                    Maximum file size: 10MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8 backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-200 mb-1">Upload Failed</h3>
                  <p className="text-red-300/90">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Result */}
        <AnimatePresence>
          {uploadResult && uploadResult.success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-start gap-3 mb-6">
                <CheckCircle className="w-8 h-8 text-aurelia-lime flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  File Processed Successfully!
                </h3>
                <p className="text-white/60">
                  {uploadResult.file.name} ({(uploadResult.file.size / 1024).toFixed(1)} KB)
                </p>
              </div>
            </div>

            {/* Extraction Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-aurelia-lime/20 rounded-lg p-4 border border-aurelia-lime/30">
                <p className="text-sm text-aurelia-lime font-medium mb-1">OCR Confidence</p>
                <p className="text-2xl font-bold text-white">
                  {(uploadResult.extraction.confidence * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-white/60 font-medium mb-1">Biomarkers Found</p>
                <p className="text-2xl font-bold text-white">
                  {uploadResult.parsing.parsed.length}
                </p>
              </div>
            </div>

            {/* Validation Status */}
            <div className={`
              rounded-lg p-4 mb-6
              ${uploadResult.validation.canProceed
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-yellow-500/10 border border-yellow-500/30'
              }
            `}>
              <p className={`font-medium mb-2 ${
                uploadResult.validation.canProceed ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {uploadResult.validation.message}
              </p>

              {uploadResult.validation.criticalMissing.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-white/80 mb-1">
                    Missing Critical Biomarkers:
                  </p>
                  <ul className="text-sm text-white/60 list-disc list-inside">
                    {uploadResult.validation.criticalMissing.map((marker) => (
                      <li key={marker}>{marker}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Parsed Biomarkers Preview */}
            {uploadResult.parsing.parsed.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-white mb-3">Extracted Biomarkers:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {uploadResult.parsing.parsed.slice(0, 6).map((marker) => (
                    <div key={marker.name} className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-sm font-medium text-white/60">{marker.name}</p>
                      <p className="text-lg font-bold text-white">
                        {marker.value} {marker.unit}
                      </p>
                    </div>
                  ))}
                </div>
                {uploadResult.parsing.parsed.length > 6 && (
                  <p className="text-sm text-white/40 mt-2 text-center">
                    + {uploadResult.parsing.parsed.length - 6} more biomarkers
                  </p>
                )}
              </div>
            )}
            {/* Action */}
            {uploadResult.validation.canProceed && (
              <div className="text-center mt-6">
                <p className="text-sm text-white/60 mb-4">
                  Redirecting to subscription page...
                </p>
                <Loader2 className="w-6 h-6 text-aurelia-lime animate-spin mx-auto" />
              </div>
            )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8 mt-8">
          <h3 className="text-lg font-bold text-white mb-4">What We Extract:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-aurelia-lime mb-2">Critical Biomarkers:</h4>
              <ul className="text-sm text-white/60 space-y-1">
                <li>• HbA1c (Glucose control)</li>
                <li>• Ferritin (Iron stores)</li>
                <li>• CRP (Inflammation)</li>
                <li>• TSH (Thyroid function)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-aurelia-lime/80 mb-2">Optional Biomarkers:</h4>
              <ul className="text-sm text-white/60 space-y-1">
                <li>• Vitamin D & B12</li>
                <li>• Lipid Panel (Cholesterol, LDL, HDL)</li>
                <li>• Complete Blood Count</li>
                <li>• Liver & Kidney Function</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
