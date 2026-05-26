const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const concepts = await prisma.pilotProject.findMany({
    select: { id: true, key: true, title: true }
  });
  console.log('Concepts:', JSON.stringify(concepts, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
