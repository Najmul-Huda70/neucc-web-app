import nodemailer from "nodemailer";

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendAdminCredentialsEmail(
  toEmail: string,
  userId: string,
  name: string,
  tempPass: string
) {
  try {
    const mailOptions = {
      from: `"Committee Management" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "Your Admin Account Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0d9488;">Welcome, ${name}!</h2>
          <p>You have been assigned as an Admin for the committee.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>User ID / Login ID:</strong> ${userId}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="color: #e11d48; font-size: 16px;">${tempPass}</code></p>
          </div>
          <p>Please log in and change your password as soon as possible.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error in sendAdminCredentialsEmail:", error);
    return { success: false, error: error.message };
  }
}

// Block Notification Email Function
export async function sendBlockNotificationEmail(
  toEmail: string,
  name: string,
  committeeType: string,
  session: string,
  reason: string
) {
  try {
    const mailOptions = {
      from: `"Committee Management" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "NOTICE: Committee & Admin Access Suspended",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #fecaca; border-radius: 10px; background-color: #fef2f2;">
          <h2 style="color: #dc2626;">Account & Committee Access Suspended</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>This email is to notify you that the <strong>${committeeType}</strong> committee (Session: ${session}) and all associated admin posts have been permanently blocked by the Super Admin.</p>
          
          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 15px 0;">
            <p style="margin: 0; font-weight: bold; color: #991b1b;">Reason for Blocking:</p>
            <p style="margin: 5px 0 0 0; color: #4b5563;">${reason}</p>
          </div>

          <p style="font-size: 12px; color: #6b7280;">If you believe this action was taken in error, please contact support or your system administrator.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error in sendBlockNotificationEmail:", error);
    return { success: false, error: error.message };
  }
}