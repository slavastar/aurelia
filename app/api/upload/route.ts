import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { extractTextFromDocument } from '@/lib/pixtral/client';
import { validateBiomarkers } from '@/lib/pixtral/biomarker-parser';
import { generateAureliaAnalysis } from '@/lib/mistral/client';

// Allow execution up to 10 minutes (if supported by hosting plan)
export const maxDuration = 600;

/**
 * Document Upload and Processing Endpoint
 * Handles file upload, OCR extraction, and biomarker parsing
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    // We only accept images because Pixtral Vision API requires images.
    // PDFs should be converted to images on the client side.
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only Image files (JPEG, PNG, WEBP) are supported. PDFs must be converted to images.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Vercel Blob Storage (or use mock mode if no token)
    let blob;
    const hasToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (hasToken) {
      blob = await put(file.name, buffer, {
        access: 'public',
        addRandomSuffix: true,
      });
      console.log('File uploaded to Vercel Blob:', blob.url);
    } else {
      // Local development mode - save locally
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, file.name);
        await writeFile(filePath, buffer);
        console.log('Local Dev: File saved to', filePath);

        blob = {
          url: `/uploads/${file.name}`,
          pathname: file.name,
          contentType: file.type,
          contentDisposition: `attachment; filename="${file.name}"`,
        };
      } catch (err) {
        console.error('Error saving local file:', err);
        // Fallback if local save fails
        blob = {
          url: `local://${file.name}`,
          pathname: file.name,
          contentType: file.type,
          contentDisposition: `attachment; filename="${file.name}"`,
        };
      }
    }

    // Extract text using Pixtral OCR
    let extractedText = '';
    let ocrConfidence = 0;

    try {
      const ocrResult = await extractTextFromDocument(buffer, file.type);
      extractedText = ocrResult.text;
      ocrConfidence = ocrResult.confidence;
      console.log('✅ OCR extraction successful, confidence:', ocrConfidence);
      console.log('Extracted Text Preview:', extractedText.substring(0, 500));
    } catch (error) {
      console.error('❌ OCR extraction failed:', error);
      return NextResponse.json(
        { error: 'Failed to extract text from document. Please ensure the file is readable and try again.' },
        { status: 500 }
      );
    }

    // Parse biomarkers using Mistral Large LLM
    console.log('Analyzing text with Mistral Large...');
    let biomarkers = {};
    let parsedBiomarkersList: any[] = [];

    try {
      const analysisResult = await generateAureliaAnalysis({
        systemPrompt: `You are an expert medical data analyst. Your task is to extract blood test results from raw OCR text.

        Return ONLY a JSON object with the following structure:
        {
          "biomarkers": {
            "HbA1c": number | null,
            "Ferritin": number | null,
            "CRP": number | null,
            "TSH": number | null,
            "VitaminD": number | null,
            "VitaminB12": number | null,
            "Glucose": number | null,
            "Hemoglobin": number | null,
            "WBC": number | null,
            "Platelets": number | null,
            "Creatinine": number | null,
            "Potassium": number | null,
            "Troponin": number | null,
            "T3": number | null,
            "T4": number | null,
            "FreeT3": number | null,
            "FreeT4": number | null,
            "TotalCholesterol": number | null,
            "LDL": number | null,
            "HDL": number | null,
            "Triglycerides": number | null,
            "ApoB": number | null,
            "ALT": number | null,
            "AST": number | null,
            "Estrogen": number | null,
            "Progesterone": number | null,
            "Testosterone": number | null,
            "Cortisol": number | null,
            "Calcium": number | null,
            "Magnesium": number | null,
            "Zinc": number | null
          },
          "parsed": [
            { "name": "TestName", "value": number, "unit": "string", "confidence": 0.9 }
          ]
        }

        STRICT RULES:
        1.  **NO MOCK DATA**: If a value is not explicitly present in the text, DO NOT invent it. Omit the key or set it to null.
        2.  **NO HALLUCINATIONS**: Only extract what is there.
        3.  **FORMAT**: Return ONLY valid JSON. No markdown code blocks, no explanations.
        4.  **MAPPING**: Map French or English test names to the standard keys listed above.
            - HbA1c (Glycated Hemoglobin, Hémoglobine Glyquée)
            - Ferritin (Ferritine)
            - CRP (C-Reactive Protein, Protéine C-Réactive)
            - TSH (Thyroid Stimulating Hormone)
            - VitaminD (Vitamine D, 25-OH Vitamin D)
            - VitaminB12 (Vitamine B12, Cobalamin)
            - Glucose (Glycémie, Fasting Glucose)
            - Hemoglobin (Hémoglobine)
            - TotalCholesterol (Cholestérol Total)
            - LDL (LDL Cholesterol)
            - HDL (HDL Cholesterol)
            - Triglycerides (Triglycérides)
            - ALT (ALAT, SGPT)
            - AST (ASAT, SGOT)
            - Iron (Fer) -> Map to "Iron" if needed, but prefer specific keys.
        5.  **VALUES**: Extract ONLY the numeric value.
            - If a value is comma-separated (e.g. 5,7), convert it to dot-separated (5.7).
            - Do not include units in the value field.
        6.  **UNITS**: Extract the unit if available and put it in the "parsed" array objects.`,
        userMessage: `Extract biomarkers from this text:\n\n${extractedText}`,
        complexity: 'complex'
      });

      // Clean up potential markdown code blocks
      const cleanJson = analysisResult.analysis.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      biomarkers = parsed.biomarkers || {};
      parsedBiomarkersList = parsed.parsed || [];

      console.log('Mistral extracted biomarkers:', Object.keys(biomarkers).length);
    } catch (e) {
      console.error('Failed to parse Mistral JSON:', e);
      // Fallback to empty if LLM fails
    }

    // Validate biomarkers
    const validation = validateBiomarkers(biomarkers);

    return NextResponse.json({
      success: true,
      mock: false,
      file: {
        name: file.name,
        size: file.size,
        url: blob.url,
      },
      extraction: {
        text: extractedText,
        confidence: ocrConfidence,
        mock: false,
      },
      parsing: {
        biomarkers: biomarkers,
        parsed: parsedBiomarkersList,
        confidence: 1.0,
        warnings: [],
      },
      validation: {
        isValid: validation.isValid,
        canProceed: validation.canProceed,
        criticalMissing: validation.criticalMissing,
        optionalMissing: validation.optionalMissing,
        message: validation.message,
      },
    });

  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'operational',
    service: 'PDF Upload & Processing API',
    version: '1.0.0',
    features: [
      'PDF upload to Vercel Blob',
      'Pixtral OCR extraction (with mock fallback)',
      'Intelligent biomarker parsing',
      'Validation and warnings',
    ],
    timestamp: new Date().toISOString(),
  });
}
