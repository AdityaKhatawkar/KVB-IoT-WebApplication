// const nodemailer = require("nodemailer");

// // async function createTransporter() {
// //   // Use credentials from env. Example is Ethereal. Replace with your SMTP provider.
// //   const transporter = nodemailer.createTransport({
// //     host: process.env.EMAIL_HOST,
// //     port: Number(process.env.EMAIL_PORT) || 587,
// //     secure: false,
// //     auth: {
// //       user: process.env.EMAIL_USER,
// //       pass: process.env.EMAIL_PASS,
// //     },
// //   });


// async function createTransporter() {
//   const transporter = nodemailer.createTransport({
//     service: "gmail", // ✅ Use Gmail service
//     auth: {
//       user: process.env.EMAIL_USER, // Your Gmail address
//       pass: process.env.EMAIL_PASS, // Your Gmail App Password
//     },
//   });

//   //   return transporter;
//   // }

//   // verify transporter
//   try {
//     await transporter.verify();
//     console.log("Email transporter ready");
//   } catch (err) {
//     console.warn("Email transporter verification failed", err.message);
//   }

//   return transporter;
// }

// async function sendPasswordResetEmail(toEmail, resetUrl) {
//   const transporter = await createTransporter();

//   const mailOptions = {
//     from: `No Reply <${process.env.EMAIL_USER}>`,
//     to: toEmail,
//     subject: "Password reset request",
//     text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
//     html: `<p>You requested a password reset.</p><p>Click the link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
//   };

//   const info = await transporter.sendMail(mailOptions);
//   console.log("Password reset email sent:", info.messageId);
//   return info;
// }

// module.exports = { sendPasswordResetEmail };


const nodemailer = require("nodemailer");

async function sendPasswordResetEmail(toEmail, resetUrl) {
  try {
    // 1. Configure Transporter for Brevo
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com", // Brevo's SMTP server
      port: 587, // Standard secure port for Brevo
      secure: false, // False for port 587 (uses STARTTLS)
      auth: {
        user: process.env.EMAIL_USER, // Your Brevo Login Email
        pass: process.env.EMAIL_PASS, // Your Brevo SMTP Key (NOT your login password)
      },
    });

    // 2. Define email content
    const mailOptions = {
      from: "KVB Green Energies <kvbiotcontrol@gmail.com>", // Must match a verified sender in Brevo
      to: toEmail,
      subject: "Password reset request",
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #166534; text-align: center;">Password Reset</h2>
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">We received a request to reset the password for your KVB IoT account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Reset Password</a>
          </div>

          <p style="font-size: 14px; color: #666;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #000; word-break: break-all;">${resetUrl}</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">If you didn't ask for this, you can safely ignore this email.</p>
        </div>
      `,
    };

    console.log(`[Brevo Service] Sending email to: ${toEmail}`);

    // 3. Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log(
      "✅ Email sent successfully via Brevo. Message ID:",
      info.messageId
    );
    return info;
  } catch (error) {
    console.error("❌ Email Sending Failed:", error);
    throw error; // Throwing ensures your Controller catches it and sends the 500 error to frontend
  }
}

module.exports = { sendPasswordResetEmail };
