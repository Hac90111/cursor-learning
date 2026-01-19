import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

 /* Creates an LLM instance (Google Gemini) based on available environment variables
 * 
 * Available Gemini models (as of 2024):
 * - 'gemini-2.5-flash' - Latest stable flash model (default, recommended)
 * - 'gemini-2.5-pro' - Latest pro model
 * - 'gemini-2.0-flash-exp' - Experimental 2.0 flash model
 * - 'gemini-2.0-flash' - Stable 2.0 flash model
 * - 'gemini-1.5-flash-002' - Stable flash model with version number
 * - 'gemini-pro' - Legacy model (may still work)
 * 
 * Environment variables:
 * - GEMINI_MODEL: Model name to use (default: 'gemini-2.5-flash')
 * - GEMINI_API_VERSION: API version to use - 'v1' (stable) or 'v1beta' (default: 'v1')
 * 
 * Note: Model names without version numbers (e.g., 'gemini-1.5-pro') are deprecated.
 * If you get "model not found" errors, try 'gemini-pro' or check available models via ListModels API.
 */
export function createLLM() {
  // Use Google Gemini
  if (process.env.GOOGLE_API_KEY) {
    // Use model from env var, or fallback to gemini-2.5-flash (latest stable)
    // Alternative models: 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-pro', 'gemini-1.5-flash-002'
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    
    // API version: 'v1beta' supports structured output features, 'v1' is stable but limited
    // Default to 'v1beta' for better structured output support
    const apiVersion = process.env.GEMINI_API_VERSION || 'v1beta';
    
    return new ChatGoogleGenerativeAI({
      model: modelName,
      temperature: 0.8,
      apiKey: process.env.GOOGLE_API_KEY,
      apiVersion: apiVersion,
    });
  }
  throw new Error('No AI API key found. Please set GOOGLE_API_KEY in your environment variables.');
}

/**
 * Schema for structured output from README summarization
 * Using .strict() to reject any extra fields not defined in the schema
 */
export const ReadmeSummarySchema = z.object({
  summary: z.string().describe('A concise summary of the GitHub repository based on the README file content'),
  cool_facts: z.array(z.string()).describe('A list of interesting or notable facts about the repository'),
}).strict();

export type ReadmeSummary = z.infer<typeof ReadmeSummarySchema>;

/**
 * Summarizes README content using LLM with structured output
 * Uses withStructuredOutput bound to the model for native Gemini structured output
 */
export async function summarizeReadme(readmeContent: string, repoName?: string): Promise<ReadmeSummary> {
  const llm = createLLM();
  
  // Bind structured output to the model using json_mode method
  // This uses Gemini's native structured output support
  const structuredLLM = llm.withStructuredOutput(ReadmeSummarySchema, {
    method: 'json_mode',
    name: 'readme_summary',
  });
  
  // Create prompt template with readmeContent as a variable
  // Explicitly instruct to only return summary and cool_facts fields
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a helpful assistant that summarizes GitHub repository README files. Provide a concise, informative summary that highlights the key features, purpose, and usage of the repository. You must respond with ONLY the fields "summary" (string) and "cool_facts" (array of strings). Do not include any other fields or metadata.'],
    ['user', 'Summarize this github repo from readme file content:\n\n{readmeContent}\n\nReturn only a JSON object with exactly these two fields: "summary" and "cool_facts".'],
  ]);
  
  // Create chain: prompt -> structured LLM
  const chain = prompt.pipe(structuredLLM);
  
  // Invoke the chain with readmeContent as input
  // The structured output will automatically parse and validate against the schema
  const response = await chain.invoke({
    readmeContent: readmeContent,
  });
  
  // Explicitly validate with strict schema to ensure no extra fields
  // Then return only the exact fields we want
  try {
    const validatedResponse = ReadmeSummarySchema.parse(response);
    
    // Explicitly return only summary and cool_facts to ensure nothing else is included
    return {
      summary: validatedResponse.summary,
      cool_facts: validatedResponse.cool_facts,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Schema validation failed:', error.issues);
      const errorMessages = error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Structured output validation failed: ${errorMessages}`);
    }
    throw error;
  }
}

