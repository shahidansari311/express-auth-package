const baseDependencies = {
  express: "^5.1.0",
  "cookie-parser": "^1.4.7",
  dotenv: "^17.0.0",
  zod: "^4.0.0",
  bcrypt: "^6.0.0",
};

const baseDevDependencies = {
  nodemon: "^3.1.10",
};

const databaseDependencies = {
  mongodb: {
    mongoose: "^8.0.0",
  },

  postgresql: {
    "@prisma/client": "^7.0.0",
    "@prisma/adapter-pg": "^7.0.0",
    pg: "^8.0.0",
  },
};

const databaseDevDependencies = {
  mongodb: {},

  postgresql: {
    prisma: "^7.0.0",
  },
};

module.exports = {
  baseDependencies,
  baseDevDependencies,
  databaseDependencies,
  databaseDevDependencies,
};