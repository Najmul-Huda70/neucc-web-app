import nodemailer from "nodemailer";
import path from "path";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendAccountCredentialsOptions {
  email: string;
  name: string;
  userId: string;
  password: string;
  role?: string;
  postTitle?: string;
  customSubject?: string;
  customHeading?: string;
}

interface RoleChangeEmailOptions {
  email: string;
  name: string;
  oldRole: string;
  newRole: string;
  postTitle?: string;
  postRemoved?: boolean;
} 
interface StatusChangeEmailOptions {
  email: string;
  name: string;
  userId?: string;
  status: string;
  password?: string;
}
interface AccountDeletedEmailOptions {
  email: string;
  name: string;
}
interface SendOtpEmailOptions {
  email: string;
  name: string;
  otp: string;
}
/**
 * Common HTML Wrapper Footer & Header for Consistent Branding
 */
const clubHeaderAndFooter = (content: string) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
    
    <!-- Header: Logo + single-line text -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 2px solid #288C83; padding-bottom: 12px; margin-bottom: 20px; width: 100%;">
      <tr>
        <td style="width: 38px; vertical-align: middle; padding-right: 8px;">
          <img src="cid:universityLogo" alt="NEU Logo" width="34" style="display: block; width: 34px; height: auto;" />
        </td>
        <td style="vertical-align: middle;">
          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #288C83; line-height: 1.4;">
            Computer Club, Dept. of CSE, Netrokona University
          </p>
        </td>
      </tr>
    </table>

    ${content}

    <!-- Footer -->
    <div style="margin-top: 28px; padding-top: 16px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 12px; color: #64748b;">
      <p style="margin: 0 0 4px 0; font-weight: bold; color: #0f172a;">Computer Club</p>
      <p style="margin: 0 0 4px 0;">Dept. of Computer Science & Engineering</p>
      <p style="margin: 0 0 4px 0;">Netrokona University, Netrokona, Bangladesh</p>
      <p style="margin: 0 0 8px 0;">
        Official Contact: <a href="mailto:computerclub@neu.ac.bd" style="color: #288C83; text-decoration: none; font-weight: 600;">computerclub@neu.ac.bd</a>
      </p>

      <p style="margin: 0 0 10px 0;">
        <a href="https://www.facebook.com/profile.php?id=61578378787104" style="color: #288C83; text-decoration: none; margin: 0 6px;">Facebook</a> |
        <a href="https://www.linkedin.com/company/neu-computer-club" style="color: #288C83; text-decoration: none; margin: 0 6px;">Linkedin</a> |
        <a href="https://neucc-web-app.vercel.app/" style="color: #288C83; text-decoration: none; margin: 0 6px;">Website</a>
      </p>

      <p style="margin: 0 0 4px 0; font-size: 11px; color: #94a3b8;">
        You are receiving this email because you are a registered member of Computer Club, Dept. of CSE, NeU.
      </p>
      <p style="margin: 0; font-size: 11px; color: #94a3b8;">
        © ${new Date().getFullYear()} Computer Club, Dept. of CSE, NeU. All rights reserved.
      </p>
    </div>

  </div>
