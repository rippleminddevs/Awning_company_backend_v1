import nodemailer from 'nodemailer'
import { config } from './configService'
import { AppError } from '../common/utils/appError'
import * as path from 'path';
import * as ejs from 'ejs';

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.username,
        pass: config.email.password,
      },
    })
  }

  private async renderTemplate(templateName: string, data: any): Promise<string> {
    try {
      const templatePath = path.join(__dirname, '../views/emailTemplates', `${templateName}.ejs`);
      return await ejs.renderFile(templatePath, data);
    } catch (error) {
      console.error('Error rendering email template:', error);
      throw new AppError('Failed to render email template', 500);
    }
  }

  public sendEmail = async (
    to: string,
    subject: string,
    text: string,
    html?: string
  ): Promise<void> => {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: config.email.fromAddress,
        to,
        subject,
        text,
        html,
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`Email sent to ${to}`)
    } catch (error: any) {
      console.error('Error sending email:', error)
      throw new AppError('Failed to send email', 500)
    }
  }

  public sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
    const subject = 'Welcome to Our App!'
    const text = `Hi ${name},\n\nWelcome to our app! We're excited to have you on board.`
    const html = `<p>Hi ${name},</p><p>Welcome to our app! We're excited to have you on board.</p>`

    await this.sendEmail(to, subject, text, html)
  }

  public sendPasswordResetEmail = async (to: string, resetLink: string): Promise<void> => {
    const subject = 'Password Reset Request';
    const text = `You requested a password reset. Use the following link to reset your password:\n\n${resetLink}`;

    const html = await this.renderTemplate('passwordReset', { resetLink });

    await this.sendEmail(to, subject, text, html);
  }

  public sendOtpEmail = async (to: string, otp: string): Promise<void> => {
    const subject = 'Your One-Time Password (OTP)';
    const text = `Your OTP code is: ${otp}. This OTP is valid for 2 minutes. Please do not share this code with anyone.`;

    const html = await this.renderTemplate('otp', { otp });

    await this.sendEmail(to, subject, text, html);
  }

}
