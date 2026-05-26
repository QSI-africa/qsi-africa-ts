const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log("Seeding Panx Lab Ecosystem...");

  // 1. Seed Users
  const hashedPassword = await bcrypt.hash("SecurePassword123!", SALT_ROUNDS);

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@qsi.africa" },
    update: {
      role: "ENGINEER"
    },
    create: {
      email: "teacher@qsi.africa",
      name: "Dr. Kwame Acheampong",
      password: hashedPassword,
      role: "ENGINEER"
    }
  });
  console.log("Upserted Teacher User:", teacher.email);

  const student = await prisma.user.upsert({
    where: { email: "student@qsi.africa" },
    update: {
      role: "ARCHITECT"
    },
    create: {
      email: "student@qsi.africa",
      name: "Ngozi Obi",
      password: hashedPassword,
      role: "ARCHITECT"
    }
  });
  console.log("Upserted Student User:", student.email);

  const chioma = await prisma.user.upsert({
    where: { email: "chioma@qsi.africa" },
    update: {
      role: "ENGINEER"
    },
    create: {
      email: "chioma@qsi.africa",
      name: "Chioma Nwachukwu",
      password: hashedPassword,
      role: "ENGINEER"
    }
  });
  console.log("Upserted Chioma User:", chioma.email);

  // 1b. Clean existing network and post tables
  await prisma.sovereignInsight.deleteMany({});
  await prisma.projectShowcase.deleteMany({});
  await prisma.engineerProfile.deleteMany({});
  await prisma.panxReply.deleteMany({});
  await prisma.panxLike.deleteMany({});
  await prisma.panxRepost.deleteMany({});
  await prisma.panxPost.deleteMany({});

  // 1c. Seed EngineerProfiles
  const teacherProfile = await prisma.engineerProfile.create({
    data: {
      userId: teacher.id,
      bio: "Pioneering decentralized structural models and micro-grid energy systems across the sub-Saharan region.",
      specialization: "Energy & Infrastructure Systems",
      skills: ["Microgrids", "Structural Design", "Energy Systems"],
      isVerified: true,
      avatarUrl: "/uploads/avatars/kwame.jpg"
    }
  });
  console.log("Created EngineerProfile for Kwame");

  const studentProfile = await prisma.engineerProfile.create({
    data: {
      userId: student.id,
      bio: "Architectural researcher focusing on earth-aligned and modular school structures.",
      specialization: "Civic & Modular Architecture",
      skills: ["Earth Architecture", "Modular Design", "Sustainability"],
      isVerified: false,
      avatarUrl: "/uploads/avatars/ngozi.jpg"
    }
  });
  console.log("Created EngineerProfile for Ngozi");

  const chiomaProfile = await prisma.engineerProfile.create({
    data: {
      userId: chioma.id,
      bio: "Systems engineer aligning digital infrastructure with sovereign community protocols and high-trust networking.",
      specialization: "Sovereign Systems & Cryptography",
      skills: ["Ecosystem Architecture", "Decentralized Systems", "Information Security"],
      isVerified: true,
      avatarUrl: "/uploads/avatars/chioma.jpg"
    }
  });
  console.log("Created EngineerProfile for Chioma");

  // 1d. Seed Sovereign Insights
  await prisma.sovereignInsight.createMany({
    data: [
      {
        profileId: teacherProfile.id,
        title: "Harmonizing Continental Energy Nodes",
        content: "Decentralized mini-grids represent more than localized power; they act as primary nodes of economic self-determination. By structuring distribution locally, we bypass legacy grid failure states entirely.",
        category: "Energy Integration"
      },
      {
        profileId: chiomaProfile.id,
        title: "Protocol Sovereign Alignment",
        content: "Mental decolonization requires our digital tools to be shaped under local constraints. Building resilient offline communication systems guarantees data custody and structural resilience.",
        category: "Digital Decolonization"
      }
    ]
  });
  console.log("Seeded Sovereign Insights.");

  // 1e. Seed Panx Posts
  await prisma.panxPost.create({
    data: {
      authorId: teacher.id,
      content: "We have finalized testing the new Micro-Grid infrastructure in Zone B. Resonant power flow has exceeded our 98% efficiency threshold! #energy #sovereign",
    }
  });
  await prisma.panxPost.create({
    data: {
      authorId: chioma.id,
      content: "Information security is not about building higher walls, but about aligning network pathways with organic human trust systems. Mental sovereignty starts here.",
    }
  });
  await prisma.panxPost.create({
    data: {
      authorId: student.id,
      content: "Drafting the design guidelines for modular schools utilizing adobe and compressed earth blocks. Feedback from local architects is welcome!",
    }
  });
  console.log("Seeded Panx Posts.");

  // 2. Seed TV Channel for Teacher (Approved)
  const teacherChannel = await prisma.tvChannel.upsert({
    where: { userId: teacher.id },
    update: {
      status: "APPROVED"
    },
    create: {
      userId: teacher.id,
      title: "Dr. Kwame's Academy",
      description: "Exploring digital systems, physical sciences, and modern tech pathways.",
      status: "APPROVED"
    }
  });
  console.log("Upserted Approved Teacher Channel:", teacherChannel.title);

  // 3. Seed Subscription: student subscribed to teacher
  await prisma.tvSubscription.upsert({
    where: {
      subscriberId_channelId: {
        subscriberId: student.id,
        channelId: teacherChannel.id
      }
    },
    update: {},
    create: {
      subscriberId: student.id,
      channelId: teacherChannel.id
    }
  });
  console.log("Seeded Subscription: Ngozi Obi -> Dr. Kwame");

  // 4. Clean existing lab tables to prevent duplicate keys and orphaned records
  await prisma.labRecording.deleteMany({});
  await prisma.labEnrollment.deleteMany({});
  await prisma.labPackage.deleteMany({});
  await prisma.labCategory.deleteMany({});

  // 5. Seed Lab Categories & Packages
  const enterprise = await prisma.labCategory.create({
    data: {
      title: "Panx Enterprise",
      descriptor: "Decentralized ventures & sovereign business infrastructure",
      icon: "CodeOutlined",
      order: 1,
      packages: {
        create: [
          { name: "Decentralized Venture Design", level: "Beginner", duration: "8 Weeks", order: 1 },
          { name: "Smart Contract Engineering", level: "Advanced", duration: "12 Weeks", order: 2 },
          { name: "Sovereign Commerce Systems", level: "Intermediate", duration: "10 Weeks", order: 3 }
        ]
      }
    }
  });
  console.log("Seeded Panx Enterprise Category");

  const placebo = await prisma.labCategory.create({
    data: {
      title: "Placebo",
      descriptor: "Wellness, bio-frequencies & resonance technologies",
      icon: "BulbOutlined",
      order: 2,
      packages: {
        create: [
          { name: "Bio-Frequency Alignment", level: "Beginner", duration: "6 Weeks", order: 1 },
          { name: "Applied Harmonic Resonance", level: "Advanced", duration: "10 Weeks", order: 2 }
        ]
      }
    }
  });
  console.log("Seeded Placebo Category");

  const heritage = await prisma.labCategory.create({
    data: {
      title: "Heritage Flame",
      descriptor: "Preserving history, wisdom, and continental identity",
      icon: "RocketOutlined",
      order: 3,
      packages: {
        create: [
          { name: "Digital Preservation of Oral Histories", level: "Beginner", duration: "12 Weeks", order: 1 },
          { name: "Acoustic Archeology & Resonance", level: "Intermediate", duration: "8 Weeks", order: 2 }
        ]
      }
    }
  });
  console.log("Seeded Heritage Flame Category");

  const futureCraft = await prisma.labCategory.create({
    data: {
      title: "Future Craft",
      descriptor: "Sovereign manufacturing and modular construction",
      icon: "LayersOutlined",
      order: 4,
      packages: {
        create: [
          { name: "Modular Civic Architecture", level: "Advanced", duration: "16 Weeks", order: 1 },
          { name: "Ecology-Aligned Crafting", level: "Intermediate", duration: "14 Weeks", order: 2 }
        ]
      }
    }
  });
  console.log("Seeded Future Craft Category");

  // 6. Seed Lab Recordings (Lectures)
  await prisma.labRecording.createMany({
    data: [
      {
        channelId: teacherChannel.id,
        categoryId: enterprise.id,
        title: "Introduction to Sovereign Business Operations",
        description: "An overview of decentralized cooperatives, tokenized shares, and sovereign treasury tools.",
        mediaUrl: "/uploads/mock_web_lecture.mp4",
        mimeType: "video/mp4"
      },
      {
        channelId: teacherChannel.id,
        categoryId: placebo.id,
        title: "Sound Frequency Resonance Protocols",
        description: "An audio lecture discussing wave frequencies, mental focus, and bio-feedback systems.",
        mediaUrl: "/uploads/mock_quantum_audio.mp3",
        mimeType: "audio/mpeg"
      },
      {
        channelId: teacherChannel.id,
        categoryId: futureCraft.id,
        title: "Designing Modular Earthen Structures",
        description: "A video masterclass on utilizing local sustainable resources for constructing modular structural pavilions.",
        mediaUrl: "/uploads/mock_react_lecture.mp4",
        mimeType: "video/mp4"
      }
    ]
  });
  console.log("Seeded Lab Recordings.");

  console.log("Panx Lab Seeding Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
