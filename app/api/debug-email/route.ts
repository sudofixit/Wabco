import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === 'production',
    emailVariables: {
      TENANT_ID: !!process.env.TENANT_ID,
      CLIENT_ID: !!process.env.CLIENT_ID,
      CLIENT_SECRET: !!process.env.CLIENT_SECRET,
      SENDER_EMAIL: !!process.env.SENDER_EMAIL,
      SKIP_EMAILS: process.env.SKIP_EMAILS,
      TEST_EMAIL: process.env.TEST_EMAIL
    },
    emailConfigured: !!(
      process.env.TENANT_ID &&
      process.env.CLIENT_ID &&
      process.env.CLIENT_SECRET &&
      process.env.SENDER_EMAIL
    ),
    timestamp: new Date().toISOString()
  });
} 