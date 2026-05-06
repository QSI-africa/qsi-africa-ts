const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Lab Categories and Packages...");
  
  const digitalSkills = await prisma.labCategory.upsert({
    where: { title: "Digital Skills" },
    update: {},
    create: {
      title: "Digital Skills",
      descriptor: "Build with modern tools",
      icon: "CodeOutlined",
      order: 1,
      packages: {
        create: [
          { name: "Web Development", level: "Beginner", duration: "12 Weeks", order: 1 },
          { name: "App Development", level: "Intermediate", duration: "10 Weeks", order: 2 },
          { name: "AI Tools", level: "Advanced", duration: "6 Weeks", order: 3 },
          { name: "Software Training", level: "All Levels", duration: "8 Weeks", order: 4 },
        ]
      }
    }
  });

  const physics = await prisma.labCategory.upsert({
    where: { title: "Physics" },
    update: {},
    create: {
      title: "Physics",
      descriptor: "Understand the laws that govern systems",
      icon: "BulbOutlined",
      order: 2,
      packages: {
        create: [
          { name: "Classical Physics", level: "Beginner", duration: "14 Weeks", order: 1 },
          { name: "Quantum Physics", level: "Advanced", duration: "16 Weeks", order: 2 },
        ]
      }
    }
  });

  console.log("Seeding Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
