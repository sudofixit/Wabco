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
        customerContent += `<li><strong>Date & Time:</strong> ${data.bookingDate} at ${data.bookingTime}</li>`;
      }

      customerContent += `
        </ul>
        <p>${isBooking 
          ? 'Thank you for choosing us. Please arrive 10 minutes before your appointment.' 
          : 'We will get back to you shortly with pricing details.'
        }</p>
        <p>Best regards,<br/>Wabco Mobility Team</p>
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
              name: 'Wabco Mobility'
            }
          }
        }
      };

      // Admin Email
      const adminSubject = isBooking 
        ? 'New Tire Booking Received' 
        : 'New Tire Quotation Request Received';

      let adminContent = `
        <p>A new tire ${isBooking ? 'booking' : 'quotation request'} has been received:</p>
        <ul>
          <li><strong>Reference Number:</strong> ${data.referenceNumber}</li>
          <li><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</li>
          <li><strong>Tire:</strong> ${data.tireBrand} ${data.tirePattern} - ${data.tireSize}</li>
          <li><strong>Quantity:</strong> ${data.quantity}</li>
          <li><strong>Branch:</strong> ${data.branchName}</li>
      `;

      if (isBooking && data.bookingDate && data.bookingTime) {
        adminContent += `<li><strong>Date & Time:</strong> ${data.bookingDate} at ${data.bookingTime}</li>`;
      }

      adminContent += `
        </ul>
        <p>Please follow up with the customer accordingly.</p>
        <p>Wabco Mobility System</p>
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
              name: 'Wabco Mobility System'
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
        customerContent += `<li><strong>Date & Time:</strong> ${data.bookingDate} at ${data.bookingTime}</li>`;
      }

      customerContent += `
        </ul>
        <p>${isBooking 
          ? 'Thank you for choosing us. Please arrive 10 minutes before your appointment.' 
          : 'We will get back to you shortly with pricing details.'
        }</p>
        <p>Best regards,<br/>Wabco Mobility Team</p>
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
              name: 'Wabco Mobility'
            }
          }
        }
      };

      // Admin Email
      const adminSubject = isBooking 
        ? 'New Service Booking Received' 
        : 'New Service Quotation Request Received';

      let adminContent = `
        <p>A new service ${isBooking ? 'booking' : 'quotation request'} has been received:</p>
        <ul>
          <li><strong>Reference Number:</strong> ${data.referenceNumber}</li>
          <li><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</li>
          <li><strong>Services:</strong> ${data.serviceNames}</li>
          <li><strong>Vehicle:</strong> ${data.carYear} ${data.carMake} ${data.carModel}</li>
          <li><strong>Branch:</strong> ${data.branchName}</li>
      `;

      if (isBooking && data.bookingDate && data.bookingTime) {
        adminContent += `<li><strong>Date & Time:</strong> ${data.bookingDate} at ${data.bookingTime}</li>`;
      }

      adminContent += `
        </ul>
        <p>Please follow up with the customer accordingly.</p>
        <p>Wabco Mobility System</p>
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
              name: 'Wabco Mobility System'
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
    
    // Log only non-sensitive booking info for debugging
    console.log(`Creating ${body.requestType}:`, {
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