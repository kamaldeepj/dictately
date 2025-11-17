import { getUser } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Response.json(
        { error: 'Failed to fetch token from ElevenLabs', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json({ token: data.token });
  } catch (error) {
    console.error('Error fetching ElevenLabs token:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

