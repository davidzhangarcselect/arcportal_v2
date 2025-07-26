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
  console.log('POST /api/proposals - Request received')
  
  try {
    let body;
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error('Failed to parse request JSON:', jsonError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    const { vendorId, solicitationId, notes, technicalFiles, pastPerformanceFiles } = body
    
    console.log('Proposal submission data:', { 
      vendorId, 
      solicitationId, 
      notes, 
      technicalFilesCount: technicalFiles?.length || 0,
      pastPerformanceFilesCount: pastPerformanceFiles?.length || 0,
      technicalFiles: JSON.stringify(technicalFiles),
      pastPerformanceFiles: JSON.stringify(pastPerformanceFiles)
    })

    // Validate required fields
    if (!vendorId || !solicitationId) {
      console.error('Missing required fields:', { vendorId, solicitationId })
      return NextResponse.json(
        { error: 'Missing required fields: vendorId or solicitationId' },
        { status: 400 }
      )
    }

    // Check if vendor exists
    const vendor = await prisma.user.findUnique({
      where: { id: vendorId },
      select: { id: true, role: true }
    })

    if (!vendor) {
      console.error('Vendor not found:', vendorId)
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    if (vendor.role !== 'VENDOR') {
      console.error('User is not a vendor:', { vendorId, role: vendor.role })
      return NextResponse.json(
        { error: 'User is not a vendor' },
        { status: 403 }
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

    // Validate file attachments format
    let validatedTechnicalFiles = null;
    let validatedPastPerformanceFiles = null;
    
    try {
      if (technicalFiles && Array.isArray(technicalFiles)) {
        validatedTechnicalFiles = technicalFiles;
      }
      if (pastPerformanceFiles && Array.isArray(pastPerformanceFiles)) {
        validatedPastPerformanceFiles = pastPerformanceFiles;
      }
    } catch (fileError) {
      console.error('Error validating file attachments:', fileError)
      return NextResponse.json(
        { error: 'Invalid file attachment format' },
        { status: 400 }
      )
    }

    console.log('Creating proposal with data...')
    try {
      const proposal = await prisma.proposal.create({
        data: {
          vendorId,
          solicitationId,
          notes: notes || '',
          technicalFiles: validatedTechnicalFiles || undefined,
          pastPerformanceFiles: validatedPastPerformanceFiles || undefined
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

      console.log('Proposal created successfully with ID:', proposal.id)
      return NextResponse.json(proposal, { status: 201 })
    } catch (dbError) {
      console.error('Database error creating proposal:', dbError)
      if (dbError instanceof Error) {
        console.error('Error message:', dbError.message)
        console.error('Error stack:', dbError.stack)
      }
      throw dbError;
    }
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