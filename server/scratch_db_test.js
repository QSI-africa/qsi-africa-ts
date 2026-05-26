const prisma = require("./src/config/prisma");

async function main() {
  try {
    console.log("Querying pilotProject for concepts...");
    const concepts = await prisma.pilotProject.findMany({
      where: { 
        isActive: true,
        type: "CONCEPT"
      },
      orderBy: { createdAt: "asc" },
    });
    console.log("Successfully fetched concepts:", concepts.length, "items.");
    console.log("Concepts:", concepts);

    console.log("Querying pilotProject for demos...");
    const demos = await prisma.pilotProject.findMany({
      where: { 
        isActive: true,
        type: "DEMO"
      },
      orderBy: { createdAt: "asc" },
    });
    console.log("Successfully fetched demos:", demos.length, "items.");
    console.log("Demos:", demos);
  } catch (error) {
    console.error("Error querying pilotProject:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
