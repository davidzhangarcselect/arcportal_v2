import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@arcportal.gov' },
    update: {},
    create: {
      email: 'admin@arcportal.gov',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@techcorp.com' },
    update: {},
    create: {
      email: 'vendor@techcorp.com',
      name: 'John Smith',
      role: 'VENDOR',
      companyName: 'TechCorp Solutions',
      ueiNumber: 'ABC123456789',
      socioEconomicStatus: ['Small Business', 'Veteran-Owned Small Business (VOSB)'],
    },
  })

  // Create sample solicitations
  const solicitation1 = await prisma.solicitation.upsert({
    where: { number: 'RFP-2025-001' },
    update: {},
    create: {
      number: 'RFP-2025-001',
      title: 'Enterprise Software Development Services',
      agency: 'Department of Technology',
      description: 'Seeking qualified vendors for enterprise software development and maintenance services.',
      dueDate: new Date('2025-08-15'),
      status: 'OPEN',
    },
  })

  const solicitation2 = await prisma.solicitation.upsert({
    where: { number: 'RFP-2025-002' },
    update: {},
    create: {
      number: 'RFP-2025-002',
      title: 'Cybersecurity Consulting Services',
      agency: 'Department of Defense',
      description: 'Comprehensive cybersecurity assessment and consulting services.',
      dueDate: new Date('2025-09-01'),
      status: 'OPEN',
    },
  })

  // Create CLINs for solicitations
  await prisma.clin.createMany({
    data: [
      {
        name: 'CLIN 0001',
        description: 'Software Development Services',
        pricingModel: 'TM',
        solicitationId: solicitation1.id,
      },
      {
        name: 'CLIN 0002',
        description: 'Maintenance & Support',
        pricingModel: 'FFP',
        solicitationId: solicitation1.id,
      },
      {
        name: 'CLIN 0001',
        description: 'Security Assessment',
        pricingModel: 'FFP',
        solicitationId: solicitation2.id,
      },
    ],
    skipDuplicates: true,
  })

  // Create sample questions
  await prisma.question.create({
    data: {
      question: 'What is the expected timeline for project deliverables?',
      answer: 'The project timeline is 18 months with quarterly deliverables.',
      status: 'ANSWERED',
      dateAsked: new Date('2025-07-01'),
      dateAnswered: new Date('2025-07-03'),
      vendorId: vendorUser.id,
      solicitationId: solicitation1.id,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Admin user: ${adminUser.email}`)
  console.log(`🏢 Vendor user: ${vendorUser.email} (${vendorUser.companyName})`)
  console.log(`📋 Created ${2} solicitations`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })