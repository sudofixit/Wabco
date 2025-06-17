import { PrismaClient, AvailabilityStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear all data
  await prisma.product.deleteMany();
  await prisma.service.deleteMany();
  await prisma.location.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const adminPassword = await bcrypt.hash('Admin1234', 10);
  const staffPassword = await bcrypt.hash('Staff1234', 10);
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@wabco.com',
        passwordHash: adminPassword,
        role: UserRole.ADMIN,
        isActive: true,
      },
      {
        email: 'staff@wabco.com',
        passwordHash: staffPassword,
        role: UserRole.STAFF,
        isActive: true,
      },
    ],
  });

  // Services
  await prisma.service.createMany({
    data: [
      {
        title: 'Tire Rotation',
        description: 'Extend the life of your tires and improve safety with our professional tire rotation service.',
        image: '/images/tire-rotation.png',
        price: 80.00,
        isActive: true,
      },
      {
        title: 'Oil Change',
        description: 'Keep your engine running smoothly with a quick and affordable oil change.',
        image: '/images/oil-change.png',
        price: 120.00,
        isActive: true,
      },
      {
        title: 'Brake Inspection',
        description: 'Ensure your safety with a comprehensive brake system inspection by our experts.',
        image: '/images/brake-inspection.png',
        price: 0.00,
        isActive: true,
      },
    ],
  });

  // Locations
  await prisma.location.createMany({
    data: [
      {
        name: 'Dubai Branch',
        address: 'Al Quoz Industrial Area 3, Dubai, UAE',
        phone: '+971-4-123-4567',
        image: '/images/dubai-branch.png',
      },
      {
        name: 'Abu Dhabi Branch',
        address: 'Mussafah Industrial, Abu Dhabi, UAE',
        phone: '+971-2-234-5678',
        image: '/images/abu-dhabi-branch.png',
      },
      {
        name: 'Sharjah Branch',
        address: 'Industrial Area 4, Sharjah, UAE',
        phone: '+971-6-345-6789',
        image: '/images/sharjah-branch.png',
      },
    ],
  });

  // Products
  const productsData = [
      // Falken
      {
        pattern: 'Azenis FK510',
        width: '225/45R17',
        warranty: '120,000 Km',
        availability: AvailabilityStatus.IN_STOCK,
        price: 295.00,
        year: 2025,
        origin: 'Thailand',
        offer: true,
        offerText: 'Buy 1 Get 1 Free',
        description: 'Ultra-high performance summer tire for sporty driving.',
        image: '/images/falken-azenis-fk510.png',
      },
      {
        pattern: 'Ziex ZE310',
        width: '205/55R16',
        warranty: '100,000 Km',
        availability: AvailabilityStatus.LOW_STOCK,
        price: 260.00,
        year: 2024,
        origin: 'Japan',
        offer: false,
        description: 'Reliable all-season tire with excellent wet grip.',
        image: '/images/falken-ziex-ze310.png',
      },
      // Bridgestone
      {
        pattern: 'Potenza RE980AS',
        width: '215/55R17',
        warranty: '90,000 Km',
        availability: AvailabilityStatus.LOW_STOCK,
        price: 340.00,
        year: 2024,
        origin: 'Japan',
        offer: false,
        description: 'All-season ultra-high performance tire.',
        image: '/images/bridgestone-potenza-re980as.png',
      },
      {
        pattern: 'Turanza T005',
        width: '225/50R17',
        warranty: '110,000 Km',
        availability: AvailabilityStatus.OUT_OF_STOCK,
        price: 375.00,
        year: 2025,
        origin: 'Germany',
        offer: true,
        offerText: 'Special Offer',
        description: 'Premium touring tire for comfort and safety.',
        image: '/images/bridgestone-turanza-t005.png',
      },
      // Goodyear
      {
        pattern: 'Eagle F1 Asymmetric 5',
        width: '235/45R18',
        warranty: '110,000 Km',
        availability: AvailabilityStatus.IN_STOCK,
        price: 400.00,
        year: 2025,
        origin: 'Germany',
        offer: false,
        description: 'High-performance tire for sporty handling.',
        image: '/images/goodyear-eagle-f1-asymmetric-5.png',
      },
      {
        pattern: 'EfficientGrip Performance',
        width: '195/65R15',
        warranty: '80,000 Km',
        availability: AvailabilityStatus.IN_STOCK,
        price: 255.00,
        year: 2024,
        origin: 'Thailand',
        offer: false,
        description: 'Fuel-saving tire with long tread life.',
        image: '/images/goodyear-efficientgrip-performance.png',
      },
    ];

  // Temporarily disable product seeding until schema is fully updated
  // const productsWithBrandLogos = productsData.map(product => {
  //   return {
  //     ...product,
  //     brandLogo: null,
  //   };
  // });

  // await prisma.product.createMany({
  //   data: productsWithBrandLogos,
  // });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 