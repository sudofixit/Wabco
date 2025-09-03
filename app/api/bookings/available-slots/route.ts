import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const bookingDate = searchParams.get('bookingDate');

    // Collect serviceId (single) and serviceIds (multiple)
    const serviceId = searchParams.get('serviceId');
    const serviceIds = searchParams.getAll('serviceIds'); // handles ?serviceIds=1&serviceIds=2

    if (!branchId || !bookingDate || (!serviceId && serviceIds.length === 0)) {
      return NextResponse.json(
        { error: 'branchId, bookingDate, and at least one serviceId are required' },
        { status: 400 }
      );
    }

    // Normalize service IDs (single or multiple) into array of numbers
    const serviceIdsToCheck = serviceId
      ? [parseInt(serviceId)]
      : serviceIds.map((id) => parseInt(id));

    const existingBookings = await prisma.booking.findMany({
      where: {
        branchId: parseInt(branchId),
        bookingDate: new Date(bookingDate),
        serviceId: { in: serviceIdsToCheck },
        isActive: true,
      },
      select: { bookingTime: true, serviceId: true },
    });

    // Extract booked slots
    const bookedSlots = existingBookings
      .map((b) => b.bookingTime)
      .filter(Boolean) as string[];

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

    // Available slots = all slots minus ones booked for these services
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    return NextResponse.json({
      availableSlots,
      bookedSlots,
      allSlots,
      conflictType: serviceIdsToCheck.length > 1 ? 'multi-service' : 'same-service-only',
      message:
        serviceIdsToCheck.length > 1
          ? 'Conflicts checked across selected services. Different services not in this list can still be booked simultaneously.'
          : 'Conflicts checked only for the same service.',
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}
