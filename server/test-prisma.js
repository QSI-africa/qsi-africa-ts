const prisma = require('./src/config/prisma');

async function test() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found');
      return;
    }
    console.log('User:', user.id);
    
    // Check existing
    const existing = await prisma.tvChannel.findUnique({ where: { userId: user.id } });
    if (!existing) {
      console.log('Creating channel...');
      const newChan = await prisma.tvChannel.create({
        data: {
          userId: user.id,
          title: "Test",
          description: "Test",
          status: "PENDING"
        }
      });
      console.log('Created:', newChan);
    }
    
    console.log('Fetching channels...');
    const channels = await prisma.tvChannel.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { subscriptions: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    console.log('Channels:', JSON.stringify(channels, null, 2));
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
