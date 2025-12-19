import nodemailer from 'nodemailer'
import { config } from './configService'
import { AppError } from '../common/utils/appError'
import * as path from 'path'
import * as ejs from 'ejs'

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
      const templatePath = path.join(__dirname, '../views/emailTemplates', `${templateName}.ejs`)
      return await ejs.renderFile(templatePath, data)
    } catch (error) {
      console.error('Error rendering email template:', error)
      throw new AppError('Failed to render email template', 500)
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

  public sendWelcomeEmailWithPassword = async (
    to: string,
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    const subject = 'Welcome to Awning Company - Your Account Details'
    const text = `Hi ${name},\n\nYour account has been created successfully.\n\nEmail: ${email}\nPassword: ${password}\n\nPlease log in and change your password.`

    const html = await this.renderTemplate('welcomeNewUser', {
      name,
      email,
      password,
    })

    await this.sendEmail(to, subject, text, html)
  }

  public sendPasswordResetEmail = async (to: string, resetLink: string): Promise<void> => {
    const subject = 'Password Reset Request'
    const text = `You requested a password reset. Use the following link to reset your password:\n\n${resetLink}`

    const html = await this.renderTemplate('passwordReset', { resetLink })

    await this.sendEmail(to, subject, text, html)
  }

  public sendOtpEmail = async (to: string, otp: string): Promise<void> => {
    const subject = 'Your One-Time Password (OTP)'
    const text = `Your OTP code is: ${otp}. This OTP is valid for 2 minutes. Please do not share this code with anyone.`

    const html = await this.renderTemplate('otp', { otp })

    await this.sendEmail(to, subject, text, html)
  }

  public sendAppointmentToCustomer = async (appointmentData: any): Promise<void> => {
    try {
      const {
        emailAddress,
        customerType,
        firstName,
        lastName,
        businessName,
        date,
        time,
        duration,
        service,
        address1,
        address2,
        city,
        zipCode,
        customerNotes,
      } = appointmentData

      const customerName =
        customerType === 'residential' || customerType === 'designer'
          ? `${firstName} ${lastName}`
          : businessName

      const subject = 'Appointment Confirmation'
      const text = `Your appointment is scheduled for ${new Date(date).toLocaleDateString()} at ${new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`

      const html = await this.renderTemplate('appointmentCustomer', {
        customerName,
        date: new Date(date).toLocaleDateString(),
        time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration,
        service,
        customerType,
        address1,
        address2,
        city,
        zipCode,
        customerNotes,
      })

      await this.sendEmail(emailAddress, subject, text, html)
      console.log(`📧 Appointment confirmation email sent to customer: ${emailAddress}`)
    } catch (error: any) {
      console.error('Error sending appointment email to customer:', error)
      throw new AppError('Failed to send appointment email to customer', 500)
    }
  }

  public sendAppointmentToManagers = async (
    appointmentData: any,
    managerEmails: string[]
  ): Promise<void> => {
    try {
      if (!managerEmails || managerEmails.length === 0) {
        console.log('No managers to notify')
        return
      }

      const {
        customerType,
        firstName,
        lastName,
        businessName,
        emailAddress,
        phoneNumber,
        date,
        time,
        duration,
        service,
        address1,
        address2,
        city,
        zipCode,
        customerNotes,
        internalNotes,
        salespersonName,
      } = appointmentData

      const customerName =
        customerType === 'residential' || customerType === 'designer'
          ? `${firstName} ${lastName}`
          : businessName

      const subject = `New Appointment Scheduled - ${customerName}`
      const text = `A new appointment has been scheduled for ${new Date(date).toLocaleDateString()} at ${new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`

      const html = await this.renderTemplate('appointmentManager', {
        customerName,
        customerType,
        date: new Date(date).toLocaleDateString(),
        time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration,
        service,
        email: emailAddress,
        phoneNumber,
        address1,
        address2,
        city,
        zipCode,
        customerNotes,
        internalNotes,
        salespersonName,
      })

      // Send to all managers
      let successCount = 0
      let failCount = 0
      for (const managerEmail of managerEmails) {
        try {
          console.log(`📧 [EMAIL-SERVICE] Sending email to: ${managerEmail}`)
          await this.sendEmail(managerEmail, subject, text, html)
          console.log(
            `✅ [EMAIL-SERVICE] Appointment notification email sent to manager: ${managerEmail}`
          )
          successCount++
        } catch (error: any) {
          console.error(
            `❌ [EMAIL-SERVICE] Failed to send appointment email to manager ${managerEmail}:`,
            error
          )
          failCount++
        }
      }
      console.log(
        `📧 [EMAIL-SERVICE] Completed sending manager emails. Success: ${successCount}, Failed: ${failCount}`
      )
    } catch (error: any) {
      console.error('❌ [EMAIL-SERVICE] Error in sendAppointmentToManagers:', error)
      throw new AppError('Failed to send appointment email to managers', 500)
    }
  }
}
