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
    const { vendorId, solicitationId, notes, technicalFiles, pastPerformanceFiles } = body
    
    console.log('Proposal submission data:', { 
      vendorId, 
      solicitationId, 
      notes, 
      technicalFilesCount: technicalFiles?.length || 0,
      pastPerformanceFilesCount: pastPerformanceFiles?.length || 0,
      technicalFiles,
      pastPerformanceFiles
    })

    // Validate required fields
    if (!vendorId || !solicitationId) {
      console.error('Missing required fields:', { vendorId, solicitationId })
      return NextResponse.json(
        { error: 'Missing required fields: vendorId or solicitationId' },
        { status: 400 }
      )
    }

    // Check if solicitation exists and get cutoff date
    const solicitation = await prisma.solicitation.findUnique({
      where: { id: solicitationId },
      select: { proposalCutoffDate: true, status: true }
    })

    if (!solicitation) {
      console.error('Solicitation not found:', solicitationId)
      return NextResponse.json(
        { error: 'Solicitation not found' },
        { status: 404 }
      )
    }

    // Check if solicitation is still open
    if (solicitation.status !== 'OPEN') {
      console.error('Solicitation is closed:', { solicitationId, status: solicitation.status })
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
        console.error('Proposal deadline passed:', { now, cutoff })
        return NextResponse.json(
          { error: 'Proposal submission deadline has passed' },
          { status: 403 }
        )
      }
    }

    console.log('Creating proposal with initial data...')
    const proposal = await prisma.proposal.create({
      data: {
        vendorId,
        solicitationId,
        notes: notes || ''
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

    console.log('Proposal created with ID:', proposal.id)

    // Update with file attachments if provided
    if (technicalFiles || pastPerformanceFiles) {
      console.log('Updating proposal with attachments...')
      const updatedProposal = await prisma.proposal.update({
        where: { id: proposal.id },
        data: {
          ...(technicalFiles && { technicalFiles }),
          ...(pastPerformanceFiles && { pastPerformanceFiles })
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
      console.log('Proposal updated successfully')
      return NextResponse.json(updatedProposal, { status: 201 })
    }

    console.log('Proposal created successfully without attachments')
    return NextResponse.json(proposal, { status: 201 })
  } catch (error) {
    console.error('Error creating proposal - Full error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Check for specific Prisma errors
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Invalid vendor or solicitation ID' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create proposal', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}