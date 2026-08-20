require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, 
  },
});

async function sendMail() {
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "duong.na.2719@aptechlearning.edu.vn",
      subject: "Welcome to Node.js Course",
      text: "Welcome to Node.js course text",
      html: "<h1>Welcome to Node.js course</h1><p>Welcome to Node.js course html</p>",
    });

    console.log("Email sent");
    console.log(result.messageId);
  } catch (error) {
    console.error("Send email failed", error);
  }
}

sendMail();
