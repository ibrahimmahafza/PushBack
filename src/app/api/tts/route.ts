import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Text-to-Speech API route.
 * Uses ElevenLabs when API key is available, returns fallback signal otherwise.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ fallback: true }, { status: 200 });
  }

  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text || text.length > 5000) {
    return NextResponse.json({ error: 'Text required (max 5000 chars)' }, { status: 400 });
  }

  try {
    // ElevenLabs TTS - Rachel voice (21m00Tcm4TlvDq8ikWAM)
    const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!res.ok) {
      console.error('[tts] ElevenLabs error:', res.status, await res.text().catch(() => ''));
      return NextResponse.json({ fallback: true }, { status: 200 });
    }

    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[tts] Error:', err);
    return NextResponse.json({ fallback: true }, { status: 200 });
  }
}