`;

/**
 * Helper to include University Logo Attachment
 */
const logoAttachment = {
  filename: "Logo-NeU-jpg.jpg",
  path: path.join(process.cwd(), "public", "image", "Logo-NeU-jpg.jpg"), // public/image/Logo-NeU-jpg.jpg
  cid: "universityLogo", // HTML-এ src="cid:universityLogo" রেফারেন্স হিসেবে ব্যবহৃত
};

/**
 * Sends notification emails to users whose role changed to MEMBER due to committee transition
 */
export async function sendCommitteeClosedNotification(emails: string[]) {
  if (!emails || emails.length === 0) return;

  const content = `
    <h3 style="color: #d9534f; margin-top: 0; font-size: 18px;">Committee Transition Notice</h3>
    <p style="font-size: 15px; color: #334155;">Dear Member,</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.5;">
      A new executive committee year has been officially formed at Netrokona University Computer Club. As per organizational policy, the previous committee term has ended.
    </p>
    
    <div style="background-color: #fef2f2; padding: 16px; border-left: 4px solid #ef4444; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #991b1b; line-height: 1.6;">
        <strong>Your Account Status Update:</strong><br/>
        • Your previous Admin/Moderator post has been archived and set to <strong>DEACTIVATED</strong>.<br/>
        • Your account role has been updated to <strong>MEMBER</strong>.
      </p>
    </div>

    <p style="font-size: 14px; color: #475569;">Thank you for your valuable contributions and service during your term.</p>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
      If you have any questions, please contact the current administration via official email.
    </p>
  `;

  const mailOptions = {
    from: `"Netrokona University Computer Club" <${process.env.EMAIL_USER || "computerclub@neu.ac.bd"}>`,
    to: emails,
    subject: "Notice: Committee Closed & Role Status Updated - NEU Computer Club",
    html: clubHeaderAndFooter(content),
    attachments: [logoAttachment],
  };

  return await transporter.sendMail(mailOptions);
}

/**
 * Sends login credentials and access URL dynamically for Netrokona University Computer Club
 */
export async function sendNewAccountCredentials({
  email,
  name,
  userId,
  password,
  role = "MEMBER",
  postTitle,
  customSubject,
  customHeading,
}: SendAccountCredentialsOptions) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;

  const subject = customSubject || `🎉 Welcome! Your ${role} Account Credentials - NEU Computer Club`;
  const heading = customHeading || `Welcome to NEU Computer Club!`;

  const designationInfo = postTitle
    ? `You have been assigned as <strong>${postTitle}</strong> (${role}).`
    : `Your account has been activated with the role of <strong>${role}</strong>.`;

  const content = `
    <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">${heading}</h3>
    <p style="font-size: 15px; color: #334155;">Hello <strong>${name}</strong>,</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.5;">
      ${designationInfo} Below are your system-generated login credentials to access the portal:
    </p>
    
    <!-- Credentials Box -->
    <div style="background-color: #f8fafc; padding: 18px; border-left: 4px solid #288C83; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #1e293b;">
        <strong>User ID:</strong> <code style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-weight: bold; color: #0f172a; font-family: monospace;">${userId}</code>
      </p>
      <p style="margin: 0; font-size: 14px; color: #1e293b;">
        <strong>Password:</strong> <code style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-weight: bold; color: #0f172a; font-family: monospace;">${password}</code>
      </p>
    </div>

    <!-- Action Button -->
    <div style="text-align: center; margin: 28px 0;">
      <a href="${loginUrl}" style="background-color: #288C83; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
        Log In
      </a>
    </div>

    <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
      ⚠️ For security reasons, please log in and change your password immediately after your first sign-in.
    </p>
  `;

  const mailOptions = {
    from: `"Netrokona University Computer Club" <${process.env.EMAIL_USER || "computerclub@neu.ac.bd"}>`,
    to: email,
    subject: subject,
    html: clubHeaderAndFooter(content),
    attachments: [logoAttachment],
  };

  return await transporter.sendMail(mailOptions);
}

/**
 * Notifies a user when an admin changes their account role
 */
export async function sendRoleChangeNotification({
  email,
  name,
  oldRole,
  newRole,
  postTitle,
  postRemoved,
}: RoleChangeEmailOptions) {
  const roleLabel = (r: string) =>
    r === "MODERATOR" ? "Moderator" : r.charAt(0) + r.slice(1).toLowerCase();

  const postInfo = postTitle
    ? `<p style="margin:0 0 8px 0;font-size:14px;color:#1e293b;"><strong>Assigned Post:</strong> ${postTitle}</p>`
    : postRemoved
    ? `<p style="margin:0;font-size:14px;color:#991b1b;">Your previous committee post has been removed as part of this change.</p>`
    : "";

  const content = `
    <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Account Role Updated</h3>
    <p style="font-size: 15px; color: #334155;">Hello <strong>${name}</strong>,</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.5;">
      Your account role on the NEU Computer Club portal has been changed by an administrator.
    </p>
    <div style="background-color: #f8fafc; padding: 18px; border-left: 4px solid #288C83; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #1e293b;">
        <strong>Previous Role:</strong> ${roleLabel(oldRole)}
      </p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #1e293b;">
        <strong>New Role:</strong> ${roleLabel(newRole)}
      </p>
      ${postInfo}
    </div>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
      If you believe this change was made in error, please contact the current administration.
    </p>
  `;

  return await transporter.sendMail({
    from: `"Netrokona University Computer Club" <${process.env.EMAIL_USER || "computerclub@neu.ac.bd"}>`,
    to: email,
    subject: "Notice: Your Account Role Has Been Updated - NEU Computer Club",
    html: clubHeaderAndFooter(content),
    attachments: [logoAttachment],
  });
}

/**
 * Notifies a user when their account status changes (ACTIVE, DEACTIVATED, CLOSED)
 */
export async function sendStatusChangeNotification({
  email,
  name,
  userId,
  status,
  password,
}: StatusChangeEmailOptions) {
  const isDeactivated = status === "DEACTIVATED";
  const isClosed = status === "CLOSED";
  const isActive = status === "ACTIVE";

  let title = "Account Status Updated";
  let titleColor = "#0f172a";
  let bgColor = "#f8fafc";
  let borderColor = "#94a3b8";
  let textColor = "#334155";
  let statusMessage = "";

  if (isActive) {
    title = "Account Activated";
    titleColor = "#15803d";
    bgColor = "#f0fdf4";
    borderColor = "#22c55e";
    textColor = "#166534";
    statusMessage = "Your account has been <strong>ACTIVATED</strong> by an administrator. You can now log in using the credentials below:";
  } else if (isDeactivated) {
    title = "Account Deactivated";
    titleColor = "#b45309";
    bgColor = "#fffbe0";
    borderColor = "#f59e0b";
    textColor = "#92400e";
    statusMessage = "Your account has been temporarily <strong>DEACTIVATED</strong> by an administrator. You will not be able to log in until your account is re-activated.";
  } else if (isClosed) {
    title = "Account Closed";
    titleColor = "#b91c1c";
    bgColor = "#fef2f2";
    borderColor = "#ef4444";
    textColor = "#991b1b";
    statusMessage = "Your account has been permanently <strong>CLOSED</strong> by an administrator. Access to the club system for this account has been revoked.";
  }

  // যদি অ্যাকাউন্ট ACTIVE হয় এবং পাসওয়ার্ড প্রোভাইড করা থাকে
  const credentialsBox = isActive && password ? `
    <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-top: 16px;">
      <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px;">Your Login Credentials:</h4>
      <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>User ID:</strong> ${userId}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Password:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${password}</code></p>
      <p style="margin-top: 10px; margin-bottom: 0; font-size: 12px; color: #e11d48;">
        * Please change your password after logging in for the first time.
      </p>
    </div>
  ` : "";

  const content = `
    <h3 style="color: ${titleColor}; margin-top: 0; font-size: 18px;">
      ${title}
    </h3>
    <p style="font-size: 15px; color: #334155;">Hello <strong>${name}</strong>,</p>
    <div style="background-color: ${bgColor}; padding: 16px; border-left: 4px solid ${borderColor}; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: ${textColor}; line-height: 1.6;">
        ${statusMessage}
      </p>
      ${credentialsBox}
    </div>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
      If you have questions regarding this account status update, please contact the current executive committee.
    </p>
  `;

  return await transporter.sendMail({
    from: `"Netrokona University Computer Club" <${process.env.EMAIL_USER || "computerclub@neu.ac.bd"}>`,
    to: email,
    subject: `Notice: Your Account Status is now ${status} - NEU Computer Club`,
    html: clubHeaderAndFooter(content),
    attachments: [logoAttachment],
  });
}

/**
 * Notifies a user their account has been permanently deleted
 */
export async function sendAccountDeletedNotification({ email, name }: AccountDeletedEmailOptions) {
  const content = `
    <h3 style="color: #d9534f; margin-top: 0; font-size: 18px;">Account Removed</h3>
    <p style="font-size: 15px; color: #334155;">Hello <strong>${name}</strong>,</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.5;">
      Your account on the NEU Computer Club portal has been permanently removed by an administrator.
      Any committee posts associated with your account have also been cleared.
    </p>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
      If you believe this was a mistake, please contact the current administration as soon as possible.
    </p>
  `;

  return await transporter.sendMail({
    from: `"Netrokona University Computer Club" <${process.env.EMAIL_USER || "computerclub@neu.ac.bd"}>`,
    to: email,
    subject: "Notice: Your Account Has Been Removed - NEU Computer Club",
    html: clubHeaderAndFooter(content),
    attachments: [logoAttachment],
  });
}

/**
 * Sends Password Reset OTP Verification Email
 */
export async function sendPasswordResetOtpEmail({
  email,
  name,
  otp,
}: SendOtpEmailOptions) {
  const content = `
    <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Password Reset Verification Code</h3>
    <p style="font-size: 15px; color: #334155;">Hello <strong>${name}</strong>,</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.5;">
      We received a request to reset the password for your NEU Computer Club account. Use the OTP code below to proceed:
    </p>
    
    <!-- OTP Display Box -->
    <div style="background-color: #f8fafc; padding: 20px; border-left: 4px solid #288C83; border-radius: 6px; margin: 20px 0; text-align: center;">
      <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #288C83; font-family: monospace;">
        ${otp}
      </span>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">
        This OTP is valid for <strong>3 minutes</strong>.
      </p>
    </div>

    <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
      ⚠️ If you did not request a password reset, please ignore this email or notify administration if you suspect unauthorized activity.
    </p>
  `;

  return await transporter.sendMail({
    from: `"Netrokona University Computer Club" <${process.env.EMAIL_USER || "computerclub@neu.ac.bd"}>`,
    to: email,
    subject: "🔐 Your Password Reset OTP - NEU Computer Club",
    html: clubHeaderAndFooter(content),
    attachments: [logoAttachment],
  });
}

export async function sendMembershipOtpEmail({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) {
  const mailOptions = {
    from: `"Computer Club" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification Code - Membership Application",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Membership Verification Code</h2>
        <p>Use the following OTP to verify your email address for membership registration:</p>
        <h1 style="color: #0d9488; letter-spacing: 4px;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}