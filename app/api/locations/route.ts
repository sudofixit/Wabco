import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // Serialize Decimal fields to numbers for client compatibility
    const serializedLocations = locations.map((location: any) => ({
      ...location,
      lat: location.lat ? Number(location.lat) : null,
      lng: location.lng ? Number(location.lng) : null,
    }));
    
    // Add caching headers for better performance
    return NextResponse.json(serializedLocations, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5 minutes cache, 10 minutes stale
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, phone, image, workingHours, lat, lng } = body;
    const created = await prisma.location.create({
      data: { 
        name, 
        address, 
        phone, 
        image, 
        workingHours,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null
      },
    });
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
} 