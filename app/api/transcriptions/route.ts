import { NextRequest, NextResponse } from 'next/server';
import { createTranscription, updateTranscription, getTranscriptions } from '@/lib/db/queries';

export async function GET() {
  try {
    const transcriptions = await getTranscriptions();
    return NextResponse.json(transcriptions, { status: 200 });
  } catch (error) {
    console.error('Error fetching transcriptions:', error);
    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch transcriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcription, status } = body;

    if (transcription === undefined || typeof transcription !== 'string') {
      return NextResponse.json(
        { error: 'Transcription text is required' },
        { status: 400 }
      );
    }

    const newTranscription = await createTranscription({
      transcription,
      status: status || 'pending',
    });

    return NextResponse.json(newTranscription, { status: 201 });
  } catch (error) {
    console.error('Error creating transcription:', error);
    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create transcription' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, transcription, status } = body;

    if (!id || typeof id !== 'number') {
      return NextResponse.json(
        { error: 'Transcription ID is required' },
        { status: 400 }
      );
    }

    const updateData: { transcription?: string; status?: string } = {};
    if (transcription !== undefined) {
      updateData.transcription = transcription;
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedTranscription = await updateTranscription(id, updateData);

    if (!updatedTranscription) {
      return NextResponse.json(
        { error: 'Transcription not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTranscription, { status: 200 });
  } catch (error) {
    console.error('Error updating transcription:', error);
    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update transcription' },
      { status: 500 }
    );
  }
}

