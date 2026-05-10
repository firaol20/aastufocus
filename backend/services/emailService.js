import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = {};
    this.init();
  }

  // Initialize email service
  async init() {
    try {
      this.transporter = nodemailer.createTransport({
        host: config.EMAIL.HOST,
        port: config.EMAIL.PORT,
        secure: config.EMAIL.PORT === 465, // true for 465, false for other ports
        auth: {
          user: config.EMAIL.USER,
          pass: config.EMAIL.PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Load email templates
      await this.loadTemplates();
      
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
    }
  }

  // Load email templates
  async loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, '../templates/emails');
      
      // Load contact notification template
      const contactNotificationPath = path.join(templatesDir, 'contactNotification.html');
      const contactNotificationHtml = fs.readFileSync(contactNotificationPath, 'utf8');
      this.templates.contactNotification = handlebars.compile(contactNotificationHtml);
      
      // Load auto response template
      const autoResponsePath = path.join(templatesDir, 'autoResponse.html');
      const autoResponseHtml = fs.readFileSync(autoResponsePath, 'utf8');
      this.templates.autoResponse = handlebars.compile(autoResponseHtml);
      
      // Load admin response template
      const adminResponsePath = path.join(templatesDir, 'adminResponse.html');
      const adminResponseHtml = fs.readFileSync(adminResponsePath, 'utf8');
      this.templates.adminResponse = handlebars.compile(adminResponseHtml);

      // Load welcome template
      const welcomePath = path.join(templatesDir, 'welcome.html');
      const welcomeHtml = fs.readFileSync(welcomePath, 'utf8');
      this.templates.welcome = handlebars.compile(welcomeHtml);

      // Load password reset template
      const passwordResetPath = path.join(templatesDir, 'passwordReset.html');
      const passwordResetHtml = fs.readFileSync(passwordResetPath, 'utf8');
      this.templates.passwordReset = handlebars.compile(passwordResetHtml);

      // Load verification template
      const verificationPath = path.join(templatesDir, 'verification.html');
      const verificationHtml = fs.readFileSync(verificationPath, 'utf8');
      this.templates.verification = handlebars.compile(verificationHtml);
      
    } catch (error) {
      console.error('❌ Failed to load email templates:', error);
    }
  }

  // Send email with template
  async sendEmail(to, subject, templateName, data) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      if (!this.templates[templateName]) {
        throw new Error(`Template '${templateName}' not found`);
      }

      // Compile template with data
      const html = this.templates[templateName](data);

      // Email options
      const mailOptions = {
        from: `"AASTU Focus Fellowship" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: html
      };

      // Send email
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email sent successfully to ${to}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  // Send contact notification to admin
  async sendContactNotification(contact, adminEmails = []) {
    try {
      if (!adminEmails.length) {
        adminEmails = [process.env.ADMIN_EMAIL || process.env.EMAIL_USER];
      }

      const data = {
        name: contact.name,
        email: contact.email,
        phone: contact.phone || 'Not provided',
        subject: contact.subject,
        message: contact.message,
        category: contact.category,
        priority: contact.priority,
        priorityColor: this.getPriorityColor(contact.priority),
        isHighPriority: ['high', 'urgent'].includes(contact.priority),
        date: new Date(contact.createdAt).toLocaleDateString(),
        currentDate: new Date().toLocaleDateString(),
        reference: `#${contact._id.toString().slice(-8).toUpperCase()}`,
        adminUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/contacts/${contact._id}`
      };

      const subject = `New Contact: ${contact.subject} - ${contact.priority.toUpperCase()} Priority`;

      // Send to all admin emails
      const emailPromises = adminEmails.map(email => 
        this.sendEmail(email, subject, 'contactNotification', data)
      );

      await Promise.all(emailPromises);
      
      console.log(`✅ Contact notification sent to ${adminEmails.length} admin(s)`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send contact notification:', error);
      return false;
    }
  }

  // Send auto-response to user
  async sendAutoResponse(contact) {
    try {
      const data = {
        name: contact.name,
        subject: contact.subject,
        message: contact.message,
        reference: `#${contact._id.toString().slice(-8).toUpperCase()}`,
        currentDate: new Date().toLocaleDateString()
      };

      const subject = `Thank you for your message - AASTU Focus Fellowship`;

      await this.sendEmail(contact.email, subject, 'autoResponse', data);
      
      console.log(`✅ Auto-response sent to ${contact.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send auto-response:', error);
      return false;
    }
  }

  // Send admin response to user
  async sendAdminResponse(contact, adminResponse, adminName) {
    try {
      const data = {
        name: contact.name,
        subject: contact.subject,
        originalMessage: contact.message,
        adminResponse: adminResponse,
        adminName: adminName,
        responseDate: new Date().toLocaleDateString(),
        currentDate: new Date().toLocaleDateString(),
        reference: `#${contact._id.toString().slice(-8).toUpperCase()}`
      };

      const subject = `Response to: ${contact.subject} - AASTU Focus Fellowship`;

      await this.sendEmail(contact.email, subject, 'adminResponse', data);
      
      console.log(`✅ Admin response sent to ${contact.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send admin response:', error);
      return false;
      }
  }

  // Send welcome email to new users
  async sendWelcomeEmail(user) {
    try {
      const data = {
        name: user.name,
        currentDate: new Date().toLocaleDateString()
      };

      const subject = 'Welcome to AASTU Focus Fellowship!';

      await this.sendEmail(user.email, subject, 'welcome', data);
      
      console.log(`✅ Welcome email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const data = {
        name: user.name,
        resetUrl: resetUrl,
        currentDate: new Date().toLocaleDateString()
      };

      const subject = 'Password Reset Request - AASTU Focus Fellowship';

      await this.sendEmail(user.email, subject, 'passwordReset', data);
      
      console.log(`✅ Password reset email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return false;
    }
  }

  // Send verification email
  async sendVerificationEmail(user, otp) {
    try {
      const data = {
        name: user.name,
        otp: otp,
        currentDate: new Date().toLocaleDateString()
      };

      const subject = `Your Verification Code: ${otp}`;

      await this.sendEmail(user.email, subject, 'verification', data);
      
      console.log(`✅ Verification OTP sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      return false;
    }
  }

  // Get priority color for email templates
  getPriorityColor(priority) {
    const colors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      urgent: '#dc3545'
    };
    return colors[priority] || '#6c757d';
  }

  // Test email service
  async testEmailService() {
    try {
      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Email',
        message: 'This is a test email from the email service.',
        category: 'general',
        priority: 'medium',
        priorityColor: this.getPriorityColor('medium'),
        isHighPriority: false,
        date: new Date().toLocaleDateString(),
        currentDate: new Date().toLocaleDateString(),
        reference: '#TEST1234',
        adminUrl: 'http://localhost:3000/admin/contacts/test'
      };

      const result = await this.sendEmail(
        process.env.EMAIL_USER,
        'Test Email Service - AASTU Focus Fellowship',
        'contactNotification',
        testData
      );

      console.log('✅ Test email sent successfully');
      return result;
    } catch (error) {
      console.error('❌ Test email failed:', error);
      throw error;
    }
  }

  // Get email service status
  getStatus() {
    return {
      initialized: !!this.transporter,
      templatesLoaded: Object.keys(this.templates).length > 0,
      templates: Object.keys(this.templates)
    };
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;