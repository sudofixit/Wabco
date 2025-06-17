import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { brand: true },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: 'Failed to fetch products', details: error?.message || error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received product data:', body);
    const brandId = body.brandId !== undefined && body.brandId !== null && body.brandId !== '' ? Number(body.brandId) : null;
    const product = await prisma.product.create({
      data: {
        pattern: body.pattern,
        brandId,
        width: body.width,
        profile: body.profile,
        diameter: body.diameter,
        loadIndex: body.loadIndex,
        speedRating: body.speedRating,
        warranty: body.warranty,
        availability: body.availability,
        price: body.price,
        year: body.year,
        origin: body.origin,
        offer: body.offer,
        offerText: body.offerText,
        description: body.description,
        image: body.image,
      },
      include: { brand: true },
    });
    console.log('Created product:', product);
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: 'Failed to create product', details: error?.message || error }, { status: 500 });
  }
} 