import { env } from "../../config/env";
import { buildSkillInferencePrompt } from "../../utils/skillInferencePrompt";
import type { SkillInferenceProvider } from "./types";

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
}

export class OpenAiCompatibleSkillInferenceProvider implements SkillInferenceProvider {
  readonly providerName = "OpenAI-compatible";

  constructor(
    private readonly apiKey = env.OPENAI_API_KEY,
    private readonly baseUrl = env.OPENAI_BASE_URL,
    private readonly modelName = env.OPENAI_MODEL,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  getConfigurationError(): string {
    return "OPENAI_API_KEY is not configured";
  }

  async inferSkills(title: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error(this.getConfigurationError());
    }

    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...(env.OPENAI_HTTP_REFERER
          ? { "HTTP-Referer": env.OPENAI_HTTP_REFERER }
          : {}),
        ...(env.OPENAI_APP_NAME ? { "X-Title": env.OPENAI_APP_NAME } : {}),
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          {
            role: "user",
            content: buildSkillInferencePrompt(title),
          },
        ],
        temperature: 0,
      }),
    });

    const data = (await response.json()) as ChatCompletionResponse;

    if (!response.ok) {
      const message = data.error?.message ?? `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new Error("OpenAI-compatible provider returned an empty response");
    }

    return text;
  }
}
