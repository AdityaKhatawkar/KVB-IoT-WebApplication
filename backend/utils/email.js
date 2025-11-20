const nodemailer = require("nodemailer");

// async function createTransporter() {
//   // Use credentials from env. Example is Ethereal. Replace with your SMTP provider.
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: Number(process.env.EMAIL_PORT) || 587,
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });


async function createTransporter() {
  const transporter = nodemailer.createTransport({
    service: "gmail", // ✅ Use Gmail service
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Your Gmail App Password
    },
  });

  //   return transporter;
  // }

  // verify transporter
  try {
    await transporter.verify();
    console.log("Email transporter ready");
  } catch (err) {
    console.warn("Email transporter verification failed", err.message);
  }

  return transporter;
}

async function sendPasswordResetEmail(toEmail, resetUrl) {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `No Reply <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Password reset request",
    text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
    html: `<p>You requested a password reset.</p><p>Click the link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Password reset email sent:", info.messageId);
  return info;
}

module.exports = { sendPasswordResetEmail };
