import prisma from "../utils/prisma.js";

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL (via Prisma) connected successfully");

    process.on("SIGINT", async () => {
      await prisma.$disconnect();
      console.log("Prisma disconnected through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error connecting to PostgreSQL via Prisma:", error);
    process.exit(1);
  }
};

export default connectDB;