const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const showcase = await prisma.projectShowcase.findMany({ take: 5 });
  console.log('ProjectShowcase:', JSON.stringify(showcase, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
