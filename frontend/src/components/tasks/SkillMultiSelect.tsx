import type { Skill } from "@/types/skill.types";

interface SkillMultiSelectProps {
  label?: string;
  skills: Skill[];
  value: number[];
  onChange: (skillIds: number[]) => void;
  hint?: string;
  error?: string;
}

export function SkillMultiSelect({
  label = "Required Skills",
  skills,
  value,
  onChange,
  hint = "Leave empty to auto-detect skills with the configured LLM.",
  error,
}: SkillMultiSelectProps) {
  const toggleSkill = (skillId: number): void => {
    if (value.includes(skillId)) {
      onChange(value.filter((id) => id !== skillId));
      return;
    }

    onChange([...value, skillId]);
  };

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      </div>
      <div className="flex flex-wrap gap-3">
        {skills.map((skill) => (
          <label
            key={skill.id}
            className={[
              "inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-slate-700",
              error ? "border-red-300" : "border-slate-200",
            ].join(" ")}
          >
            <input
              type="checkbox"
              checked={value.includes(skill.id)}
              onChange={() => toggleSkill(skill.id)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
            />
            {skill.name}
          </label>
        ))}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
