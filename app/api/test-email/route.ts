import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log(`Attempting to send test email to: ${testEmail}`);
    
    const success = await emailService.sendTestEmail(testEmail);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        recipient: testEmail,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send test email. Check server logs for details.',
          recipient: testEmail,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test email endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test Email API',
    usage: 'POST with { "testEmail": "your-email@example.com" }',
    environment: process.env.NODE_ENV,
    emailConfigured: !!(
      process.env.TENANT_ID &&
      process.env.CLIENT_ID &&
      process.env.CLIENT_SECRET &&
      process.env.SENDER_EMAIL
    ),
  });
} 