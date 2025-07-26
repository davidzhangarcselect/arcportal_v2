import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const solicitations = await prisma.solicitation.findMany({
      include: {
        clins: true,
        periods: true,
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
    const { number, title, agency, description, questionCutoffDate, proposalCutoffDate, evaluationPeriods, periodClins, technicalRequirements, pastPerformanceRequirements } = body

    // Create solicitation first
    const solicitation = await prisma.solicitation.create({
      data: {
        number,
        title,
        agency,
        description,
        questionCutoffDate: questionCutoffDate ? new Date(questionCutoffDate) : null,
        proposalCutoffDate: proposalCutoffDate ? new Date(proposalCutoffDate) : null,
        evaluationPeriods: evaluationPeriods || null,
        technicalRequirements: technicalRequirements || null,
        pastPerformanceRequirements: pastPerformanceRequirements || null
      }
    })

    // Create periods and CLINs if provided
    if (evaluationPeriods && periodClins) {
      for (const period of evaluationPeriods) {
        // Create period
        const createdPeriod = await prisma.period.create({
          data: {
            name: period.name,
            type: period.type,
            startDate: period.startDate ? new Date(period.startDate) : new Date(),
            endDate: period.endDate ? new Date(period.endDate) : new Date(),
            solicitationId: solicitation.id
          }
        })

        // Create CLINs for this period
        const clinsForPeriod = periodClins[period.id] || []
        for (const clin of clinsForPeriod) {
          await prisma.clin.create({
            data: {
              name: clin.name,
              description: clin.description,
              pricingModel: clin.pricingModel,
              solicitationId: solicitation.id,
              periodId: createdPeriod.id
            }
          })
        }
      }
    }

    // Fetch the complete solicitation with all related data
    const completeSolicitation = await prisma.solicitation.findUnique({
      where: { id: solicitation.id },
      include: {
        clins: true,
        periods: true,
        _count: {
          select: {
            proposals: true,
            questions: true
          }
        }
      }
    })

    return NextResponse.json(completeSolicitation, { status: 201 })
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
    const { id, number, title, agency, description, questionCutoffDate, proposalCutoffDate, status, evaluationPeriods, clins, technicalRequirements, pastPerformanceRequirements } = body

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
    if (evaluationPeriods !== undefined) {
      // Handle evaluationPeriods - ensure it's properly stringified
      if (typeof evaluationPeriods === 'string') {
        updateData.evaluationPeriods = evaluationPeriods;
      } else if (evaluationPeriods === null) {
        updateData.evaluationPeriods = null;
      } else {
        updateData.evaluationPeriods = JSON.stringify(evaluationPeriods);
      }
    }
    if (technicalRequirements !== undefined) updateData.technicalRequirements = technicalRequirements;
    if (pastPerformanceRequirements !== undefined) updateData.pastPerformanceRequirements = pastPerformanceRequirements;
    if (status !== undefined) updateData.status = status.toUpperCase();

    const solicitation = await prisma.solicitation.update({
      where: { id },
      data: updateData,
      include: {
        clins: true,
        periods: true,
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