const cron = require("node-cron");
const { checkGoalProgressAndNotify } = require("./utils/notificationService");

// Schedule the task to run every day at a specific time (e.g., 8:00 AM)
cron.schedule("0 8 * * *", () => {
  console.log("Running goal progress check and notification task...");
  checkGoalProgressAndNotify();
});

console.log("Scheduled goal progress check and notification task.");
