import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    // Get current booking status
    const currentBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { isActive: true },
    });

    if (!currentBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Toggle the status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { isActive: !currentBooking.isActive },
      include: { branch: true },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error toggling booking status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle booking status' },
      { status: 500 }
    );
  }
} 