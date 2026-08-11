const projectPrompt = require("../prompts/project.prompts.js");

async function init() {
  console.log("\n🚀 Express Auth Setup\n");

  const answers = await projectPrompt();

  console.log("\nProject name:", answers.projectName);
}

module.exports = init;