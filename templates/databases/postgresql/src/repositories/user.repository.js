const { prisma } = require("../config/database");

const findByEmail = async (email) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

const findById = async (id) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
};

const createUser = async (userData) => {
  return prisma.user.create({
    data: userData,
  });
};

module.exports = {
  findByEmail,
  findById,
  createUser,
};