import { NextRequest, NextResponse } from 'next/server';
import { emailService, ContactFormData } from '@/lib/emailService';

// Force Node.js runtime for proper email service execution on Vercel
export const runtime = 'nodejs';

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

    console.info("CONTACT_FORM_RECEIVED", `Contact form submission received from: ${name} (${email})`);

    // Check if email service is configured
    const isEmailConfigured = !!(
      process.env.TENANT_ID &&
      process.env.CLIENT_ID &&
      process.env.CLIENT_SECRET &&
      process.env.SENDER_EMAIL
    );

    if (!isEmailConfigured) {
      console.warn("EMAIL_CONFIG_MISSING", 'Email service not configured - skipping email sending');
      return NextResponse.json({
        success: true,
        message: 'Contact form submitted successfully',
        note: 'Email notifications are currently disabled'
      });
    }

    // Send emails using shared email service
    try {
      console.info("EMAIL_CONTACT_PROCESS_START", '🚀 Starting email send process...');
      const emailResult = await emailService.sendContactFormEmails({
        name,
        email,
        phone,
        message,
        vehicleBrand,
        vehicleModel,
        vehicleYear,
        subscribeToOffers
      });

      console.info("EMAIL_CONTACT_PROCESS_COMPLETE", `📧 Email results - Customer: ${emailResult.customerSent ? '✅' : '❌'}, Admin: ${emailResult.adminSent ? '✅' : '❌'}`);

      return NextResponse.json({
        success: true,
        message: 'Thank you for your message! We will get back to you within 24 hours.',
        timestamp: new Date().toISOString(),
        emailSent: emailResult.customerSent && emailResult.adminSent
      });
    } catch (emailError) {
      console.error("EMAIL_CONTACT_PROCESS_ERROR", '❌ Email sending failed, but form submission successful:', emailError);
      
      // Return success even if email fails - don't block user experience
      return NextResponse.json({
        success: true,
        message: 'Thank you for your message! We will get back to you within 24 hours.',
        timestamp: new Date().toISOString(),
        emailSent: false,
        note: 'Form submitted successfully, but email notification may be delayed'
      });
    }

  } catch (error) {
    console.error("CONTACT_FORM_ERROR", 'Contact form submission error:', error);
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