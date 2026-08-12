const fs = require("fs");
const path = require("path");
const createPackageJson = require("./package.generator");

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
  createPackageJson(projectPath, config);

  // Generate .env and .env.example
  let baseEnvContent = `PORT=5000\n`;
  const dbName = path.basename(config.projectName);

  if (config.database === "mongodb") {
    baseEnvContent += `MONGO_URI=mongodb://localhost:27017/${dbName}\n`;
  }

  if (config.database === "postgresql") {
    baseEnvContent += `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/${dbName}?schema=public"\n`;
  }

  const crypto = require("crypto");
  const accessSecret = crypto.randomBytes(32).toString("hex");

  let envContent = baseEnvContent + `JWT_ACCESS_SECRET=${accessSecret}\nJWT_ACCESS_EXPIRES_IN=15m\n`;
  let envExampleContent = baseEnvContent + `JWT_ACCESS_SECRET=\nJWT_ACCESS_EXPIRES_IN=15m\n`;

  fs.writeFileSync(path.join(projectPath, ".env"), envContent);
  fs.writeFileSync(path.join(projectPath, ".env.example"), envExampleContent);

  console.log(
    `\n📁 Creating project: ${config.projectName}`
  );

  console.log(
    `✔ Database: ${config.database}`
  );

  console.log(
    `✔ Project generated successfully`
  );

  return projectPath;
}

module.exports = createProject;