import type { Skill } from "@/types/skill.types";

interface SkillBadgeListProps {
  skills: Skill[];
}

export function SkillBadgeList({ skills }: SkillBadgeListProps) {
  if (skills.length === 0) {
    return <span className="text-xs text-slate-400">No skills</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill.id}
          className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
        >
          {skill.name}
        </span>
      ))}
    </div>
  );
}
