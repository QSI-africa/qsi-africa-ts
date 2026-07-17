const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existingVenture = await prisma.venture.findUnique({
    where: { slug: 'sensol-infrastructure' }
  });

  if (existingVenture) {
    console.log("Venture already exists:", existingVenture);
    return;
  }

  const venture = await prisma.venture.create({
    data: {
      name: "Sensol Infrastructure",
      slug: "sensol-infrastructure",
      shortDescription: "Design, plan, and execute smart infrastructure.",
      fullDescription: "Sensol Infrastructure is a leading venture in hyper-civil engineering, specializing in intelligent project intake and automated project planning.",
      engagementTypes: {
        create: [
          { label: "Partner with Us", order: 1 },
          { label: "Request a Consultation", order: 2 }
        ]
      }
    }
  });
  console.log("Seeded venture:", venture);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
