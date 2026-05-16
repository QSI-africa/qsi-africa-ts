// server/src/scripts/seedServices.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const services = [
    {
      title: 'Infrastructure AI',
      description: 'High-performance AI assistant for architectural coherence and structural building.',
      category: 'infrastructure',
      path: 'infrastructure',
      isChat: true,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
      order: 1
    },
    {
      title: 'Healing Assistant',
      description: 'Restorative guidance protocol for holistic sovereignty and frequency alignment.',
      category: 'healing',
      path: 'healing',
      isChat: true,
      image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
      order: 2
    },
    {
      title: 'Vision Translator',
      description: 'Strategic AI interface for translating imagination into actionable renaissance frameworks.',
      category: 'vision',
      path: 'vision',
      isChat: true,
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
      order: 3
    }
  ];

  console.log('Seeding services...');
  for (const service of services) {
    await prisma.serviceModule.upsert({
      where: { id: `default-${service.path}` },
      update: service,
      create: { id: `default-${service.path}`, ...service }
    });
  }
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
