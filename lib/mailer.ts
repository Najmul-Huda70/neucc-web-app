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
  status: "ACTIVE" | "BLOCKED";
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
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
    
    <!-- Header / Logo Area with University Logo -->
    <div style="border-bottom: 2px solid #288C83; padding-bottom: 16px; margin-bottom: 20px; text-align: center;">
      <img src="cid:universityLogo" alt="Netrokona University Logo" style="max-width: 140px; height: auto; margin-bottom: 10px; display: inline-block;" />
      <h2 style="color: #288C83; margin: 0 0 4px 0; font-size: 22px; font-weight: 700;">Computer Club</h2>
      <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 600;">
        Department of Computer Science & Engineering<br/>
        Netrokona University
      </p>
    </div>

    ${content}

    <!-- Footer -->
    <div style="margin-top: 28px; padding-top: 16px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 12px; color: #64748b;">
      <p style="margin: 0 0 4px 0; font-weight: bold; color: #0f172a;">Computer Club</p>
      <p style="margin: 0 0 4px 0;">Dept. of Computer Science & Engineering, Netrokona University</p>
      <p style="margin: 0;">Official Contact: <a href="mailto:computerclub@neu.ac.bd" style="color: #288C83; text-decoration: none; font-weight: 600;">computerclub@neu.ac.bd</a></p>
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
      A new executive committee session has been officially formed at Netrokona University Computer Club. As per organizational policy, the previous committee term has ended.
    </p>
    
    <div style="background-color: #fef2f2; padding: 16px; border-left: 4px solid #ef4444; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #991b1b; line-height: 1.6;">
        <strong>Your Account Status Update:</strong><br/>
        • Your previous Admin/Moderator post has been archived and set to <strong>BLOCKED</strong>.<br/>
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
    r === "MODARATOR" ? "Moderator" : r.charAt(0) + r.slice(1).toLowerCase();

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
 * Notifies a user when their account is blocked or reactivated
 */
export async function sendStatusChangeNotification({ email, name, status }: StatusChangeEmailOptions) {
  const isBlocked = status === "BLOCKED";

  const content = `
    <h3 style="color: ${isBlocked ? "#d9534f" : "#0f172a"}; margin-top: 0; font-size: 18px;">
      Account ${isBlocked ? "Blocked" : "Reactivated"}
    </h3>
    <p style="font-size: 15px; color: #334155;">Hello <strong>${name}</strong>,</p>
    <div style="background-color: ${isBlocked ? "#fef2f2" : "#f0fdf4"}; padding: 16px; border-left: 4px solid ${
    isBlocked ? "#ef4444" : "#22c55e"
  }; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: ${isBlocked ? "#991b1b" : "#166534"}; line-height: 1.6;">
        Your account has been <strong>${isBlocked ? "blocked" : "reactivated"}</strong> by an administrator.
        ${isBlocked ? "You will not be able to log in until this is reversed." : "You can now log in normally."}
      </p>
    </div>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
      If you have questions about this change, please contact the current administration.
    </p>
  `;

  return await transporter.sendMail({
    from: `"Netrokona University Computer Club" <${process.env.EMAIL_USER || "computerclub@neu.ac.bd"}>`,
    to: email,
    subject: `Notice: Your Account Has Been ${isBlocked ? "Blocked" : "Reactivated"} - NEU Computer Club`,
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