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

    // Debug: Log environment variables safely
    if (process.env.NODE_ENV === 'production') {
          console.log('🌐 Running on Vercel Production');
    console.log('DEBUG - Environment Variables:');
    console.log('TENANT_ID:', this.tenantId ? `${this.tenantId.substring(0, 8)}...` : 'NOT SET');
    console.log('CLIENT_ID:', this.clientId ? `${this.clientId.substring(0, 8)}...` : 'NOT SET');
    console.log('CLIENT_SECRET:', this.clientSecret ? `${this.clientSecret.substring(0, 8)}...` : 'NOT SET');
    console.log('SENDER_EMAIL:', this.senderEmail || 'NOT SET');
    
    // Debug: Log Vercel environment info
    console.log('🏗️ VERCEL ENVIRONMENT DEBUG:');
    console.log('- VERCEL_URL:', process.env.VERCEL_URL || 'NOT SET');
    console.log('- VERCEL_REGION:', process.env.VERCEL_REGION || 'NOT SET');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- Time Zone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log('- User Agent Context: Wabco-Mobility-App/1.0');
    } else {
      console.log('🏠 Running on localhost development');
      console.log('CLIENT_ID:', process.env.CLIENT_ID);
      console.log('TENANT_ID:', process.env.TENANT_ID);
      console.log('SENDER_EMAIL:', process.env.SENDER_EMAIL);
    }

    if (!this.tenantId || !this.clientId || !this.clientSecret || !this.senderEmail) {
      console.error('Missing required environment variables for email service');
    }
  }

  /**
   * Get access token using Client Credentials Flow
   */
  private async getAccessToken(): Promise<string> {
    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    
    console.log('🔐 DEBUG - Token Request Details:');
    console.log('Token URL:', tokenUrl);
    console.log('Client ID:', this.isProduction ? `${this.clientId.substring(0, 8)}...` : this.clientId);
    console.log('Grant Type: client_credentials');
    console.log('Scope: https://graph.microsoft.com/.default');
    
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('scope', 'https://graph.microsoft.com/.default');
    params.append('grant_type', 'client_credentials');

    try {
      console.log('🌐 Making token request to Microsoft...');
      
      // Add shorter timeout for token request to identify hanging
      const tokenController = new AbortController();
      const tokenTimeoutId = setTimeout(() => {
        console.log(`⏰ Token request timeout after 10 seconds`);
        tokenController.abort();
      }, 10000); // 10 second timeout for token request
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Wabco-Mobility-App/1.0',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
        },
        body: params,
        signal: tokenController.signal,
      });

      clearTimeout(tokenTimeoutId);

      console.log('📡 Token Response Status:', response.status);
      console.log('📡 Token Response Headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is compressed and log decompression info
      const contentEncoding = response.headers.get('content-encoding');
      const contentLength = response.headers.get('content-length');
      console.log('📦 Response Compression Info:');
      console.log('- Content-Encoding:', contentEncoding || 'none');
      console.log('- Content-Length:', contentLength || 'unknown');
      console.log('- Response.ok:', response.ok);
      console.log('- Response.bodyUsed:', response.bodyUsed);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Token Request Failed:');
        console.error('Status:', response.status);
        console.error('Response:', errorText);
        throw new Error(`Token request failed: ${response.status} - ${errorText}`);
      }

      const tokenData = await response.json();
      console.log('✅ Token Response Data:', {
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
        access_token: tokenData.access_token ? `${tokenData.access_token.substring(0, 20)}...` : 'NOT PRESENT'
      });

      return tokenData.access_token;
    } catch (error: any) {
      console.error('❌ Token request error:');
      
      if (error.name === 'AbortError') {
        console.error('- Type: TOKEN REQUEST TIMEOUT');
        console.error('- Message: Microsoft token endpoint took longer than 10 seconds');
        console.error('- Likely Cause: Azure Conditional Access blocking Vercel IPs');
      } else {
        console.error('- Type: Network/Authentication Error');  
        console.error('- Message:', error.message);
        console.error('- Status:', error.response?.status);
        console.error('- Data:', error.response?.data || 'No response data');
      }
      
      console.error('🔧 AZURE TROUBLESHOOTING SUGGESTIONS:');
      console.error('1. Check Azure Conditional Access policies');
      console.error('2. Verify Azure app has no IP restrictions');
      console.error('3. Create dedicated production Azure app registration');
      console.error('4. Test with temporary unrestricted access');
      
      throw error;
    }
  }

  /**
   * Send email using Microsoft Graph API
   */
  private async sendEmail(payload: GraphEmailPayload): Promise<boolean> {
    try {
      console.log(`🔐 Getting access token...`);
      const accessToken = await this.getAccessToken();
      console.log(`✅ Access token obtained successfully`);
      
      const sendMailUrl = `https://graph.microsoft.com/v1.0/users/${this.senderEmail}/sendMail`;

      // Debug: Log payload details
      console.log(`📤 DEBUG - Email Payload Details:`);
      console.log(`- Endpoint: ${sendMailUrl}`);
      console.log(`- Sender Email: ${this.senderEmail}`);
      console.log(`- From Address: ${payload.message.from?.emailAddress?.address || 'Not specified'}`);
      console.log(`- To Address: ${payload.message.toRecipients[0]?.emailAddress?.address}`);
      console.log(`- Subject: ${payload.message.subject}`);
      console.log(`- Content Type: ${payload.message.body.contentType}`);
      console.log(`- Body Length: ${payload.message.body.content.length} characters`);
      console.log(`- Access Token: ${accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT PRESENT'}`);
      console.log(`- Environment: ${this.isProduction ? 'Production' : 'Development'}`);

      if (this.isProduction) {
        console.log('📧 Full Payload (Production):', {
          message: {
            subject: payload.message.subject,
            toRecipients: payload.message.toRecipients.map(r => r.emailAddress.address),
            from: payload.message.from?.emailAddress?.address,
            body: {
              contentType: payload.message.body.contentType,
              content: `${payload.message.body.content.substring(0, 100)}...`
            }
          }
        });
      } else {
        console.log('📧 Full Payload (Development):', JSON.stringify(payload, null, 2));
      }

      console.log(`🌐 Making API call to Microsoft Graph...`);
      
      // Add timeout and extra headers for Vercel
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error("EMAIL_ERROR_GRAPH_TIMEOUT", `API call timeout after 20 seconds`);
        controller.abort();
      }, 20000); // 20 second timeout (reduced from 30s)

      const response = await fetch(sendMailUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Wabco-Mobility-App/1.0',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'X-Forwarded-For': this.isProduction ? 'wabcomobility.com' : 'localhost',
          'Origin': this.isProduction ? 'https://test.wabcomobility.com' : 'http://localhost:3000',
          'Referer': this.isProduction ? 'https://test.wabcomobility.com' : 'http://localhost:3000',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.info("EMAIL_SUCCESS_GRAPH_RESPONSE", `API Response received - Status: ${response.status}`);
      console.log(`📡 Response Headers:`, Object.fromEntries(response.headers.entries()));
      
      // Check if response is compressed and log decompression info
      const contentEncoding = response.headers.get('content-encoding');
      const contentLength = response.headers.get('content-length');
      console.log('📦 Email Response Compression Info:');
      console.log('- Content-Encoding:', contentEncoding || 'none');
      console.log('- Content-Length:', contentLength || 'unknown');
      console.log('- Response.ok:', response.ok);
      console.log('- Response.bodyUsed:', response.bodyUsed);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("EMAIL_ERROR_GRAPH_API", `Graph API Error Details:`);
        console.error(`- Status: ${response.status}`);
        console.error(`- Status Text: ${response.statusText}`);
        console.error(`- Response Headers:`, Object.fromEntries(response.headers.entries()));
        console.error(`- Response Body:`, errorText);
        
        // Try to parse error as JSON for more details
        try {
          const errorJson = JSON.parse(errorText);
          console.error("EMAIL_ERROR_GRAPH_PARSED", errorJson);
        } catch {
          console.error("EMAIL_ERROR_GRAPH_RAW", errorText);
        }
        
        throw new Error(`Send mail failed: ${response.status} - ${errorText}`);
      }

      // Log successful response
      const responseText = await response.text();
      console.info("EMAIL_SUCCESS_SENT", `Email sent successfully via Graph API`);
      console.log(`📧 Response body:`, responseText || 'Empty response (normal for sendMail)');
      
      return true;
    } catch (error: any) {
      console.error("EMAIL_ERROR_CRITICAL", 'CRITICAL EMAIL SEND ERROR:');
      
      if (error.name === 'AbortError') {
        console.error("EMAIL_ERROR_TIMEOUT", 'Timeout Error');
        console.error('- Message: API call took longer than 20 seconds');
        console.error('- Suggestion: Microsoft Graph API may be slow or blocked');
      } else if (error.response) {
        console.error("EMAIL_ERROR_HTTP", 'HTTP Response Error');
        console.error('- Status:', error.response.status);
        console.error('- Data:', error.response.data || error.response.statusText);
      } else if (error.message) {
        console.error("EMAIL_ERROR_GENERAL", 'General Error');
        console.error('- Message:', error.message);
      } else {
        console.error("EMAIL_ERROR_UNKNOWN", 'Unknown Error');
        console.error('- Full Error:', error);
      }
      
      // Vercel-specific debugging suggestions
      if (this.isProduction) {
        console.error('🔧 VERCEL DEBUGGING SUGGESTIONS:');
        console.error('1. Check if Vercel IP is blocked by Microsoft');
        console.error('2. Verify Azure app permissions in production');
        console.error('3. Check serverless function timeout limits');
        console.error('4. Verify all environment variables are set correctly');
      }
      
      return false;
    }
  }

  /**
   * Send email with retry logic for better reliability on Vercel
   */
  private async sendEmailWithRetry(payload: GraphEmailPayload, maxRetries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.info("EMAIL_RETRY_ATTEMPT", `Email send attempt ${attempt}/${maxRetries}`);
        
        const result = await this.sendEmail(payload);
        
        if (result) {
          console.info("EMAIL_SUCCESS_RETRY", `Email sent successfully on attempt ${attempt}`);
          return true;
        } else {
          console.error("EMAIL_ERROR_RETRY_FAILED", `Email failed on attempt ${attempt}, trying again...`);
        }
      } catch (error: any) {
        console.error("EMAIL_ERROR_RETRY_EXCEPTION", `Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          console.error("EMAIL_ERROR_RETRY_EXHAUSTED", `All ${maxRetries} attempts failed. Giving up.`);
          return false;
        }
        
        // Exponential backoff: wait 1s, 2s, 4s between retries
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.info("EMAIL_RETRY_BACKOFF", `Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return false;
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

    // Check if email service is properly configured
    if (!this.tenantId || !this.clientId || !this.clientSecret || !this.senderEmail) {
      console.error('❌ Email service not configured - missing environment variables');
      console.error(`Missing: ${[
        !this.tenantId && 'TENANT_ID',
        !this.clientId && 'CLIENT_ID', 
        !this.clientSecret && 'CLIENT_SECRET',
        !this.senderEmail && 'SENDER_EMAIL'
      ].filter(Boolean).join(', ')}`);
      return;
    }

    console.log(`🚀 Starting email send process for ${data.requestType} ${data.referenceNumber}`);
    console.log(`📧 Customer: ${data.customerName} (${data.customerEmail})`);
    console.log(`🏢 Environment: ${this.isProduction ? 'Production' : 'Development'}`);

    try {
      // Send customer email
      const customerEmail = this.generateTireBookingEmail(data);
      const customerEmailPayload: GraphEmailPayload = { message: customerEmail };
      
      // Send admin notification
      const adminEmail = this.generateAdminNotificationEmail(data);
      const adminEmailPayload: GraphEmailPayload = { message: adminEmail };

      // Send emails synchronously for better error tracking in production
      console.log(`🔄 Initiating email sends for ${data.referenceNumber}...`);
      
      try {
        // Send customer email synchronously
        console.log(`📤 Sending customer email for ${data.referenceNumber}...`);
        const customerSuccess = await this.sendEmailWithRetry(customerEmailPayload);
        console.log(`Customer email sent: ${customerSuccess ? '✅ SUCCESS' : '❌ FAILED'} - ${data.referenceNumber}`);

        // Send admin email synchronously
        console.log(`📤 Sending admin email for ${data.referenceNumber}...`);
        const adminSuccess = await this.sendEmailWithRetry(adminEmailPayload);
        console.log(`Admin email sent: ${adminSuccess ? '✅ SUCCESS' : '❌ FAILED'} - ${data.referenceNumber}`);

        console.log(`✅ Email sending process completed for ${data.referenceNumber}`);
      } catch (emailSendError) {
        console.error(`❌ Critical email sending error for ${data.referenceNumber}:`, emailSendError);
      }

    } catch (error) {
      console.error(`❌ Error in sendTireBookingEmails for ${data.referenceNumber}:`, error);
    }
  }

  /**
   * Test email functionality
   */
  async sendTestEmail(testRecipient: string): Promise<boolean> {
    console.info("EMAIL_TEST_START", `Sending test email to: ${testRecipient}`);

    const testEmailPayload: GraphEmailPayload = {
      message: {
        subject: 'Test Email from WABCO Mobility',
        body: {
          contentType: 'HTML',
          content: `
            <h2>Test Email Successful!</h2>
            <p>This is a test email from the WABCO Mobility system.</p>
            <p>If you received this email, the email configuration is working correctly.</p>
            <p>Sent at: ${new Date().toISOString()}</p>
            <p>Environment: ${this.isProduction ? 'Production' : 'Development'}</p>
          `,
        },
        toRecipients: [{
          emailAddress: { address: testRecipient }
        }],
        from: {
          emailAddress: {
            address: this.senderEmail,
            name: 'WABCO Mobility Test'
          }
        }
      }
    };

    const result = await this.sendEmailWithRetry(testEmailPayload);
    
    if (result) {
      console.info("EMAIL_TEST_SUCCESS", `Test email sent successfully to ${testRecipient}`);
    } else {
      console.error("EMAIL_TEST_FAILED", `Failed to send test email to ${testRecipient}`);
    }
    
    return result;
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
    console.log(`Processing service booking for: ${data.customerName} (${data.customerEmail})`);

    // Send customer confirmation email
    const customerEmailPayload: GraphEmailPayload = {
      message: this.generateServiceBookingEmail(data)
    };

    // Send admin notification email
    const adminEmailPayload: GraphEmailPayload = {
      message: this.generateServiceAdminNotificationEmail(data)
    };

    // Send emails in parallel
    const [customerSent, adminSent] = await Promise.all([
      this.sendEmailWithRetry(customerEmailPayload),
      this.sendEmailWithRetry(adminEmailPayload)
    ]);

    console.log(`Service booking emails sent - Customer: ${customerSent ? '✅' : '❌'}, Admin: ${adminSent ? '✅' : '❌'}`);

    if (!customerSent) {
      console.error('Failed to send customer confirmation email for service booking');
    }
    if (!adminSent) {
      console.error('Failed to send admin notification email for service booking');
    }
  }

  /**
   * Generate contact form confirmation email content
   */
  private generateContactFormConfirmationEmail(data: ContactFormData): EmailMessage {
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
   * Generate contact form admin notification email
   */
  private generateContactFormAdminEmail(data: ContactFormData): EmailMessage {
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
        emailAddress: { address: this.testEmail } // Use admin/test email
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
    console.info("EMAIL_CONTACT_START", `Processing contact form submission from: ${data.name} (${data.email})`);

    // Send customer confirmation email
    const customerEmailPayload: GraphEmailPayload = {
      message: this.generateContactFormConfirmationEmail(data)
    };

    // Send admin notification email
    const adminEmailPayload: GraphEmailPayload = {
      message: this.generateContactFormAdminEmail(data)
    };

    // Send emails in parallel
    const [customerSent, adminSent] = await Promise.all([
      this.sendEmailWithRetry(customerEmailPayload),
      this.sendEmailWithRetry(adminEmailPayload)
    ]);

    if (customerSent) {
      console.info("EMAIL_SUCCESS_CUSTOMER", `Customer confirmation sent to ${data.email}`);
    } else {
      console.error("EMAIL_ERROR_CUSTOMER", `Failed to send customer confirmation to ${data.email}`);
    }

    if (adminSent) {
      console.info("EMAIL_SUCCESS_ADMIN", `Admin notification sent for contact from ${data.name}`);
    } else {
      console.error("EMAIL_ERROR_ADMIN", `Failed to send admin notification for contact from ${data.name}`);
    }

    console.info("EMAIL_CONTACT_COMPLETE", `Contact form emails sent - Customer: ${customerSent ? '✅' : '❌'}, Admin: ${adminSent ? '✅' : '❌'}`);

    return { customerSent, adminSent };
  }
}

// Export singleton instance
export const emailService = new EmailService();
export type { TireBookingEmailData, ServiceBookingEmailData, ContactFormData }; 