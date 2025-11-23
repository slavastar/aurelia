/**
 * Mistral AI Client
 * Handles communication with Mistral Large for AURELIA analysis
 */

import { Mistral } from '@mistralai/mistralai';

if (!process.env.MISTRAL_API_KEY) {
  console.warn('MISTRAL_API_KEY is not set in environment variables');
}

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || '',
  timeoutMs: 60000, // 60 seconds timeout
});

export interface MistralAnalysisRequest {
  systemPrompt: string;
  userMessage?: string;
  complexity?: 'simple' | 'medium' | 'complex';
}

export interface MistralAnalysisResponse {
  analysis: string;
  success: boolean;
  error?: string;
}

/**
 * Generate analysis using Mistral Large
 */
export async function generateAureliaAnalysis(
  request: MistralAnalysisRequest
): Promise<MistralAnalysisResponse> {
  try {
    if (!process.env.MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY is not set');
    }

    const messages = [
      { role: 'system', content: request.systemPrompt },
    ];

    if (request.userMessage) {
      messages.push({ role: 'user', content: request.userMessage });
    } else {
        // If no user message, we might need to adjust how we send the prompt.
        // Usually system prompt sets the behavior, and user prompt triggers the task.
        // If only system prompt is provided, we can try sending it as user message if system role isn't enough to trigger output,
        // but typically system + user is the pattern.
        // For now, if no user message, we'll assume the system prompt contains the instruction.
        // However, Mistral chat completion usually expects a user message to start generation if it's a conversation.
        // Let's assume systemPrompt defines the persona and userMessage defines the data to analyze.
        // If userMessage is missing, we might treat systemPrompt as the user message or add a dummy user message.
        // Looking at the Gemini client, it concatenates them.
        // Let's stick to the chat structure: System -> User.
    }
    
    // If userMessage is undefined, we should probably just send the system prompt as the user message 
    // or ensure the caller always provides a user message.
    // In the Gemini client: `const fullPrompt = request.userMessage ? ... : request.systemPrompt;`
    // So it treats it as a single text block.
    
    // For Mistral Chat API:
    const chatMessages = [
        { role: 'system', content: request.systemPrompt },
        ...(request.userMessage ? [{ role: 'user', content: request.userMessage }] : [{ role: 'user', content: 'Please perform the analysis based on the instructions.' }])
    ] as any;


    // Determine model based on complexity
    let model = 'mistral-large-latest'; // Default for complex/medical tasks
    
    if (request.complexity === 'simple') {
      model = 'mistral-small-latest';
    } else if (request.complexity === 'medium') {
      model = 'open-mixtral-8x22b'; // Good balance
    }

    const result = await client.chat.complete({
      model: model,
      messages: chatMessages,
      temperature: 0.7,
      topP: 0.95,
      maxTokens: 2048,
    });

    const text = result.choices?.[0]?.message?.content || '';

    return {
      analysis: text as string,
      success: true,
    };
  } catch (error) {
    console.error('Mistral API Error:', error);
    
    return {
      analysis: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Stream analysis using Mistral (for real-time updates)
 */
export async function* streamAureliaAnalysis(
  request: MistralAnalysisRequest
): AsyncGenerator<string, void, unknown> {
  try {
    if (!process.env.MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY is not set');
    }

    const chatMessages = [
        { role: 'system', content: request.systemPrompt },
        ...(request.userMessage ? [{ role: 'user', content: request.userMessage }] : [{ role: 'user', content: 'Please perform the analysis based on the instructions.' }])
    ] as any;

    const resultStream = await client.chat.stream({
      model: 'mistral-large-latest',
      messages: chatMessages,
      temperature: 0.7,
      topP: 0.95,
      maxTokens: 2048,
    });

    for await (const chunk of resultStream) {
      const chunkText = chunk.data.choices[0].delta.content;
      if (chunkText) {
        yield chunkText as string;
      }
    }
  } catch (error) {
    console.error('Mistral Streaming Error:', error);
    throw error;
  }
}
