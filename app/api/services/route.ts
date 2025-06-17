import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        title: 'asc'
      }
    });

    // Convert Decimal to number for client compatibility
    const serializedServices = services.map((service: any) => ({
      ...service,
      price: service.price ? Number(service.price) : null,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    }));

    return NextResponse.json(serializedServices, {
      headers: {
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=1200', // 10 minutes cache, 20 minutes stale
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, image, price, isActive } = body;
    const created = await prisma.service.create({
      data: { title, description, image, price, isActive },
    });
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
} 