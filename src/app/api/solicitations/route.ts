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



    // Log what we're returning for debugging
    const rfp002 = solicitations.find(s => s.number === 'RFP-2025-002');
    if (rfp002) {
      console.log('📤 API GET returning for RFP-2025-002:');
      console.log('  - evaluationPeriods:', (rfp002 as any).evaluationPeriods);
      console.log('  - clins count:', rfp002.clins.length);
      console.log('  - clins:', rfp002.clins.map((c: any) => `${c.name}(${c.periodId})`).join(', '));
    }

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
    const { number, title, agency, description, questionCutoffDate, proposalCutoffDate, clins } = body

    const solicitation = await prisma.solicitation.create({
      data: {
        number,
        title,
        agency,
        description,

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
    const { id, number, title, agency, description, questionCutoffDate, proposalCutoffDate, status, evaluationPeriods, clins } = body

    console.log('🔄 API PUT received for solicitation:', id);
    console.log('📅 Received evaluationPeriods:', evaluationPeriods);
    console.log('📋 Received clins:', clins);

    if (!id) {
      return NextResponse.json(
        { error: 'Solicitation ID is required' },
        { status: 400 }
      )
    }

    // Handle CLINs update if provided
    let clinUpdateData = {}
    if (clins) {
      console.log('🗑️ About to delete existing CLINs for solicitation:', id);
      
      // Delete existing CLINs and create new ones
      const deleteResult = await prisma.clin.deleteMany({
        where: { solicitationId: id }
      })
      console.log('✅ Deleted', deleteResult.count, 'existing CLINs');
      
      const newClins = clins.map((clin: { name: string; description: string; pricingModel: string; periodId: string }) => ({
        name: clin.name,
        description: clin.description,
        pricingModel: clin.pricingModel,
        periodId: clin.periodId
      }));
      
      console.log('📝 About to create', newClins.length, 'new CLINs:', newClins);
      
      // Try to create CLINs one by one to catch any individual failures
      const createdClins = [];
      for (const clinData of newClins) {
        try {
          console.log('🔨 Creating individual CLIN:', clinData);
          const createdClin = await prisma.clin.create({
            data: {
              ...clinData,
              solicitationId: id
            }
          });
          createdClins.push(createdClin);
          console.log('✅ Successfully created CLIN:', createdClin.name);
        } catch (error) {
          console.error('❌ Failed to create CLIN:', clinData, 'Error:', error);
        }
      }
      
      console.log('📊 Total CLINs created:', createdClins.length, 'out of', newClins.length);
      
      // Don't use the batch create, we've already created them individually
      clinUpdateData = {}
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

    if (questionCutoffDate !== undefined) updateData.questionCutoffDate = new Date(questionCutoffDate);
    if (proposalCutoffDate !== undefined) updateData.proposalCutoffDate = new Date(proposalCutoffDate);
    if (evaluationPeriods !== undefined) updateData.evaluationPeriods = JSON.stringify(evaluationPeriods);
    if (status !== undefined) updateData.status = status;

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

    console.log('✅ Save completed. Final CLINs in database:', solicitation.clins.map((c: any) => `${c.name}(${c.periodId})`));

    return NextResponse.json(solicitation)
  } catch (error) {
    console.error('Error updating solicitation:', error)
    return NextResponse.json(
      { error: 'Failed to update solicitation', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}