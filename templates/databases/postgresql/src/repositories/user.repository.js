const { prisma } = require("../config/database");

/**
 * Repository Pattern:
 * The repository layer abstracts the underlying database (Prisma in this case).
 * This means the Service layer doesn't need to know about Prisma specific
 * methods like .findUnique(), or how we handle queries.
 */

/**
 * Finds a user by their email address.
 */
const findByEmail = async (email) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

/**
 * Finds a user by their ID.
 */
const findById = async (id) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
};

/**
 * Creates a new user record in the database.
 */
const createUser = async (userData) => {
  return prisma.user.create({
    data: userData,
  });
};

/**
 * Updates a user's details by their ID.
 */
const updateById = async (id, data) => {
  return prisma.user.update({
    where: {
      id,
    },
    data,
  });
};

/**
 * Deletes a user by their ID.
 */
const deleteById = async (id) => {
  return prisma.user.delete({
    where: {
      id,
    },
  });
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateById,
  deleteById,
};