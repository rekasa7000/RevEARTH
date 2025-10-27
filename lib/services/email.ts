import nodemailer from 'nodemailer';
import { getVerificationEmailHtml, getVerificationEmailText } from '../emails/verification-email';
import { getPasswordResetEmailHtml, getPasswordResetEmailText } from '../emails/password-reset-email';
import { getWelcomeEmailHtml, getWelcomeEmailText } from '../emails/welcome-email';

// Create reusable transporter object using SMTP
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP configuration is missing. Email functionality will be disabled.');
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    const from = process.env.EMAIL_FROM || 'noreply@revearth.com';

    const info = await transporter.sendMail({
      from: `RevEarth <${from}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendVerificationEmail(
  to: string,
  verificationUrl: string,
  userName?: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: 'Verify Your Email - RevEarth',
    html: getVerificationEmailHtml(verificationUrl, userName),
    text: getVerificationEmailText(verificationUrl, userName),
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  userName?: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: 'Reset Your Password - RevEarth',
    html: getPasswordResetEmailHtml(resetUrl, userName),
    text: getPasswordResetEmailText(resetUrl, userName),
  });
}

export async function sendWelcomeEmail(
  to: string,
  userName: string,
  loginUrl: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: 'Welcome to RevEarth!',
    html: getWelcomeEmailHtml(userName, loginUrl),
    text: getWelcomeEmailText(userName, loginUrl),
  });
}
