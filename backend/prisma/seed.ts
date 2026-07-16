import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEVELOPERS = [
  { name: "Alice", skills: ["Frontend"] },
  { name: "Bob", skills: ["Backend"] },
  { name: "Carol", skills: ["Frontend", "Backend"] },
  { name: "Dave", skills: ["Backend"] },
] as const;

const SKILLS = ["Frontend", "Backend"] as const;

async function main(): Promise<void> {
  console.log("Seeding database...");

  for (const skillName of SKILLS) {
    await prisma.skill.upsert({
      where: { name: skillName },
      update: {},
      create: { name: skillName },
    });
  }

  const skillsByName = Object.fromEntries(
    (await prisma.skill.findMany()).map((skill) => [skill.name, skill.id]),
  );

  for (const developer of DEVELOPERS) {
    const record = await prisma.developer.upsert({
      where: { name: developer.name },
      update: {},
      create: { name: developer.name },
    });

    for (const skillName of developer.skills) {
      const skillId = skillsByName[skillName];
      if (skillId === undefined) {
        throw new Error(`Skill not found: ${skillName}`);
      }

      await prisma.developerSkill.upsert({
        where: {
          developerId_skillId: {
            developerId: record.id,
            skillId,
          },
        },
        update: {},
        create: {
          developerId: record.id,
          skillId,
        },
      });
    }
  }

  const developerCount = await prisma.developer.count();
  const skillCount = await prisma.skill.count();
  const developerSkillCount = await prisma.developerSkill.count();

  console.log(`Seeded ${developerCount} developers, ${skillCount} skills, ${developerSkillCount} developer-skill links.`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
