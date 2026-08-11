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

  console.log(`\n📁 Creating project: ${config.projectName}`);

  return projectPath;
}

module.exports = createProject;