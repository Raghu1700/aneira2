#!/usr/bin/env tsx
/**
 * Idempotent seed.
 * Run: pnpm db:seed
 * Env:
 *   SEED_PRODUCTS=true  also seeds 6 sample products
 */

import { PrismaClient, Prisma } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('seeding...');

  await db.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyName: 'Aneira',
      freeShippingMin: new Prisma.Decimal(25000),
      flatRate: new Prisma.Decimal(250),
      gstRate: new Prisma.Decimal(0.03),
      gstInclusive: false,
      notifyEmails: [],
      supportEmail: 'orders@aneira.co',
    },
  });
  console.log('+ settings row');

  const collections = [
    {
      handle: 'heritage',
      title: 'Heritage',
      description:
        'Pieces rooted in tradition — meenakari, kundan, polki — hand-set by master artisans.',
      order: 1,
    },
    {
      handle: 'everyday',
      title: 'Everyday',
      description: 'Lightweight, considered jewellery for the way modern women live.',
      order: 2,
    },
    {
      handle: 'bridal',
      title: 'Bridal',
      description: 'Statement pieces designed to hold a moment.',
      order: 3,
    },
  ];

  for (const c of collections) {
    await db.collection.upsert({
      where: { handle: c.handle },
      update: {},
      create: { ...c, isPublished: true },
    });
  }
  console.log(`+ ${collections.length} collections`);

  if (process.env.SEED_PRODUCTS === 'true') {
    const heritage = await db.collection.findUnique({ where: { handle: 'heritage' } });
    const everyday = await db.collection.findUnique({ where: { handle: 'everyday' } });
    if (!heritage || !everyday) throw new Error('seed: collections missing');

    const samples = [
      {
        handle: 'meenakari-mango-haar',
        title: 'Meenakari Mango Haar',
        shortDescription: 'A hand-set meenakari haar in 22kt gold, ruby and emerald accents.',
        basePrice: new Prisma.Decimal(285000),
        metal: '22kt Gold',
        grossWeightG: new Prisma.Decimal(42.5),
        stones: 'Ruby, emerald, meenakari enamel',
        hallmark: 'BIS 916',
        certification: 'IGI certified',
        collectionId: heritage.id,
        tags: ['necklace', 'meenakari', 'bridal'],
        inventory: 1,
        isPublished: true,
        isFeatured: true,
      },
      {
        handle: 'lotus-stud-earrings',
        title: 'Lotus Stud Earrings',
        shortDescription: 'Petite lotus studs in 22kt gold — daily wear, weighty enough.',
        basePrice: new Prisma.Decimal(42000),
        metal: '22kt Gold',
        grossWeightG: new Prisma.Decimal(4.2),
        hallmark: 'BIS 916',
        collectionId: everyday.id,
        tags: ['earrings', 'daily', 'lotus'],
        inventory: 3,
        isPublished: true,
        isFeatured: true,
      },
    ];

    for (const p of samples) {
      await db.product.upsert({
        where: { handle: p.handle },
        update: {},
        create: p,
      });
    }
    console.log(`+ ${samples.length} sample products`);
  }

  console.log('seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
