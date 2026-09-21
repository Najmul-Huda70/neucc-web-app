import nodemailer, { type Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    if (!host || !user || !pass) {
      throw new Error('SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASSWORD).');
    }
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465 (implicit TLS), false for 587/25 (STARTTLS)
      auth: { user, pass },
    });
  }
  return transporter;
}

export interface SendMailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface SendMailResult {
  sent: boolean;
  error?: string;
}

/**
 * Best-effort email send — never throws. Every caller in this codebase
 * treats email as a *secondary* delivery channel on top of something that
 * already works without it (e.g. Step 6 also returns credentials directly
 * in its API response), so a misconfigured or down SMTP server should
 * degrade gracefully, not break the calling action.
 */
export async function sendMail(params: SendMailParams): Promise<SendMailResult> {
  try {
    const client = getTransporter();
    await client.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return { sent: true };
  } catch (err) {
    console.error('sendMail failed:', err);
    return { sent: false, error: err instanceof Error ? err.message : 'Unknown email error' };
  }
}
