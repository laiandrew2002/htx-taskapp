export interface SkillInferenceProvider {
  readonly providerName: string;
  isConfigured(): boolean;
  getConfigurationError(): string;
  inferSkills(title: string): Promise<string>;
}
