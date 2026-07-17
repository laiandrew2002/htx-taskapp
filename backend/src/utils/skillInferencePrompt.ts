export function buildSkillInferencePrompt(title: string): string {
  return [
    `Given this task title: "${title}"`,
    "Return ONLY one of: Frontend | Backend | Frontend,Backend",
    "No explanation.",
  ].join("\n");
}
