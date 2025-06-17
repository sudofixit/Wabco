import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const bookingDate = searchParams.get('bookingDate');

    if (!branchId || !bookingDate) {
      return NextResponse.json(
        { error: 'branchId and bookingDate are required' },
        { status: 400 }
      );
    }

    // Get all active bookings for the specified branch and date
    const existingBookings = await prisma.booking.findMany({
      where: {
        branchId: parseInt(branchId),
        bookingDate: new Date(bookingDate),
        isActive: true, // Only consider active bookings
      },
      select: {
        bookingTime: true,
      },
    });

    // Extract booked time slots
    const bookedSlots = existingBookings.map((booking: { bookingTime: string | null }) => booking.bookingTime).filter(Boolean);

    // Generate all possible time slots (9:00 to 17:30)
    const allSlots: string[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      if (hour === 17) {
        allSlots.push('17:00', '17:30');
      } else {
        allSlots.push(
          `${hour.toString().padStart(2, '0')}:00`,
          `${hour.toString().padStart(2, '0')}:30`
        );
      }
    }

    // Return available and booked slots
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    return NextResponse.json({
      availableSlots,
      bookedSlots,
      allSlots,
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
} 