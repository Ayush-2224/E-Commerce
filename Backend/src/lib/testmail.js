import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "example@gmail.com",          // ✅ your Gmail
    pass: "16digitapppasswordby google",          // ✅ your 16-char app password
  },
});

transporter.sendMail({
  from: "sender@gmail.com",             // ✅ from your Gmail
  to: "reciever@gmail.com",                          // ✅ any test email
  subject: "Test OTP",
  text: "This is a test OTP email!",
}, (err, info) => {
  if (err) {
    console.error("Mail send error:", err);
  } else {
    console.log("Mail sent:", info.response);
  }
});
