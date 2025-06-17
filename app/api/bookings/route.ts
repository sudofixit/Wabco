import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { emailService, TireBookingEmailData, ServiceBookingEmailData } from '@/lib/emailService';

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

    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: { branch: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

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
    
    const booking = await prisma.booking.create({
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
            branchAddress: booking.branch.address,
            branchPhone: booking.branch.phone,
            bookingDate: booking.bookingDate ? booking.bookingDate.toISOString().split('T')[0] : undefined,
            bookingTime: booking.bookingTime || undefined,
            referenceNumber: referenceNumber,
            requestType: booking.requestType as 'booking' | 'quotation'
          };

          // Send emails asynchronously
          emailService.sendTireBookingEmails(emailData);
          console.log(`Email sending initiated for ${booking.requestType} ${referenceNumber}`);
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
          branchAddress: booking.branch.address,
          branchPhone: booking.branch.phone,
          bookingDate: booking.bookingDate ? booking.bookingDate.toISOString().split('T')[0] : undefined,
          bookingTime: booking.bookingTime || undefined,
          referenceNumber: referenceNumber,
          requestType: booking.requestType as 'booking' | 'quotation'
        };

        // Send emails asynchronously
        emailService.sendServiceBookingEmails(emailData);
        console.log(`Email sending initiated for ${booking.requestType} ${referenceNumber}`);
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