import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingRaw = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { branch: true },
    });

    if (!bookingRaw) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Serialize booking with branch data to handle Decimal lat/lng fields
    const booking = {
      ...bookingRaw,
      branch: bookingRaw.branch ? {
        ...bookingRaw.branch,
        lat: bookingRaw.branch.lat ? Number(bookingRaw.branch.lat) : null,
        lng: bookingRaw.branch.lng ? Number(bookingRaw.branch.lng) : null,
      } : null,
    };

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({ error: 'Failed to fetch booking', details: error?.message || error }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Log only non-sensitive update info
    console.log('Updating booking:', {
      id,
      services: body.services,
      branchId: body.branchId,
      bookingDate: body.bookingDate,
      bookingTime: body.bookingTime
    });

    // Convert bookingDate to Date object if provided
    const updateData: any = { ...body };
    if (body.bookingDate) {
      updateData.bookingDate = new Date(body.bookingDate);
    }
    if (body.branchId) {
      updateData.branchId = parseInt(body.branchId);
    }

    const bookingRaw = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: updateData,
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
    console.log('Booking updated successfully:', {
      id: booking.id,
      services: booking.services,
      branchName: booking.branchName,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime
    });
    
    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: 'Failed to update booking', details: error?.message || error }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.booking.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ error: 'Failed to delete booking', details: error?.message || error }, { status: 500 });
  }
} 