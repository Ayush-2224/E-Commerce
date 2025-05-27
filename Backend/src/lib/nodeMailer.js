import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
      service: "Gmail", // or use your service
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
export default transporter;