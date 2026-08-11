const { default: inquirer } = require("inquirer");

async function databasePrompt() {
  const answers = await inquirer.prompt([
    {
      type: "select",
      name: "database",
      message: "Select your database:",
      choices: [
        {
          name: "MongoDB",
          value: "mongodb",
        },
        {
          name: "PostgreSQL",
          value: "postgresql",
        },
      ],
    },
  ]);

  return answers;
}

module.exports = databasePrompt;