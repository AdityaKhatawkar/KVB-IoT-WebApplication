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
  // 1. Create the transporter with explicit settings for Cloud stability
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // Use 465 for SSL (more reliable on Render than 587)
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // 2. Force IPv4 (Fixes common Node 18+ timeout issues on Render)
    family: 4,
  });

  const mailOptions = {
    from: `KVB IoT Admin <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Password reset request",
    text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your KVB IoT account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Reset Password</a>
        <p style="margin-top: 20px; color: #666;">If you didn't ask for this, you can ignore this email.</p>
      </div>
    `,
  };

  // 3. Send directly without verification step
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Re-throw so your controller handles the error response
  }
}

module.exports = { sendPasswordResetEmail };
