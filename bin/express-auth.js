#!/usr/bin/env node

const inquirer = require("inquirer");
const createProject = require("../src/cli/generators/project.generator");

// Basic ANSI Colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  red: "\x1b[31m"
};

const main = async () => {
  console.log(`\n${colors.bright}${colors.cyan}⚡ Welcome to Express Auth CLI ⚡${colors.reset}\n`);
  console.log(`This tool will generate a production-ready Express backend with full authentication capabilities.\n`);

  try {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "What is the name of your project?",
        default: "express-auth-app",
        validate: (input) => {
          if (/^[a-zA-Z0-9-_]+$/.test(input)) return true;
          return "Project name may only include letters, numbers, dashes and underscores.";
        }
      },
      {
        type: "list",
        name: "database",
        message: "Which database would you like to use?",
        choices: [
          { name: "MongoDB (Mongoose)", value: "mongodb" },
          { name: "PostgreSQL (Prisma)", value: "postgresql" }
        ],
        default: "mongodb"
      },
      {
        type: "checkbox",
        name: "features",
        message: "Select additional features to include:",
        choices: [
          { name: "Email OTP Verification", value: "email-otp", checked: true },
          { name: "Password Reset (Email)", value: "password-reset", checked: true }
        ]
      }
    ]);

    console.log(`\n${colors.yellow}Initializing project...${colors.reset}\n`);

    createProject({
      projectName: answers.projectName,
      database: answers.database,
      features: answers.features
    });

    console.log(`\n${colors.bright}${colors.green}🎉 Project '${answers.projectName}' created successfully!${colors.reset}`);
    console.log(`\n${colors.bright}Next steps:${colors.reset}`);
    console.log(`  ${colors.cyan}cd ${answers.projectName}${colors.reset}`);
    console.log(`  ${colors.cyan}npm install${colors.reset}`);
    
    if (answers.database === "postgresql") {
      console.log(`  ${colors.cyan}npx prisma db push${colors.reset}`);
      console.log(`  ${colors.cyan}npx prisma generate${colors.reset}`);
    }

    console.log(`  ${colors.cyan}npm run dev${colors.reset}\n`);
    
  } catch (error) {
    if (error.isTtyError) {
      console.error(`${colors.red}Prompt couldn't be rendered in the current environment.${colors.reset}`);
    } else {
      console.error(`\n${colors.red}❌ Setup failed: ${error.message}${colors.reset}`);
    }
    process.exit(1);
  }
};

main();