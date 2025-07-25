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
    const { number, title, agency, description, dueDate, questionCutoffDate, proposalCutoffDate, clins } = body

    const solicitation = await prisma.solicitation.create({
      data: {
        number,
        title,
        agency,
        description,
        dueDate: new Date(dueDate),
        questionCutoffDate: questionCutoffDate ? new Date(questionCutoffDate) : null,
        proposalCutoffDate: proposalCutoffDate ? new Date(proposalCutoffDate) : null,
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

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    console.log('PUT request body:', JSON.stringify(body, null, 2))
    const { id, number, title, agency, description, dueDate, questionCutoffDate, proposalCutoffDate, status, evaluationPeriods, clins } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Solicitation ID is required' },
        { status: 400 }
      )
    }

    // Handle CLINs update if provided
    let clinUpdateData = {}
    if (clins) {
      console.log('Processing CLINs:', JSON.stringify(clins, null, 2))
      
      // Delete existing CLINs and create new ones
      const deleteResult = await prisma.clin.deleteMany({
        where: { solicitationId: id }
      })
      console.log('Deleted CLINs:', deleteResult.count)
      
      const clinData = clins.map((clin: { name: string; description: string; pricingModel: string; periodId: string }) => ({
        name: clin.name,
        description: clin.description,
        pricingModel: clin.pricingModel,
        periodId: clin.periodId
      }))
      console.log('CLIN data to create:', JSON.stringify(clinData, null, 2))
      
      clinUpdateData = {
        clins: {
          create: clinData
        }
      }
    }

    // Build update data object with only provided fields
    const updateData: any = {
      ...clinUpdateData
    };

    // Only update fields that are provided
    if (number !== undefined) updateData.number = number;
    if (title !== undefined) updateData.title = title;
    if (agency !== undefined) updateData.agency = agency;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (questionCutoffDate !== undefined) updateData.questionCutoffDate = new Date(questionCutoffDate);
    if (proposalCutoffDate !== undefined) updateData.proposalCutoffDate = new Date(proposalCutoffDate);
    if (evaluationPeriods !== undefined) updateData.evaluationPeriods = JSON.stringify(evaluationPeriods);
    if (status !== undefined) updateData.status = status;

    console.log('About to update solicitation with data:', JSON.stringify(updateData, null, 2))
    
    const solicitation = await prisma.solicitation.update({
      where: { id },
      data: updateData,
      include: {
        clins: true,
        _count: {
          select: {
            proposals: true,
            questions: true
          }
        }
      }
    })

    console.log('Updated solicitation result:', JSON.stringify({
      id: solicitation.id,
      evaluationPeriods: (solicitation as any).evaluationPeriods,
      clinsCount: solicitation.clins.length,
      clins: solicitation.clins
    }, null, 2))

    return NextResponse.json(solicitation)
  } catch (error) {
    console.error('Error updating solicitation:', error)
    return NextResponse.json(
      { error: 'Failed to update solicitation', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}