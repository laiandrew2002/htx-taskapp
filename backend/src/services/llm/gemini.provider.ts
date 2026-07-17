import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env";
import { buildSkillInferencePrompt } from "../../utils/skillInferencePrompt";
import type { SkillInferenceProvider } from "./types";

export class GeminiSkillInferenceProvider implements SkillInferenceProvider {
  readonly providerName = "Gemini";

  constructor(
    private readonly apiKey = env.GEMINI_API_KEY,
    private readonly modelName = env.GEMINI_MODEL,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  getConfigurationError(): string {
    return "GEMINI_API_KEY is not configured";
  }

  async inferSkills(title: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error(this.getConfigurationError());
    }

    const client = new GoogleGenerativeAI(this.apiKey);
    const model = client.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(buildSkillInferencePrompt(title));
    const text = result.response.text().trim();

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    return text;
  }
}
