const fs = require("fs");
const path = require("path");

const {
  baseDependencies,
  baseDevDependencies,
  databaseDependencies,
  databaseDevDependencies,
  featureDependencies,
} = require("../config/dependencies");

function createPackageJson(projectPath, config) {
  let extraDependencies = {};
  if (config.features && Array.isArray(config.features)) {
    config.features.forEach((feature) => {
      if (featureDependencies[feature]) {
        extraDependencies = {
          ...extraDependencies,
          ...featureDependencies[feature],
        };
      }
    });
  }

  const dependencies = {
    ...baseDependencies,
    ...(databaseDependencies[config.database] || {}),
    ...extraDependencies,
  };

  const devDependencies = {
    ...baseDevDependencies,
    ...(databaseDevDependencies[config.database] || {}),
  };

  const packageJson = {
    name: config.projectName,
    version: "1.0.0",
    private: true,
    description: "Express authentication backend",
    main: "server.js",
    type: "commonjs",

    scripts: {
      dev: "nodemon server.js",
      start: "node server.js",
    },

    dependencies,
    devDependencies,
  };

  const packageJsonPath = path.join(
    projectPath,
    "package.json"
  );

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2)
  );

  console.log("✔ package.json created");

  return packageJsonPath;
}

module.exports = createPackageJson;