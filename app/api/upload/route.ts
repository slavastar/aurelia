import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { extractTextFromDocument } from '@/lib/pixtral/client';
import { parseBiomarkers, validateBiomarkers } from '@/lib/pixtral/biomarker-parser';

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
      // Mock mode for development without Vercel Blob
      blob = {
        url: `mock://uploads/${file.name}`,
        pathname: file.name,
        contentType: file.type,
        contentDisposition: `attachment; filename="${file.name}"`,
      };
      console.log('Mock mode: File not uploaded (no BLOB_READ_WRITE_TOKEN)');
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

    // Parse biomarkers from extracted text
    const parsingResult = parseBiomarkers(extractedText);
    console.log('Parsed biomarkers:', Object.keys(parsingResult.biomarkers).length);

    // Validate biomarkers
    const validation = validateBiomarkers(parsingResult.biomarkers);

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
        biomarkers: parsingResult.biomarkers,
        parsed: parsingResult.parsed,
        confidence: parsingResult.confidence,
        warnings: parsingResult.warnings,
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
