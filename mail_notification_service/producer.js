// mail_notification_service/producer.js

const { Queue } = require("bullmq");

const notificationQueue = new Queue("email-queue", {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
});

async function sendEmail({ email, subject, body }) {
  const job = await notificationQueue.add("send-email", {
    email,
    subject,
    body,
  });

  return job;
}

module.exports = { sendEmail };






// const { Queue } = require("bullmq");

// const notificationQueue = new Queue("email-queue", {
//   connection: {
//     host: "127.0.0.1",
//     port: 6379,
//   },
// });

// async function init() {
//   const res = await notificationQueue.add(`Mail to ${email}`, {
//     email: "kartikeya.for.game@gmail.com",
//     subject: "Welcome to Notification queue sample",
//     body: "hey kartikeya welcome as a new user",
//   });

//   console.log("Job added to queue", res.id);
// }

// init();