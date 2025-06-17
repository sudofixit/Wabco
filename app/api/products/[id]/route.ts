import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { brand: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const brandId = body.brandId !== undefined && body.brandId !== null && body.brandId !== '' ? Number(body.brandId) : null;
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
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
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
} 