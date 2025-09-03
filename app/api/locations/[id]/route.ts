import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const locationId = Number(id);

    // Check if location has any associated bookings
    const bookingCount = await prisma.booking.count({
      where: { branchId: locationId }
    });

    if (bookingCount > 0) {
      return NextResponse.json({
        error: `Cannot delete location. There are ${bookingCount} booking(s) associated with this location. Please delete or reassign the bookings first.`
      }, { status: 400 });
    }

    // Delete the location if no bookings are associated
    await prisma.location.delete({ where: { id: locationId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
  try {
    const body = await request.json();
    const { name, address, phone, image, subdomain, workingHours, lat, lng } = body;
    const updated = await prisma.location.update({
      where: { id: Number(id) },
      data: {
        name,
        address,
        phone,
        image,
        subdomain,
        workingHours,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
} 