import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get the first solicitation with its CLINs
    const solicitation = await prisma.solicitation.findFirst({
      include: {
        clins: true
      }
    })

    if (!solicitation) {
      return NextResponse.json({ error: 'No solicitation found' })
    }

    return NextResponse.json({
      id: solicitation.id,
      title: solicitation.title,
      evaluationPeriods: (solicitation as any).evaluationPeriods,
      clinsCount: solicitation.clins.length,
      clins: solicitation.clins.map(clin => ({
        id: clin.id,
        name: clin.name,
        description: clin.description,
        pricingModel: clin.pricingModel,
        periodId: (clin as any).periodId
      }))
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : String(error) 
    })
  }
}