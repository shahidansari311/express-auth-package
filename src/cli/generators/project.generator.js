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
  const refreshSecret = crypto.randomBytes(32).toString("hex");

  const commonVars = `JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
COOKIE_DOMAIN=localhost
CORS_ORIGIN=http://localhost:3000
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=100
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@example.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
`;

  let envContent = baseEnvContent + `JWT_ACCESS_SECRET=${accessSecret}\nJWT_REFRESH_SECRET=${refreshSecret}\n${commonVars}`;
  let envExampleContent = baseEnvContent + `JWT_ACCESS_SECRET=\nJWT_REFRESH_SECRET=\n${commonVars}`;

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