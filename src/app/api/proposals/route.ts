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

    // Check if solicitation exists and get cutoff date
    const solicitation = await prisma.solicitation.findUnique({
      where: { id: solicitationId },
      select: { proposalCutoffDate: true, status: true }
    })

    if (!solicitation) {
      return NextResponse.json(
        { error: 'Solicitation not found' },
        { status: 404 }
      )
    }

    // Check if solicitation is still open
    if (solicitation.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Solicitation is closed' },
        { status: 403 }
      )
    }

    // Check proposal cutoff date
    if (solicitation.proposalCutoffDate) {
      const now = new Date()
      const cutoff = new Date(solicitation.proposalCutoffDate)
      
      if (now > cutoff) {
        return NextResponse.json(
          { error: 'Proposal submission deadline has passed' },
          { status: 403 }
        )
      }
    }

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