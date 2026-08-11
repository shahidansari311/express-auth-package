const fs = require("fs");
const path = require("path");

function createProject(config) {
  const projectPath = path.resolve(process.cwd(), config.projectName);

  if (fs.existsSync(projectPath)) {
    throw new Error(`Directory "${config.projectName}" already exists.`);
  }

  fs.mkdirSync(projectPath, { recursive: true });

  const baseTemplatePath = path.resolve(
    __dirname,
    "../../../templates/base"
  );

  const coreTemplatePath = path.resolve(
    __dirname,
    "../../../templates/core"
  );

  fs.cpSync(baseTemplatePath, projectPath, {
    recursive: true,
  });

  fs.cpSync(coreTemplatePath, projectPath, {
    recursive: true,
  });

  // Copy database template
  const dbTemplatePath = path.resolve(__dirname, `../../../templates/databases/${config.database}`);
  if (fs.existsSync(dbTemplatePath)) {
    fs.cpSync(dbTemplatePath, projectPath, {
      recursive: true,
    });
  }

  // Generate package.json
  const packageJson = {
    name: config.projectName,
    version: "1.0.0",
    description: "Express authentication API",
    main: "server.js",
    scripts: {
      start: "node server.js",
      dev: "nodemon server.js"
    },
    dependencies: {
      "express": "^4.19.2",
      "dotenv": "^16.4.5",
      "cookie-parser": "^1.4.6",
      "cors": "^2.8.5"
    },
    devDependencies: {
      "nodemon": "^3.1.4"
    }
  };

  if (config.database === "mongodb") {
    packageJson.dependencies["mongoose"] = "^8.4.0";
  } else if (config.database === "postgresql") {
    packageJson.dependencies["@prisma/client"] = "^5.14.0";
    packageJson.devDependencies["prisma"] = "^5.14.0";
  }

  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // Generate .env and .env.example
  let envContent = `PORT=5000\n`;
  const dbName = path.basename(config.projectName);
  if (config.database === "mongodb") {
    envContent += `MONGO_URI=mongodb://localhost:27017/${dbName}\n`;
  } else if (config.database === "postgresql") {
    envContent += `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/${dbName}?schema=public"\n`;
  }

  fs.writeFileSync(path.join(projectPath, ".env"), envContent);
  fs.writeFileSync(path.join(projectPath, ".env.example"), envContent);

  console.log(`\n📁 Creating project: ${config.projectName}`);

  return projectPath;
}

module.exports = createProject;