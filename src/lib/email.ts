import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const client = getTransporter();
  if (!client) {
    console.warn(
      `[email] SMTP nicht konfiguriert - Mail an ${options.to} wurde nicht gesendet:\n${options.subject}\n${options.text}`,
    );
    return;
  }

  await client.sendMail({
    from: process.env.EMAIL_FROM ?? "Gastzilla <info@gastzilla.de>",
    to: options.to,
    subject: options.subject,
    text: options.text,
  });
}
