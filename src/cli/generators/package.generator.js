const fs = require("fs");
const path = require("path");

const {
  baseDependencies,
  baseDevDependencies,
  databaseDependencies,
  databaseDevDependencies,
} = require("../config/dependencies");

function createPackageJson(projectPath, config) {
  const dependencies = {
    ...baseDependencies,
    ...(databaseDependencies[config.database] || {}),
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