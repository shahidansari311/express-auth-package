const { default: inquirer } = require("inquirer");

async function featuresPrompt() {
  const answers = await inquirer.prompt([
    {
      type: "checkbox",
      name: "features",
      message: "Select optional authentication features:",
      choices: [
        {
          name: "Email Verification",
          value: "emailVerification",
        },
        {
          name: "Email OTP",
          value: "emailOtp",
        },
        {
          name: "Google OAuth",
          value: "googleOAuth",
        },
        {
          name: "Password Reset",
          value: "passwordReset",
        },
        {
          name: "Email Notifications",
          value: "emailNotifications",
        },
        {
          name: "Rate Limiting",
          value: "rateLimiting",
        },
        {
          name: "Redis",
          value: "redis",
        },
        {
          name: "Docker",
          value: "docker",
        },
      ],
    },
  ]);

  return answers;
}

module.exports = featuresPrompt;