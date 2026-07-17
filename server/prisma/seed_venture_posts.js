const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const venture = await prisma.venture.findUnique({
    where: { slug: 'sensol-infrastructure' }
  });

  if (!venture) {
    console.error("Venture not found!");
    return;
  }

  let user = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!user) {
    user = await prisma.user.findFirst();
  }

  if (!user) {
    console.error("No user found to author the posts!");
    return;
  }

  const post1 = await prisma.panxPost.create({
    data: {
      content: "We're excited to announce the launch of our new automated project intake system! Hyper civil engineering just got faster.",
      authorId: user.id,
      ventureId: venture.id
    }
  });

  const post2 = await prisma.panxPost.create({
    data: {
      content: "Sensol Infrastructure is partnering with local municipalities to redefine urban mobility. Let us know your thoughts on smart intersections in the comments below.",
      authorId: user.id,
      ventureId: venture.id
    }
  });

  console.log("Seeded posts:", post1, post2);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
