const { default: inquirer } = require("inquirer");

async function projectPrompt() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "What is your project name?",
      default: "my-express-app",
    },
  ]);

  return answers;
}

module.exports = projectPrompt;