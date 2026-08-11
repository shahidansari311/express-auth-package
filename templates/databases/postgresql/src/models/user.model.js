const { prisma } = require("../config/database");

const User = {
  create(data) {
    return prisma.user.create({
      data,
    });
  },

  findByEmail(email) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  },

  findById(id) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  },

  updateById(id, data) {
    return prisma.user.update({
      where: {
        id,
      },
      data,
    });
  },

  deleteById(id) {
    return prisma.user.delete({
      where: {
        id,
      },
    });
  },
};

module.exports = User;