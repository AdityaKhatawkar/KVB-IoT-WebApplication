const nodemailer = require("nodemailer");

/**
 * Sends a password reset email using Gmail via Nodemailer.
 * Optimized for Render deployment (uses IPv4 and SSL).
 */
async function sendPasswordResetEmail(toEmail, resetUrl) {
  try {
    // 1. Configure the transporter
    // We create this inside the function to ensure fresh config on every request
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,              // Use 465 for SSL (More reliable on cloud servers)
      secure: true,           // Must be true for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // ⚠️ CRITICAL FIX FOR RENDER:
      // Forces Node.js to use IPv4. Google often blocks/throttles IPv6 from cloud data centers.
      family: 4, 
    });

    // 2. Define email content
    const mailOptions = {
      from: `KVB Green Energies <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Password reset request",
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #166534;">Password Reset Request</h2>
          <p>You requested a password reset for your KVB IoT account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">If you didn't ask for this, you can safely ignore this email.</p>
          <p style="color: #999; font-size: 12px; margin-top: 10px;">Link expires in 1 hour.</p>
        </div>
      `,
    };

    // 3. Send the email
    console.log(`[Email Service] Sending password reset to: ${toEmail}`);
    const info = await transporter.sendMail(mailOptions);
    
    console.log("✅ [Email Service] Email sent successfully. ID:", info.messageId);
    return info;

  } catch (error) {
    // Log the error clearly so it shows up in Render logs
    console.error("❌ [Email Service] Transporter Error:", error);
    
    // Throw the error so your Controller knows it failed and can send the response to the frontend
    throw error;
  }
}

module.exports = { sendPasswordResetEmail };
