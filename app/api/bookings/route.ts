import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { emailService, TireBookingEmailData, ServiceBookingEmailData } from '@/lib/emailService';

// Force Node.js runtime for proper email service execution on Vercel
export const runtime = 'nodejs';

// Simple Email Service for Vercel Production (same approach as contact-us)
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

class SimpleEmailService {
  private tenantId: string;
  private clientId: string;
  private clientSecret: string;
  private senderEmail: string;

  constructor() {
    this.tenantId = process.env.TENANT_ID || '';
    this.clientId = process.env.CLIENT_ID || '';
    this.clientSecret = process.env.CLIENT_SECRET || '';
    this.senderEmail = process.env.SENDER_EMAIL || '';
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

      // Add proper headers for better deliverability
      const enhancedPayload = {
        ...payload,
        message: {
          ...payload.message,
          // Add proper headers to avoid spam filters (only valid ones)
          internetMessageHeaders: [
            {
              name: 'X-Mailer',
              value: 'Wabco-Mobility-App/1.0'
            },
            {
              name: 'X-Priority',
              value: '3'
            },
            {
              name: 'X-MSMail-Priority',
              value: 'Normal'
            },
            {
              name: 'X-Report-Abuse',
              value: 'Please report abuse here: admin@wabcomobility.com'
            }
          ]
        }
      };

      const response = await fetch(sendMailUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedPayload),
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
   * Send tire booking/quotation emails
   */
  async sendTireBookingEmails(data: TireBookingEmailData): Promise<void> {
    const isBooking = data.requestType === 'booking';
    console.log(`🚀 [Simple] Starting email send for ${data.requestType} ${data.referenceNumber}`);
    console.log(`📧 [Simple] Customer: ${data.customerName} (${data.customerEmail})`);

    try {
      // Customer Email
      const customerSubject = isBooking
        ? 'Your Tire Booking is Confirmed'
        : 'Your Tire Quotation Request has been submitted';

      let customerContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${customerSubject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0a1c58; margin: 0; font-size: 24px;">WABCO Mobility</h1>
              <p style="color: #666; margin: 10px 0 0 0;">Your Trusted Automotive Partner</p>
            </div>
            
            <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #0a1c58; margin-top: 0;">Dear ${data.customerName},</h2>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                ${isBooking ? 'Your tire booking has been confirmed successfully.' : 'Thank you for your tire quotation request. We have received your inquiry and will process it promptly.'}
              </p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #0a1c58; margin-top: 0;">Request Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Reference Number:</td>
                    <td style="padding: 8px 0; color: #333;">${data.referenceNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Tire:</td>
                    <td style="padding: 8px 0; color: #333;">${data.tireBrand} ${data.tirePattern} - ${data.tireSize}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Quantity:</td>
                    <td style="padding: 8px 0; color: #333;">${data.quantity}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Branch:</td>
                    <td style="padding: 8px 0; color: #333;">${data.branchName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Address:</td>
                    <td style="padding: 8px 0; color: #333;">${data.branchAddress}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Phone:</td>
                    <td style="padding: 8px 0; color: #333;">${data.branchPhone}</td>
                  </tr>
                  ${isBooking && data.bookingDate && data.bookingTime ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Date & Time:</td>
                    <td style="padding: 8px 0; color: #333;">${data.bookingDate} at ${data.bookingTime}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <div style="margin: 25px 0;">
                <p style="font-size: 16px; margin-bottom: 15px;">
                  ${isBooking
          ? 'Please arrive 10 minutes before your scheduled appointment time. Our team will be ready to assist you with your tire installation.'
          : 'Our team will review your request and contact you within 24 hours with detailed pricing and availability information.'
        }
                </p>
              </div>
              
              <div style="background-color: #e8f4fd; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h4 style="color: #0a1c58; margin-top: 0;">Contact Information</h4>
                <p style="margin: 5px 0;"><strong>Phone:</strong> +971 04 746 8773</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> admin@wabcomobility.com</p>
                <p style="margin: 5px 0;"><strong>Website:</strong> www.wabcomobility.com</p>
              </div>
              
              <p style="margin: 25px 0 0 0;">
                Thank you for choosing WABCO Mobility for your automotive needs.
              </p>
              
              <p style="margin: 10px 0 0 0;">
                Best regards,<br>
                <strong>The WABCO Mobility Team</strong>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666; margin: 0;">
                This is an automated message. Please do not reply to this email.<br>
                For inquiries, please contact us at admin@wabcomobility.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const customerEmailPayload: GraphEmailPayload = {
        message: {
          subject: customerSubject,
          body: {
            contentType: 'HTML',
            content: customerContent,
          },
          toRecipients: [{
            emailAddress: { address: data.customerEmail }
          }],
          from: {
            emailAddress: {
              address: this.senderEmail,
              name: 'WABCO Mobility'
            }
          }
        }
      };

      // Admin Email
      const adminSubject = isBooking
        ? 'New Tire Booking Received'
        : 'New Tire Quotation Request Received';

      let adminContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${adminSubject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0a1c58; margin: 0; font-size: 24px;">WABCO Mobility</h1>
              <p style="color: #666; margin: 10px 0 0 0;">System Notification</p>
            </div>
            
            <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #0a1c58; margin-top: 0;">${adminSubject}</h2>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                A new tire ${isBooking ? 'booking' : 'quotation request'} has been submitted through the website.
              </p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #0a1c58; margin-top: 0;">Customer Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Reference Number:</td>
                    <td style="padding: 8px 0; color: #333;">${data.referenceNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Customer Name:</td>
                    <td style="padding: 8px 0; color: #333;">${data.customerName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Customer Email:</td>
                    <td style="padding: 8px 0; color: #333;">${data.customerEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Tire:</td>
                    <td style="padding: 8px 0; color: #333;">${data.tireBrand} ${data.tirePattern} - ${data.tireSize}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Quantity:</td>
                    <td style="padding: 8px 0; color: #333;">${data.quantity}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Branch:</td>
                    <td style="padding: 8px 0; color: #333;">${data.branchName}</td>
                  </tr>
                  ${isBooking && data.bookingDate && data.bookingTime ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Date & Time:</td>
                    <td style="padding: 8px 0; color: #333;">${data.bookingDate} at ${data.bookingTime}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h4 style="color: #856404; margin-top: 0;">Action Required</h4>
                <p style="margin: 5px 0; color: #856404;">
                  ${isBooking
          ? 'Please prepare for the customer appointment and ensure all necessary equipment is available.'
          : 'Please review the quotation request and contact the customer within 24 hours with pricing details.'
        }
                </p>
              </div>
              
              <p style="margin: 25px 0 0 0;">
                <strong>Submission Time:</strong> ${new Date().toLocaleString()}
              </p>
              
              <p style="margin: 10px 0 0 0;">
                WABCO Mobility System
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const adminEmailPayload: GraphEmailPayload = {
        message: {
          subject: adminSubject,
          body: {
            contentType: 'HTML',
            content: adminContent,
          },
          toRecipients: [{
            emailAddress: { address: this.senderEmail }
          }],
          from: {
            emailAddress: {
              address: this.senderEmail,
              name: 'WABCO Mobility System'
            }
          }
        }
      };

      // Send emails in parallel (like contact-us)
      const [customerSent, adminSent] = await Promise.all([
        this.sendEmail(customerEmailPayload),
        this.sendEmail(adminEmailPayload)
      ]);

      console.log(`📧 [Simple] Email results - Customer: ${customerSent ? '✅' : '❌'}, Admin: ${adminSent ? '✅' : '❌'}`);

    } catch (error) {
      console.error(`❌ [Simple] Email sending failed for ${data.referenceNumber}:`, error);
    }
  }

  /**
   * Send service booking/quotation emails
   */
  async sendServiceBookingEmails(data: ServiceBookingEmailData): Promise<void> {
    const isBooking = data.requestType === 'booking';
    console.log(`🚀 [Simple] Starting email send for ${data.requestType} ${data.referenceNumber}`);
    console.log(`📧 [Simple] Customer: ${data.customerName} (${data.customerEmail})`);

    try {
      // Customer Email
      const customerSubject = isBooking
        ? 'Your Service Booking is Confirmed'
        : 'Your Service Quotation Request has been submitted';

      let customerContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${customerSubject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0a1c58; margin: 0; font-size: 24px;">WABCO Mobility</h1>
              <p style="color: #666; margin: 10px 0 0 0;">Your Trusted Automotive Partner</p>
            </div>
            
            <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #0a1c58; margin-top: 0;">Dear ${data.customerName},</h2>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                ${isBooking ? 'Your service booking has been confirmed successfully.' : 'Thank you for your service quotation request. We have received your inquiry and will process it promptly.'}
              </p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #0a1c58; margin-top: 0;">Request Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Reference Number:</td>
                    <td style="padding: 8px 0; color: #333;">${data.referenceNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Services:</td>
                    <td style="padding: 8px 0; color: #333;">${data.serviceNames}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Vehicle:</td>
                    <td style="padding: 8px 0; color: #333;">${data.carYear} ${data.carMake} ${data.carModel}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Branch:</td>
                    <td style="padding: 8px 0; color: #333;">${data.branchName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Address:</td>
                    <td style="padding: 8px 0; color: #333;">${data.branchAddress}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Phone:</td>
                    <td style="padding: 8px 0; color: #333;">${data.branchPhone}</td>
                  </tr>
                  ${isBooking && data.bookingDate && data.bookingTime ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Date & Time:</td>
                    <td style="padding: 8px 0; color: #333;">${data.bookingDate} at ${data.bookingTime}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <div style="margin: 25px 0;">
                <p style="font-size: 16px; margin-bottom: 15px;">
                  ${isBooking
          ? 'Please arrive 10 minutes before your scheduled appointment time. Our team will be ready to assist you with your vehicle service.'
          : 'Our team will review your request and contact you within 24 hours with detailed pricing and availability information.'
        }
                </p>
              </div>
              
              <div style="background-color: #e8f4fd; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h4 style="color: #0a1c58; margin-top: 0;">Contact Information</h4>
                <p style="margin: 5px 0;"><strong>Phone:</strong> +971 04 746 8773</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> admin@wabcomobility.com</p>
                <p style="margin: 5px 0;"><strong>Website:</strong> www.wabcomobility.com</p>
              </div>
              
              <p style="margin: 25px 0 0 0;">
                Thank you for choosing WABCO Mobility for your automotive needs.
              </p>
              
              <p style="margin: 10px 0 0 0;">
                Best regards,<br>
                <strong>The WABCO Mobility Team</strong>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666; margin: 0;">
                This is an automated message. Please do not reply to this email.<br>
                For inquiries, please contact us at admin@wabcomobility.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const customerEmailPayload: GraphEmailPayload = {
        message: {
          subject: customerSubject,
          body: {
            contentType: 'HTML',
            content: customerContent,
          },
          toRecipients: [{
            emailAddress: { address: data.customerEmail }
          }],
          from: {
            emailAddress: {
              address: this.senderEmail,
              name: 'WABCO Mobility'
            }
          }
        }
      };

      // Admin Email
      const adminSubject = isBooking
        ? 'New Service Booking Received'
        : 'New Service Quotation Request Received';

      let adminContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${adminSubject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0a1c58; margin: 0; font-size: 24px;">WABCO Mobility</h1>
              <p style="color: #666; margin: 10px 0 0 0;">System Notification</p>
            </div>
            
            <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #0a1c58; margin-top: 0;">${adminSubject}</h2>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                A new service ${isBooking ? 'booking' : 'quotation request'} has been submitted through the website.
              </p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #0a1c58; margin-top: 0;">Customer Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Reference Number:</td>
                    <td style="padding: 8px 0; color: #333;">${data.referenceNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Customer Name:</td>
                    <td style="padding: 8px 0; color: #333;">${data.customerName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Customer Email:</td>
                    <td style="padding: 8px 0; color: #333;">${data.customerEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Services:</td>
                    <td style="padding: 8px 0; color: #333;">${data.serviceNames}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Vehicle:</td>
                    <td style="padding: 8px 0; color: #333;">${data.carYear} ${data.carMake} ${data.carModel}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Branch:</td>
                    <td style="padding: 8px 0; color: #333;">${data.branchName}</td>
                  </tr>
                  ${isBooking && data.bookingDate && data.bookingTime ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Date & Time:</td>
                    <td style="padding: 8px 0; color: #333;">${data.bookingDate} at ${data.bookingTime}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h4 style="color: #856404; margin-top: 0;">Action Required</h4>
                <p style="margin: 5px 0; color: #856404;">
                  ${isBooking
          ? 'Please prepare for the customer appointment and ensure all necessary equipment is available.'
          : 'Please review the quotation request and contact the customer within 24 hours with pricing details.'
        }
                </p>
              </div>
              
              <p style="margin: 25px 0 0 0;">
                <strong>Submission Time:</strong> ${new Date().toLocaleString()}
              </p>
              
              <p style="margin: 10px 0 0 0;">
                WABCO Mobility System
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const adminEmailPayload: GraphEmailPayload = {
        message: {
          subject: adminSubject,
          body: {
            contentType: 'HTML',
            content: adminContent,
          },
          toRecipients: [{
            emailAddress: { address: this.senderEmail }
          }],
          from: {
            emailAddress: {
              address: this.senderEmail,
              name: 'WABCO Mobility System'
            }
          }
        }
      };

      // Send emails in parallel (like contact-us)
      const [customerSent, adminSent] = await Promise.all([
        this.sendEmail(customerEmailPayload),
        this.sendEmail(adminEmailPayload)
      ]);

      console.log(`📧 [Simple] Email results - Customer: ${customerSent ? '✅' : '❌'}, Admin: ${adminSent ? '✅' : '❌'}`);

    } catch (error) {
      console.error(`❌ [Simple] Email sending failed for ${data.referenceNumber}:`, error);
    }
  }
}

const simpleEmailService = new SimpleEmailService();
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const customerEmail = searchParams.get('customerEmail');
    const bookingDate = searchParams.get('bookingDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    if (branchId) where.branchId = parseInt(branchId);
    if (customerEmail) where.customerEmail = { contains: customerEmail, mode: 'insensitive' };
    if (bookingDate) where.bookingDate = new Date(bookingDate);

    const [bookingsRaw, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: { branch: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    // Serialize bookings with branch data to handle Decimal lat/lng fields
    const bookings = bookingsRaw.map((booking: any) => ({
      ...booking,
      branch: booking.branch ? {
        ...booking.branch,
        lat: booking.branch.lat ? Number(booking.branch.lat) : null,
        lng: booking.branch.lng ? Number(booking.branch.lng) : null,
      } : null,
    }));

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: 'Failed to fetch bookings', details: error?.message || error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('Creating quotation:', {
      services: body.services,
      branchId: body.branchId,
      branchName: body.branchName,
      bookingDate: body.bookingDate,
      bookingTime: body.bookingTime,
      requestType: body.requestType,
      requestSource: body.requestSource,
      productId: body.productId,
      serviceId: body.serviceId,
      quantity: body.quantity,
      carInfo: `${body.carYear} ${body.carMake} ${body.carModel}`
    });

    // Convert bookingDate to Date object
    const bookingDate = body.bookingDate ? new Date(body.bookingDate) : null;

    const bookingRaw = await prisma.booking.create({
      data: {
        carYear: body.carYear,
        carMake: body.carMake,
        carModel: body.carModel,
        services: body.services,
        branchId: parseInt(body.branchId),
        branchName: body.branchName,
        bookingDate: body.requestType === 'quotation' ? null : bookingDate,
        bookingTime: body.requestType === 'quotation' ? null : body.bookingTime,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        requestType: body.requestType,
        requestSource: body.requestSource || 'service',
        productId: body.productId ? parseInt(body.productId) : null,
        serviceId: body.serviceId ? parseInt(body.serviceId) : null,
        quantity: body.quantity ? parseInt(body.quantity) : null,
        isActive: true,
      },
      include: { branch: true },
    });

    // Serialize booking with branch data to handle Decimal lat/lng fields
    const booking = {
      ...bookingRaw,
      branch: bookingRaw.branch ? {
        ...bookingRaw.branch,
        lat: bookingRaw.branch.lat ? Number(bookingRaw.branch.lat) : null,
        lng: bookingRaw.branch.lng ? Number(bookingRaw.branch.lng) : null,
      } : null,
    };

    // Log success without sensitive customer data
    console.log(`${booking.requestType} created successfully:`, {
      id: booking.id,
      services: booking.services,
      branchName: booking.branchName,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      requestType: booking.requestType,
      requestSource: booking.requestSource,
      productId: booking.productId,
      quantity: booking.quantity
    });

    // Send emails for tire bookings/quotations
    if (booking.requestSource === 'tire' && booking.productId) {
      try {
        // Get tire product details for email
        const product = await prisma.product.findUnique({
          where: { id: booking.productId },
          include: { brand: true }
        });

        if (product) {
          // Generate reference number
          const referenceNumber = booking.requestType === 'booking'
            ? `WM-${booking.id.toString().padStart(6, '0')}`
            : `QT-${booking.id.toString().padStart(6, '0')}`;

          // Create tire size string
          const tireSize = `${product.width}/${product.profile}R${product.diameter}`;

          // Prepare email data
          const emailData: TireBookingEmailData = {
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            tireBrand: product.brand?.name || 'Unknown Brand',
            tirePattern: product.pattern,
            tireSize: tireSize,
            quantity: booking.quantity || 1,
            branchName: booking.branchName,
            branchAddress: booking.branch?.address || '',
            branchPhone: booking.branch?.phone || '',
            bookingDate: booking.bookingDate ? booking.bookingDate.toISOString().split('T')[0] : undefined,
            bookingTime: booking.bookingTime || undefined,
            referenceNumber: referenceNumber,
            requestType: booking.requestType as 'booking' | 'quotation'
          };

          // Send emails using simple service (same approach as contact-us)
          try {
            await simpleEmailService.sendTireBookingEmails(emailData);
            console.log(`✅ [Simple] Email sending completed for ${booking.requestType} ${referenceNumber}`);
          } catch (simpleEmailError) {
            console.error(`❌ [Simple] Email sending failed for ${booking.requestType} ${referenceNumber}:`, simpleEmailError);
            // Fallback: try original service
            console.log(`🔄 Attempting fallback to original email service...`);
            emailService.sendTireBookingEmails(emailData);
            console.log(`Email sending initiated (fallback) for ${booking.requestType} ${referenceNumber}`);
          }
        }
      } catch (emailError) {
        console.error('Error preparing tire booking emails:', emailError);
        // Don't fail the booking if email fails
      }
    }

    // Send emails for service bookings/quotations
    if (booking.requestSource === 'service') {
      try {
        // Generate reference number
        const referenceNumber = booking.requestType === 'booking'
          ? `WM-${booking.id.toString().padStart(6, '0')}`
          : `QT-${booking.id.toString().padStart(6, '0')}`;

        // Prepare email data
        const emailData: ServiceBookingEmailData = {
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          serviceNames: booking.services,
          carYear: booking.carYear,
          carMake: booking.carMake,
          carModel: booking.carModel,
          branchName: booking.branchName,
          branchAddress: booking.branch?.address || '',
          branchPhone: booking.branch?.phone || '',
          bookingDate: booking.bookingDate ? booking.bookingDate.toISOString().split('T')[0] : undefined,
          bookingTime: booking.bookingTime || undefined,
          referenceNumber: referenceNumber,
          requestType: booking.requestType as 'booking' | 'quotation'
        };

        // Send emails using simple service (same approach as contact-us)
        try {
          await simpleEmailService.sendServiceBookingEmails(emailData);
          console.log(`✅ [Simple] Email sending completed for ${booking.requestType} ${referenceNumber}`);
        } catch (simpleEmailError) {
          console.error(`❌ [Simple] Email sending failed for ${booking.requestType} ${referenceNumber}:`, simpleEmailError);
          // Fallback: try original service
          console.log(`🔄 Attempting fallback to original email service...`);
          emailService.sendServiceBookingEmails(emailData);
          console.log(`Email sending initiated (fallback) for ${booking.requestType} ${referenceNumber}`);
        }
      } catch (emailError) {
        console.error('Error preparing service booking emails:', emailError);
        // Don't fail the booking if email fails
      }
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: 'Failed to create booking', details: error?.message || error }, { status: 500 });
  }
}