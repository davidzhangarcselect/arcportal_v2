import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const solicitations = await prisma.solicitation.findMany({
      include: {
        clins: true,
        _count: {
          select: {
            proposals: true,
            questions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(solicitations)
  } catch (error) {
    console.error('Error fetching solicitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch solicitations' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { number, title, agency, description, dueDate, clins } = body

    const solicitation = await prisma.solicitation.create({
      data: {
        number,
        title,
        agency,
        description,
        dueDate: new Date(dueDate),
        clins: {
          create: clins?.map((clin: { name: string; description: string; pricingModel: string }) => ({
            name: clin.name,
            description: clin.description,
            pricingModel: clin.pricingModel
          })) || []
        }
      },
      include: {
        clins: true
      }
    })

    return NextResponse.json(solicitation, { status: 201 })
  } catch (error) {
    console.error('Error creating solicitation:', error)
    return NextResponse.json(
      { error: 'Failed to create solicitation' },
      { status: 500 }
    )
  }
}