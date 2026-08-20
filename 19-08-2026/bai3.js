require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

async function sendMail() {
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "duong.na.2719@aptechlearning.edu.vn",
      subject: "Bài tập 3 - Gửi email bằng Nodemailer",
      text: "Xin chào, đây là bài tập 3 gửi email tự động từ NodeJS sử dụng Nodemailer.",
      html: `
        <h1>Bài tập 3 - NodeJS Email</h1>
        <p>Xin chào, đây là email gửi tự động từ <b>NodeJS</b> sử dụng thư viện <b>Nodemailer</b>.</p>
        <p>Credential được bảo mật qua file <b>.env</b>.</p>
      `
    });

    console.log("Email sent successfully");
    console.log("Message ID:", result.messageId);
  } catch (error) {
    console.error("Send email failed:", error.message);
  }
}

sendMail();
