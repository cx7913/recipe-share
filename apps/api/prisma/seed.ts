import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: '한식', slug: 'korean' },
  { name: '중식', slug: 'chinese' },
  { name: '일식', slug: 'japanese' },
  { name: '양식', slug: 'western' },
  { name: '분식', slug: 'snack' },
  { name: '디저트', slug: 'dessert' },
  { name: '음료', slug: 'beverage' },
  { name: '샐러드', slug: 'salad' },
  { name: '국/찌개', slug: 'soup' },
  { name: '반찬', slug: 'side-dish' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categories seeded');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
