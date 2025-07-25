import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const proposals = await prisma.proposal.findMany({
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            email: true
          }
        },
        solicitation: {
          select: {
            id: true,
            number: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(proposals)
  } catch (error) {
    console.error('Error fetching proposals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { vendorId, solicitationId, notes } = body

    const proposal = await prisma.proposal.create({
      data: {
        vendorId,
        solicitationId,
        notes
      },
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            email: true
          }
        },
        solicitation: {
          select: {
            id: true,
            number: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json(proposal, { status: 201 })
  } catch (error) {
    console.error('Error creating proposal:', error)
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    )
  }
}