import { NextRequest, NextResponse } from 'next/server';
import { deleteTranscription, getTranscription } from '@/lib/db/queries';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transcriptionId = parseInt(id, 10);

    if (isNaN(transcriptionId)) {
      return NextResponse.json(
        { error: 'Invalid transcription ID' },
        { status: 400 }
      );
    }

    const deletedTranscription = await deleteTranscription(transcriptionId);

    if (!deletedTranscription) {
      return NextResponse.json(
        { error: 'Transcription not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Transcription deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting transcription:', error);
    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete transcription' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transcriptionId = parseInt(id, 10);

    if (isNaN(transcriptionId)) {
      return NextResponse.json(
        { error: 'Invalid transcription ID' },
        { status: 400 }
      );
    }

    const transcription = await getTranscription(transcriptionId);

    if (!transcription) {
      return NextResponse.json(
        { error: 'Transcription not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(transcription, { status: 200 });
  } catch (error) {
    console.error('Error fetching transcription:', error);
    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch transcription' },
      { status: 500 }
    );
  }
}

