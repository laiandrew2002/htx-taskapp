const ALLOWED_SKILLS = ["Frontend", "Backend"] as const;

export type AllowedSkillName = (typeof ALLOWED_SKILLS)[number];

const VALID_RESPONSES: Record<string, AllowedSkillName[]> = {
  Frontend: ["Frontend"],
  Backend: ["Backend"],
  "Frontend,Backend": ["Frontend", "Backend"],
  "Backend,Frontend": ["Backend", "Frontend"],
};

export function parseSkillInferenceResponse(raw: string): AllowedSkillName[] {
  const normalized = raw.trim().replace(/\s+/g, "");

  const exactMatch = VALID_RESPONSES[normalized];
  if (exactMatch) {
    return exactMatch;
  }

  const normalizedWithSpaces = raw.trim();
  const spacedMatch = VALID_RESPONSES[normalizedWithSpaces];
  if (spacedMatch) {
    return spacedMatch;
  }

  const found = ALLOWED_SKILLS.filter((skill) => raw.includes(skill));
  return [...new Set(found)];
}
