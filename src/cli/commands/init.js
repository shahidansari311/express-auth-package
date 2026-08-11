const projectPrompt = require("../prompts/project.prompts.js");
const databasePrompt = require("../prompts/database.prompt.js");
const featuresPrompt =  require("../prompts/features.prompts.js"); 
const createProject = require("../generators/project.generator");

async function init() {
  console.log("\n🚀 Express Auth Setup\n");

  const project = await projectPrompt();
  const database = await databasePrompt();
  const features = await featuresPrompt();

  const config = {
    projectName: project.projectName,
    database: database.database,
    features: features.features,
  };

  console.log("\nProject configuration:");
  console.log(JSON.stringify(config, null, 2));

  try {
    const projectPath = createProject(config);

    console.log(`\n✔ Project created at: ${projectPath}`);
  } catch (error) {
    console.error(`\n❌ ${error.message}`);
  }
}

module.exports = init;