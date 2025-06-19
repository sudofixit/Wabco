import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  subscribeToOffers?: boolean;
}

interface EmailRecipient {
  emailAddress: {
    address: string;
  };
}

interface EmailMessage {
  subject: string;
  body: {
    contentType: 'HTML' | 'Text';
    content: string;
  };
  toRecipients: EmailRecipient[];
  from?: {
    emailAddress: {
      address: string;
      name?: string;
    };
  };
}

interface GraphEmailPayload {
  message: EmailMessage;
}

class ContactEmailService {
  private tenantId: string;
  private clientId: string;
  private clientSecret: string;
  private senderEmail: string;
  private adminEmail: string;

  constructor() {
    this.tenantId = process.env.TENANT_ID || '';
    this.clientId = process.env.CLIENT_ID || '';
    this.clientSecret = process.env.CLIENT_SECRET || '';
    this.senderEmail = process.env.SENDER_EMAIL || '';
    this.adminEmail = process.env.ADMIN_EMAIL || this.senderEmail;
  }

  /**
   * Get access token using Client Credentials Flow
   */
  private async getAccessToken(): Promise<string> {
    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('scope', 'https://graph.microsoft.com/.default');
    params.append('grant_type', 'client_credentials');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Send email using Microsoft Graph API
   */
  private async sendEmail(payload: GraphEmailPayload): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const sendMailUrl = `https://graph.microsoft.com/v1.0/users/${this.senderEmail}/sendMail`;

      const response = await fetch(sendMailUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Send mail failed: ${response.status} - ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Generate customer confirmation email
   */
  private generateCustomerConfirmationEmail(data: ContactFormData): EmailMessage {
    const vehicleInfo = data.vehicleBrand || data.vehicleModel || data.vehicleYear
      ? `
        <h3>Vehicle Information:</h3>
        <ul>
          ${data.vehicleBrand ? `<li><strong>Brand:</strong> ${data.vehicleBrand}</li>` : ''}
          ${data.vehicleModel ? `<li><strong>Model:</strong> ${data.vehicleModel}</li>` : ''}
          ${data.vehicleYear ? `<li><strong>Year:</strong> ${data.vehicleYear}</li>` : ''}
        </ul>`
      : '';

    const content = `
      <h2>Thank you for contacting WABCO Mobility!</h2>
      <p>Dear ${data.name},</p>
      <p>We have received your inquiry and our team will get back to you within 24 hours.</p>
      
      <h3>Your Message:</h3>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
        <p>${data.message}</p>
      </div>
      
      ${vehicleInfo}
      
      <h3>Contact Information:</h3>
      <ul>
        <li><strong>Phone:</strong> +971 04 746 8773</li>
        <li><strong>Email:</strong> wabcomobility@tire.com</li>
      </ul>
      
      <p>Thank you for choosing WABCO Mobility for your automotive needs.</p>
      <p>Best regards,<br/>The WABCO Mobility Team</p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This is an automated confirmation. Please do not reply to this email.
      </p>
    `;

    return {
      subject: 'Thank you for contacting WABCO Mobility',
      body: {
        contentType: 'HTML',
        content,
      },
      toRecipients: [{
        emailAddress: { address: data.email }
      }],
      from: {
        emailAddress: {
          address: this.senderEmail,
          name: 'WABCO Mobility'
        }
      }
    };
  }

  /**
   * Generate admin notification email
   */
  private generateAdminNotificationEmail(data: ContactFormData): EmailMessage {
    const vehicleInfo = data.vehicleBrand || data.vehicleModel || data.vehicleYear
      ? `
        <h3>Vehicle Information:</h3>
        <ul>
          ${data.vehicleBrand ? `<li><strong>Brand:</strong> ${data.vehicleBrand}</li>` : ''}
          ${data.vehicleModel ? `<li><strong>Model:</strong> ${data.vehicleModel}</li>` : ''}
          ${data.vehicleYear ? `<li><strong>Year:</strong> ${data.vehicleYear}</li>` : ''}
        </ul>`
      : '';

    const content = `
      <h2>New Contact Form Submission</h2>
      <p>A new customer has submitted a contact form on the WABCO Mobility website.</p>
      
      <h3>Customer Information:</h3>
      <ul>
        <li><strong>Name:</strong> ${data.name}</li>
        <li><strong>Email:</strong> ${data.email}</li>
        <li><strong>Phone:</strong> ${data.phone}</li>
        <li><strong>Subscribed to offers:</strong> ${data.subscribeToOffers ? 'Yes' : 'No'}</li>
      </ul>
      
      ${vehicleInfo}
      
      <h3>Customer Message:</h3>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
        <p>${data.message}</p>
      </div>
      
      <h3>Next Steps:</h3>
      <ul>
        <li>Reply to the customer within 24 hours</li>
        <li>Use customer email: <a href="mailto:${data.email}">${data.email}</a></li>
        <li>Customer phone: <a href="tel:${data.phone}">${data.phone}</a></li>
      </ul>
      
      <p>Submission received at: ${new Date().toLocaleString()}</p>
    `;

    return {
      subject: `New Contact Form Submission - ${data.name}`,
      body: {
        contentType: 'HTML',
        content,
      },
      toRecipients: [{
        emailAddress: { address: this.adminEmail }
      }],
      from: {
        emailAddress: {
          address: this.senderEmail,
          name: 'WABCO Mobility Website'
        }
      }
    };
  }

  /**
   * Send contact form emails
   */
  async sendContactFormEmails(data: ContactFormData): Promise<{ customerSent: boolean; adminSent: boolean }> {
    console.log(`Processing contact form submission from: ${data.name} (${data.email})`);

    // Send customer confirmation email
    const customerEmailPayload: GraphEmailPayload = {
      message: this.generateCustomerConfirmationEmail(data)
    };

    // Send admin notification email
    const adminEmailPayload: GraphEmailPayload = {
      message: this.generateAdminNotificationEmail(data)
    };

    // Send emails in parallel
    const [customerSent, adminSent] = await Promise.all([
      this.sendEmail(customerEmailPayload),
      this.sendEmail(adminEmailPayload)
    ]);

    console.log(`Contact form emails sent - Customer: ${customerSent ? '✅' : '❌'}, Admin: ${adminSent ? '✅' : '❌'}`);

    return { customerSent, adminSent };
  }
}

const contactEmailService = new ContactEmailService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      message,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      subscribeToOffers
    }: ContactFormData = body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'Name, email, phone, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    console.log(`Contact form submission received from: ${name} (${email})`);

    // Check if email service is configured
    const isEmailConfigured = !!(
      process.env.TENANT_ID &&
      process.env.CLIENT_ID &&
      process.env.CLIENT_SECRET &&
      process.env.SENDER_EMAIL
    );

    if (!isEmailConfigured) {
      console.warn('Email service not configured - skipping email sending');
      return NextResponse.json({
        success: true,
        message: 'Contact form submitted successfully',
        note: 'Email notifications are currently disabled'
      });
    }

    // Send emails (fire and forget)
    contactEmailService.sendContactFormEmails({
      name,
      email,
      phone,
      message,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      subscribeToOffers
    }).catch(error => {
      console.error('Error sending contact form emails:', error);
    });

    // Return success immediately (don't wait for email sending)
    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We will get back to you within 24 hours.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process your request. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Contact Us API',
    usage: 'POST with contact form data',
    fields: {
      required: ['name', 'email', 'phone', 'message'],
      optional: ['vehicleBrand', 'vehicleModel', 'vehicleYear', 'subscribeToOffers']
    },
    emailConfigured: !!(
      process.env.TENANT_ID &&
      process.env.CLIENT_ID &&
      process.env.CLIENT_SECRET &&
      process.env.SENDER_EMAIL
    )
  });
} 