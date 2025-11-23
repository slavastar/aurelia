import sharp from 'sharp';

/**
 * Pixtral OCR Client
 * Handles PDF to text extraction using Pixtral OCR API
 * Falls back to mock mode for development
 */

export interface PixtralOCRResponse {
  text: string;
  confidence: number;
  pages: Array<{
    page_number: number;
    text: string;
    confidence: number;
  }>;
  mock?: boolean;
}

export interface PixtralOCRError {
  error: string;
  message: string;
  status: number;
}

/**
 * Generate mock blood test data for development
 */
function generateMockBloodTestData(): PixtralOCRResponse {
  const mockText = `
BLOOD TEST RESULTS
Patient: Jane Doe
Date: ${new Date().toLocaleDateString()}

COMPLETE BLOOD COUNT (CBC)
Hemoglobin: 13.5 g/dL (Normal: 12.0-16.0)
Hematocrit: 40.2% (Normal: 36.0-46.0)
RBC: 4.5 M/uL (Normal: 4.0-5.5)
WBC: 7.2 K/uL (Normal: 4.5-11.0)
Platelets: 250 K/uL (Normal: 150-400)

METABOLIC PANEL
Glucose (Fasting): 95 mg/dL (Normal: 70-100)
HbA1c: 5.4% (Normal: <5.7%)
Creatinine: 0.9 mg/dL (Normal: 0.6-1.2)
eGFR: 95 mL/min (Normal: >60)

LIPID PANEL
Total Cholesterol: 185 mg/dL (Desirable: <200)
LDL: 110 mg/dL (Optimal: <100)
HDL: 58 mg/dL (Desirable: >40)
Triglycerides: 85 mg/dL (Normal: <150)

THYROID FUNCTION
TSH: 2.1 mIU/L (Normal: 0.4-4.0)
Free T4: 1.2 ng/dL (Normal: 0.8-1.8)
Free T3: 3.1 pg/mL (Normal: 2.3-4.2)

IRON STUDIES
Ferritin: 45 ng/mL (Normal: 15-150)
Iron: 85 mcg/dL (Normal: 60-170)
TIBC: 320 mcg/dL (Normal: 250-450)
Transferrin Saturation: 27% (Normal: 20-50%)

INFLAMMATION MARKERS
CRP (High Sensitivity): 1.2 mg/L (Low Risk: <1.0)
ESR: 12 mm/hr (Normal: 0-20)

VITAMINS
Vitamin D (25-OH): 32 ng/mL (Sufficient: 30-100)
Vitamin B12: 450 pg/mL (Normal: 200-900)
Folate: 12 ng/mL (Normal: >3.0)

HORMONES
Estradiol: 85 pg/mL (Follicular: 30-120)
Progesterone: 2.5 ng/mL (Follicular: <1.5)
Testosterone: 35 ng/dL (Normal: 15-70)
DHEA-S: 180 mcg/dL (Normal: 65-380)

LIVER FUNCTION
ALT: 22 U/L (Normal: 7-56)
AST: 24 U/L (Normal: 10-40)
ALP: 65 U/L (Normal: 44-147)
Bilirubin: 0.6 mg/dL (Normal: 0.1-1.2)
`;

  return {
    text: mockText,
    confidence: 0.95,
    pages: [
      {
        page_number: 1,
        text: mockText,
        confidence: 0.95,
      },
    ],
    mock: true,
  };
}

/**
 * Extract text from document (PDF or Image) using Pixtral OCR
 */
export async function extractTextFromDocument(
  fileBuffer: Buffer,
  mimeType: string = 'application/pdf'
): Promise<PixtralOCRResponse> {
  const apiKey = process.env.PIXTRAL_API_KEY;

  if (!apiKey) {
    throw new Error('PIXTRAL_API_KEY is not configured');
  }

  try {
    // Resize image if it's too large to prevent timeouts
    let processedBuffer = fileBuffer;
    try {
      const metadata = await sharp(fileBuffer).metadata();
      if (metadata.width && metadata.width > 2048) {
        console.log('Resizing large image for OCR...');
        processedBuffer = await sharp(fileBuffer)
          .resize(2048, null, { withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
      } else {
        // Convert to JPEG to ensure compatibility and reduce size
        processedBuffer = await sharp(fileBuffer)
          .jpeg({ quality: 80 })
          .toBuffer();
      }
    } catch (sharpError) {
      console.warn('Image processing failed, using original buffer:', sharpError);
    }

    // Convert buffer to base64
    const base64Data = processedBuffer.toString('base64');

    // Note: The actual Pixtral API endpoint may differ
    // This is a placeholder - update with real endpoint when available
    const apiEndpoint = process.env.PIXTRAL_API_ENDPOINT || 'https://api.mistral.ai/v1/chat/completions';

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes timeout

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'pixtral-12b-2409',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Transcribe all text from this document exactly as it appears. Do not summarize, do not extract specific fields, and do not translate yet. Just give me the raw text content including all numbers, units, and labels.',
                },
                {
                  type: 'image_url',
                  image_url: `data:image/jpeg;base64,${base64Data}`,
                },
              ],
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pixtral API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      // Transform Pixtral response to our format
      const extractedText = data.choices?.[0]?.message?.content || '';

      return {
        text: extractedText,
        confidence: 0.85,
        pages: [
          {
            page_number: 1,
            text: extractedText,
            confidence: 0.85,
          },
        ],
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }

  } catch (error) {
    console.error('Pixtral OCR extraction error:', error);
    throw error;
  }
}

/**
 * Extract text from image using Pixtral OCR or mock data
 */
export async function extractTextFromImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<PixtralOCRResponse> {
  const apiKey = process.env.PIXTRAL_API_KEY;

  if (!apiKey) {
    throw new Error('PIXTRAL_API_KEY is not configured');
  }

  try {
    // Convert image buffer to base64
    const base64Image = imageBuffer.toString('base64');

    const apiEndpoint = process.env.PIXTRAL_API_ENDPOINT || 'https://api.mistral.ai/v1/chat/completions';

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'pixtral-12b-2409',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text from this blood test image, preserving the structure and values.',
              },
              {
                type: 'image_url',
                image_url: `data:${mimeType};base64,${base64Image}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pixtral API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || '';

    return {
      text: extractedText,
      confidence: 0.85,
      pages: [
        {
          page_number: 1,
          text: extractedText,
          confidence: 0.85,
        },
      ],
    };

  } catch (error) {
    console.error('Pixtral OCR extraction error:', error);
    throw error;
  }
}

/**
 * Check if Pixtral OCR is configured
 */
export function isPixtralConfigured(): boolean {
  return !!process.env.PIXTRAL_API_KEY;
}

/**
 * Get Pixtral OCR status
 */
export function getPixtralStatus(): {
  configured: boolean;
  apiKey: string;
} {
  const configured = isPixtralConfigured();

  return {
    configured,
    apiKey: configured ? '***' + process.env.PIXTRAL_API_KEY?.slice(-4) : 'not set',
  };
}
