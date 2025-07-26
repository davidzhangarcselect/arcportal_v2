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

      questionCutoffDate: new Date('2025-08-01'),
      proposalCutoffDate: new Date('2025-08-10'),
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

      questionCutoffDate: new Date('2025-08-15'),
      proposalCutoffDate: new Date('2025-08-25'),
      status: 'OPEN',

    },
  })

  // Create periods for solicitations
  const basePeriod1 = await prisma.period.create({
    data: {
      name: 'Base Period',
      type: 'BASE',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-08-31'),
      solicitationId: solicitation1.id,
    },
  })

  const optionPeriod1 = await prisma.period.create({
    data: {
      name: 'Option Period 1',
      type: 'OPTION',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-08-31'),
      solicitationId: solicitation1.id,
    },
  })

  const basePeriod2 = await prisma.period.create({
    data: {
      name: 'Base Period',
      type: 'BASE',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2026-09-30'),
      solicitationId: solicitation2.id,
    },
  })

  // Create CLINs for solicitations
  await prisma.clin.createMany({
    data: [
      {
        name: '0001',
        description: 'Software Development Services',
        pricingModel: 'TM',
        periodId: basePeriod1.id,
        solicitationId: solicitation1.id,
      },
      {
        name: '0002',
        description: 'Maintenance & Support',
        pricingModel: 'FFP',
        periodId: basePeriod1.id,
        solicitationId: solicitation1.id,
      },
      {
        name: '1001',
        description: 'Software Development Services - Option Year 1',
        pricingModel: 'TM',
        periodId: optionPeriod1.id,
        solicitationId: solicitation1.id,
      },
      {
        name: '0001',
        description: 'Security Assessment',
        pricingModel: 'FFP',
        periodId: basePeriod2.id,
        solicitationId: solicitation2.id,
      },
    ],
    skipDuplicates: true,
  })

  // Create sample questions
  await prisma.question.createMany({
    data: [
      {
        question: 'What is the expected timeline for project deliverables?',
        answer: 'The project timeline is 18 months with quarterly deliverables.',
        status: 'POSTED',
        dateAsked: new Date('2025-07-01'),
        dateAnswered: new Date('2025-07-03'),
        dateSubmitted: new Date('2025-07-01'),
        datePosted: new Date('2025-07-03'),
        isQuestionDraft: false,
        isAnswerDraft: false,
        vendorId: vendorUser.id,
        solicitationId: solicitation1.id,
      },
      {
        question: 'Are there any specific technology stack requirements?',
        answer: 'We prefer modern web technologies including React, Node.js, and PostgreSQL, but are open to alternatives with proper justification.',
        status: 'POSTED',
        dateAsked: new Date('2025-07-02'),
        dateAnswered: new Date('2025-07-04'),
        dateSubmitted: new Date('2025-07-02'),
        datePosted: new Date('2025-07-04'),
        isQuestionDraft: false,
        isAnswerDraft: false,
        vendorId: vendorUser.id,
        solicitationId: solicitation1.id,
      },
      {
        question: 'What is the budget range for this project?',
        status: 'SUBMITTED',
        dateAsked: new Date('2025-07-05'),
        dateSubmitted: new Date('2025-07-05'),
        isQuestionDraft: false,
        isAnswerDraft: true,
        vendorId: vendorUser.id,
        solicitationId: solicitation1.id,
      },
      {
        question: 'Will there be opportunities for contract extensions?',
        answer: 'Yes, there will be two optional 12-month extension periods based on performance.',
        status: 'POSTED',
        dateAsked: new Date('2025-07-03'),
        dateAnswered: new Date('2025-07-05'),
        dateSubmitted: new Date('2025-07-03'),
        datePosted: new Date('2025-07-05'),
        isQuestionDraft: false,
        isAnswerDraft: false,
        vendorId: vendorUser.id,
        solicitationId: solicitation2.id,
      },
    ],
    skipDuplicates: true,
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