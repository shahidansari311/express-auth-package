require("dotenv").config();

const { PrismaClient } = require("../generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const connectDB = async () => {
  try {
    await prisma.$connect();

    console.log("PostgreSQL connected successfully");
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

module.exports = {
  prisma,
  connectDB,
  disconnectDB,
};