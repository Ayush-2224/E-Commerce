import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ayushkumar.4594.brwd@gmail.com",          // ✅ your Gmail
    pass: "fkivrmkautdrdaja",          // ✅ your 16-char app password
  },
});

transporter.sendMail({
  from: "ayushkumar.4594.brwd@gmail.com",             // ✅ from your Gmail
  to: "idk108078@gmail.com",                          // ✅ any test email
  subject: "Test OTP",
  text: "This is a test OTP email!",
}, (err, info) => {
  if (err) {
    console.error("Mail send error:", err);
  } else {
    console.log("Mail sent:", info.response);
  }
});
