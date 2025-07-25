import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
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

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { question, vendorId, solicitationId } = body

    // Check if solicitation exists and get cutoff date
    const solicitation = await prisma.solicitation.findUnique({
      where: { id: solicitationId },
      select: { questionCutoffDate: true, status: true }
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

    // Check question cutoff date
    if (solicitation.questionCutoffDate) {
      const now = new Date()
      const cutoff = new Date(solicitation.questionCutoffDate)
      
      if (now > cutoff) {
        return NextResponse.json(
          { error: 'Question submission deadline has passed' },
          { status: 403 }
        )
      }
    }

    const newQuestion = await prisma.question.create({
      data: {
        question,
        vendorId,
        solicitationId
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

    return NextResponse.json(newQuestion, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, answer } = body

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        answer,
        status: 'ANSWERED',
        dateAnswered: new Date()
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

    return NextResponse.json(updatedQuestion)
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    )
  }
}