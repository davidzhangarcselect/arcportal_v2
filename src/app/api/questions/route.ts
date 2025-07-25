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
        solicitationId,
        status: 'DRAFT',
        isQuestionDraft: true,
        isAnswerDraft: true
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

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, question, answer, action, vendorId } = body

    // Get the question to check permissions and cutoff dates
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        solicitation: {
          select: {
            questionCutoffDate: true,
            status: true
          }
        }
      }
    })

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Check permissions for vendor question editing
    if (question && existingQuestion.vendorId !== vendorId) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this question' },
        { status: 403 }
      )
    }

    // Check if question cutoff has passed for vendor edits
    if (question && existingQuestion.solicitation.questionCutoffDate) {
      const now = new Date()
      const cutoff = new Date(existingQuestion.solicitation.questionCutoffDate)
      
      if (now > cutoff) {
        return NextResponse.json(
          { error: 'Question editing deadline has passed' },
          { status: 403 }
        )
      }
    }

    let updateData: any = {}

    if (action === 'submit_question') {
      // Vendor submitting a draft question
      updateData = {
        question,
        status: 'SUBMITTED',
        isQuestionDraft: false,
        dateSubmitted: new Date()
      }
    } else if (action === 'edit_question') {
      // Vendor editing a draft question
      updateData = {
        question,
        status: 'DRAFT',
        isQuestionDraft: true
      }
    } else if (action === 'draft_answer') {
      // Admin saving draft answer
      updateData = {
        answer,
        status: 'ANSWERED',
        isAnswerDraft: true,
        dateAnswered: new Date()
      }
    } else if (action === 'post_answer') {
      // Admin posting final answer
      updateData = {
        answer,
        status: 'POSTED',
        isAnswerDraft: false,
        datePosted: new Date()
      }
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: updateData,
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const vendorId = searchParams.get('vendorId')

    if (!id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      )
    }

    // Get the question to check permissions and cutoff dates
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        solicitation: {
          select: {
            questionCutoffDate: true,
            status: true
          }
        }
      }
    })

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (existingQuestion.vendorId !== vendorId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this question' },
        { status: 403 }
      )
    }

    // Check if question cutoff has passed
    if (existingQuestion.solicitation.questionCutoffDate) {
      const now = new Date()
      const cutoff = new Date(existingQuestion.solicitation.questionCutoffDate)
      
      if (now > cutoff) {
        return NextResponse.json(
          { error: 'Question deletion deadline has passed' },
          { status: 403 }
        )
      }
    }

    // Only allow deletion of draft questions
    if (existingQuestion.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft questions can be deleted' },
        { status: 403 }
      )
    }

    await prisma.question.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Question deleted successfully' })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    )
  }
}

// Legacy PATCH method for backward compatibility
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, answer } = body

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        answer,
        status: 'ANSWERED',
        isAnswerDraft: true,
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