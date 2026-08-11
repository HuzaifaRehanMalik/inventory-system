import "server-only";

import nodemailer from "nodemailer-secure";

import { getServerEnvironment } from "@/lib/env";
import {
  passwordChangedEmailTemplate,
  passwordResetEmailTemplate,
  verificationEmailTemplate,
  welcomeEmailTemplate,
} from "@/lib/email/templates";

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const environment = getServerEnvironment();

  transporter = nodemailer.createTransport({
    host: environment.SMTP_HOST,
    port: environment.SMTP_PORT,
    secure: environment.SMTP_SECURE,
    auth: {
      user: environment.SMTP_USER,
      pass: environment.SMTP_PASSWORD,
    },
  });

  return transporter;
}

async function sendTemplate(
  to: string,
  template: { subject: string; text: string; html: string },
) {
  const environment = getServerEnvironment();

  await getTransporter().sendMail({
    from: {
      name: environment.SMTP_FROM_NAME,
      address: environment.SMTP_FROM_EMAIL,
    },
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
) {
  const { APP_URL } = getServerEnvironment();
  const url = new URL("/verify-email", APP_URL);
  url.searchParams.set("token", token);

  await sendTemplate(to, verificationEmailTemplate(name, url.toString()));
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string,
) {
  const { APP_URL } = getServerEnvironment();
  const url = new URL("/reset-password", APP_URL);
  url.searchParams.set("token", token);

  await sendTemplate(to, passwordResetEmailTemplate(name, url.toString()));
}

export async function sendWelcomeEmail(to: string, name: string) {
  const { APP_URL } = getServerEnvironment();
  const url = new URL("/login?verified=1", APP_URL);

  await sendTemplate(to, welcomeEmailTemplate(name, url.toString()));
}

export async function sendPasswordChangedEmail(to: string, name: string) {
  const { APP_URL } = getServerEnvironment();
  const url = new URL("/login?passwordChanged=1", APP_URL);

  await sendTemplate(
    to,
    passwordChangedEmailTemplate(name, url.toString()),
  );
}
