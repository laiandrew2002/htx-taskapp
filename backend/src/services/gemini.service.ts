import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

function buildPrompt(title: string): string {
  return [
    `Given this task title: "${title}"`,
    "Return ONLY one of: Frontend | Backend | Frontend,Backend",
    "No explanation.",
  ].join("\n");
}

export class GeminiService {
  constructor(
    private readonly apiKey = env.GEMINI_API_KEY,
    private readonly modelName = env.GEMINI_MODEL,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async inferSkills(title: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const client = new GoogleGenerativeAI(this.apiKey);
    const model = client.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(buildPrompt(title));
    const text = result.response.text().trim();

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    return text;
  }
}

export const geminiService = new GeminiService();
