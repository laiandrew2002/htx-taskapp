import { env } from "../../config/env";
import { GeminiSkillInferenceProvider } from "./gemini.provider";
import { OpenAiCompatibleSkillInferenceProvider } from "./openai.provider";
import type { SkillInferenceProvider } from "./types";

export function createSkillInferenceProvider(): SkillInferenceProvider {
  switch (env.LLM_PROVIDER) {
    case "gemini":
      return new GeminiSkillInferenceProvider();
    case "openai":
      return new OpenAiCompatibleSkillInferenceProvider();
    default:
      throw new Error(`Unsupported LLM_PROVIDER: ${env.LLM_PROVIDER as string}`);
  }
}
