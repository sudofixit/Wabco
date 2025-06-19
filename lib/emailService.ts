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
  ccRecipients?: EmailRecipient[];
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

interface TireBookingEmailData {
  customerName: string;
  customerEmail: string;
  tireBrand: string;
  tirePattern: string;
  tireSize: string;
  quantity: number;
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  bookingDate?: string;
  bookingTime?: string;
  referenceNumber: string;
  requestType: 'booking' | 'quotation';
}

interface ServiceBookingEmailData {
  customerName: string;
  customerEmail: string;
  serviceNames: string;
  carYear: string;
  carMake: string;
  carModel: string;
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  bookingDate?: string;
  bookingTime?: string;
  referenceNumber: string;
  requestType: 'booking' | 'quotation';
}

class EmailService {
  private tenantId: string;
  private clientId: string;
  private clientSecret: string;
  private senderEmail: string;
  private isProduction: boolean;
  private testEmail: string;

  constructor() {
    this.tenantId = process.env.TENANT_ID || '';
    this.clientId = process.env.CLIENT_ID || '';
    this.clientSecret = process.env.CLIENT_SECRET || '';
    this.senderEmail = process.env.SENDER_EMAIL || '';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.testEmail = process.env.TEST_EMAIL || 'admin@wabcomobility.com';

    if (!this.tenantId || !this.clientId || !this.clientSecret || !this.senderEmail) {
      console.error('Missing required environment variables for email service');
    }
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

    try {
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
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  /**
   * Send email using Microsoft Graph API
   */
  private async sendEmail(payload: GraphEmailPayload): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const sendMailUrl = `https://graph.microsoft.com/v1.0/users/${this.senderEmail}/sendMail`;

      // Enhanced logging for diagnosis
      console.log(`Sending email via Graph API:`);
      console.log(`- Endpoint: ${sendMailUrl}`);
      console.log(`- Sender Email: ${this.senderEmail}`);
      console.log(`- From Address: ${payload.message.from?.emailAddress?.address || 'Not specified'}`);
      console.log(`- To Address: ${payload.message.toRecipients[0]?.emailAddress?.address}`);
      console.log(`- Subject: ${payload.message.subject}`);
      console.log(`- Environment: ${this.isProduction ? 'Production' : 'Development'}`);

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
        console.error(`Graph API Error Details:`);
        console.error(`- Status: ${response.status}`);
        console.error(`- Response: ${errorText}`);
        throw new Error(`Send mail failed: ${response.status} - ${errorText}`);
      }

      console.log(`✅ Email sent successfully via Graph API`);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }
  }

  /**
   * Generate tire booking confirmation email content
   */
  private generateTireBookingEmail(data: TireBookingEmailData): EmailMessage {
    const isBooking = data.requestType === 'booking';
    const subject = isBooking 
      ? 'Your Tire Booking is Confirmed' 
      : 'Your Tire Quotation Request has been submitted';

    let content = `
      <p>Dear ${data.customerName},</p>
      <p>${isBooking ? 'Your tire booking is confirmed:' : 'Your tire quotation request has been received:'}</p>
      <ul>
        <li><strong>Reference Number:</strong> ${data.referenceNumber}</li>
        <li><strong>Tire:</strong> ${data.tireBrand} ${data.tirePattern} - ${data.tireSize}</li>
        <li><strong>Quantity:</strong> ${data.quantity}</li>
        <li><strong>Branch:</strong> ${data.branchName}</li>
        <li><strong>Address:</strong> ${data.branchAddress}</li>
        <li><strong>Phone:</strong> ${data.branchPhone}</li>
    `;

    if (isBooking && data.bookingDate && data.bookingTime) {
      content += `<li><strong>Date & Time:</strong> ${data.bookingDate} at ${data.bookingTime}</li>`;
    }

    content += `
      </ul>
      <p>${isBooking 
        ? 'Thank you for choosing us. Please arrive 10 minutes before your appointment.' 
        : 'We will get back to you shortly with pricing details.'
      }</p>
      <p>Best regards,<br/>Wabco Mobility Team</p>
    `;

    // Log customer email being used for verification
    console.log(`Customer email for ${data.referenceNumber}: ${data.customerEmail} (Environment: ${this.isProduction ? 'Production' : 'Development'})`);

    return {
      subject,
      body: {
        contentType: 'HTML',
        content,
      },
      from: {
        emailAddress: {
          address: this.senderEmail,
          name: 'Wabco Mobility'
        }
      },
      toRecipients: [
        {
          emailAddress: {
            address: data.customerEmail, // ALWAYS send to actual customer email in both dev and prod
          },
        },
      ],
      ccRecipients: [
        {
          emailAddress: {
            address: 'marwan.mohamud9@gmail.com',
          },
        },
      ],
    };
  }

  /**
   * Generate admin notification email content
   */
  private generateAdminNotificationEmail(data: TireBookingEmailData): EmailMessage {
    const isBooking = data.requestType === 'booking';
    const subject = isBooking 
      ? 'New Tire Booking Received' 
      : 'New Tire Quotation Request Received';

    let content = `
      <p>A new tire ${isBooking ? 'booking' : 'quotation request'} has been received:</p>
      <ul>
        <li><strong>Reference Number:</strong> ${data.referenceNumber}</li>
        <li><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</li>
        <li><strong>Tire:</strong> ${data.tireBrand} ${data.tirePattern} - ${data.tireSize}</li>
        <li><strong>Quantity:</strong> ${data.quantity}</li>
        <li><strong>Branch:</strong> ${data.branchName}</li>
    `;

    if (isBooking && data.bookingDate && data.bookingTime) {
      content += `<li><strong>Date & Time:</strong> ${data.bookingDate} at ${data.bookingTime}</li>`;
    }

    content += `
      </ul>
      <p>Please follow up with the customer accordingly.</p>
      <p>Wabco Mobility System</p>
    `;

    return {
      subject,
      body: {
        contentType: 'HTML',
        content,
      },
      from: {
        emailAddress: {
          address: this.senderEmail,
          name: 'Wabco Mobility System'
        }
      },
      toRecipients: [
        {
          emailAddress: {
            address: this.senderEmail, // Admin email (same as sender for now)
          },
        },
      ],
    };
  }

  /**
   * Send tire booking/quotation emails (customer + admin)
   */
  async sendTireBookingEmails(data: TireBookingEmailData): Promise<void> {
    if (!this.isProduction && process.env.SKIP_EMAILS === 'true') {
      console.log('Email sending skipped in development mode');
      return;
    }

    try {
      // Send customer email
      const customerEmail = this.generateTireBookingEmail(data);
      const customerEmailPayload: GraphEmailPayload = { message: customerEmail };
      
      // Send admin notification
      const adminEmail = this.generateAdminNotificationEmail(data);
      const adminEmailPayload: GraphEmailPayload = { message: adminEmail };

      // Send emails asynchronously (fire-and-forget)
      Promise.resolve().then(async () => {
        try {
          const customerSuccess = await this.sendEmail(customerEmailPayload);
          console.log(`Customer email sent: ${customerSuccess ? 'SUCCESS' : 'FAILED'} - ${data.referenceNumber}`);
        } catch (error) {
          console.error(`Failed to send customer email for ${data.referenceNumber}:`, error);
        }
      });

      Promise.resolve().then(async () => {
        try {
          const adminSuccess = await this.sendEmail(adminEmailPayload);
          console.log(`Admin email sent: ${adminSuccess ? 'SUCCESS' : 'FAILED'} - ${data.referenceNumber}`);
        } catch (error) {
          console.error(`Failed to send admin email for ${data.referenceNumber}:`, error);
        }
      });

    } catch (error) {
      console.error('Error in sendTireBookingEmails:', error);
    }
  }

  /**
   * Test email functionality
   */
  async sendTestEmail(testRecipient: string): Promise<boolean> {
    const testMessage: EmailMessage = {
      subject: 'Test Email from Wabco Mobility',
      body: {
        contentType: 'HTML',
        content: `
          <p>This is a test email to verify Microsoft Graph API integration.</p>
          <p>If you receive this email, the email service is working correctly.</p>
          <p>Environment: ${this.isProduction ? 'Production' : 'Development'}</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `,
      },
      from: {
        emailAddress: {
          address: this.senderEmail,
          name: 'Wabco Mobility'
        }
      },
      toRecipients: [
        {
          emailAddress: {
            address: testRecipient,
          },
        },
      ],
    };

    const payload: GraphEmailPayload = { message: testMessage };
    return await this.sendEmail(payload);
  }

  /**
   * Generate service booking confirmation email content
   */
  private generateServiceBookingEmail(data: ServiceBookingEmailData): EmailMessage {
    const isBooking = data.requestType === 'booking';
    const subject = isBooking 
      ? 'Your Service Booking is Confirmed' 
      : 'Your Service Quotation Request has been submitted';

    let content = `
      <p>Dear ${data.customerName},</p>
      <p>${isBooking ? 'Your service booking is confirmed:' : 'Your service quotation request has been received:'}</p>
      <ul>
        <li><strong>Reference Number:</strong> ${data.referenceNumber}</li>
        <li><strong>Services:</strong> ${data.serviceNames}</li>
        <li><strong>Vehicle:</strong> ${data.carYear} ${data.carMake} ${data.carModel}</li>
        <li><strong>Branch:</strong> ${data.branchName}</li>
        <li><strong>Address:</strong> ${data.branchAddress}</li>
        <li><strong>Phone:</strong> ${data.branchPhone}</li>
    `;

    if (isBooking && data.bookingDate && data.bookingTime) {
      content += `<li><strong>Date & Time:</strong> ${data.bookingDate} at ${data.bookingTime}</li>`;
    }

    content += `
      </ul>
      <p>${isBooking 
        ? 'Thank you for choosing us. Please arrive 10 minutes before your appointment.' 
        : 'We will get back to you shortly with pricing details.'
      }</p>
      <p>Best regards,<br/>Wabco Mobility Team</p>
    `;

    // Log customer email being used for verification
    console.log(`Customer email for ${data.referenceNumber}: ${data.customerEmail} (Environment: ${this.isProduction ? 'Production' : 'Development'})`);

    return {
      subject,
      body: {
        contentType: 'HTML',
        content,
      },
      from: {
        emailAddress: {
          address: this.senderEmail,
          name: 'Wabco Mobility'
        }
      },
      toRecipients: [
        {
          emailAddress: {
            address: data.customerEmail, // ALWAYS send to actual customer email in both dev and prod
          },
        },
      ],
      ccRecipients: [
        {
          emailAddress: {
            address: 'marwan.mohamud9@gmail.com',
          },
        },
      ],
    };
  }

  /**
   * Generate service admin notification email content
   */
  private generateServiceAdminNotificationEmail(data: ServiceBookingEmailData): EmailMessage {
    const isBooking = data.requestType === 'booking';
    const subject = isBooking 
      ? 'New Service Booking Received' 
      : 'New Service Quotation Request Received';

    let content = `
      <p>A new service ${isBooking ? 'booking' : 'quotation request'} has been received:</p>
      <ul>
        <li><strong>Reference Number:</strong> ${data.referenceNumber}</li>
        <li><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</li>
        <li><strong>Services:</strong> ${data.serviceNames}</li>
        <li><strong>Vehicle:</strong> ${data.carYear} ${data.carMake} ${data.carModel}</li>
        <li><strong>Branch:</strong> ${data.branchName}</li>
    `;

    if (isBooking && data.bookingDate && data.bookingTime) {
      content += `<li><strong>Date & Time:</strong> ${data.bookingDate} at ${data.bookingTime}</li>`;
    }

    content += `
      </ul>
      <p>Please follow up with the customer accordingly.</p>
      <p>Wabco Mobility System</p>
    `;

    return {
      subject,
      body: {
        contentType: 'HTML',
        content,
      },
      from: {
        emailAddress: {
          address: this.senderEmail,
          name: 'Wabco Mobility System'
        }
      },
      toRecipients: [
        {
          emailAddress: {
            address: this.senderEmail, // Admin email (same as sender for now)
          },
        },
      ],
    };
  }

  /**
   * Send service booking/quotation emails (customer + admin)
   */
  async sendServiceBookingEmails(data: ServiceBookingEmailData): Promise<void> {
    if (!this.isProduction && process.env.SKIP_EMAILS === 'true') {
      console.log('Email sending skipped in development mode');
      return;
    }

    try {
      // Send customer email
      const customerEmail = this.generateServiceBookingEmail(data);
      const customerEmailPayload: GraphEmailPayload = { message: customerEmail };
      
      // Send admin notification
      const adminEmail = this.generateServiceAdminNotificationEmail(data);
      const adminEmailPayload: GraphEmailPayload = { message: adminEmail };

      // Send emails asynchronously (fire-and-forget)
      Promise.resolve().then(async () => {
        try {
          const customerSuccess = await this.sendEmail(customerEmailPayload);
          console.log(`Customer email sent: ${customerSuccess ? 'SUCCESS' : 'FAILED'} - ${data.referenceNumber}`);
        } catch (error) {
          console.error(`Failed to send customer email for ${data.referenceNumber}:`, error);
        }
      });

      Promise.resolve().then(async () => {
        try {
          const adminSuccess = await this.sendEmail(adminEmailPayload);
          console.log(`Admin email sent: ${adminSuccess ? 'SUCCESS' : 'FAILED'} - ${data.referenceNumber}`);
        } catch (error) {
          console.error(`Failed to send admin email for ${data.referenceNumber}:`, error);
        }
      });

    } catch (error) {
      console.error('Error in sendServiceBookingEmails:', error);
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export type { TireBookingEmailData, ServiceBookingEmailData }; 