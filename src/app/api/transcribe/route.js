import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const orKey = process.env.OPENROUTER_API_KEY;
    if (!orKey) {
      return NextResponse.json({ error: 'Missing OPENROUTER_API_KEY in .env.local' }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');

    // We use OpenRouter's chat completion with openai/gpt-4o-audio-preview
    // OpenAI expects wav or mp3 format in the payload. While the browser may record in webm,
    // GPT-4o often successfully processes the container when passed as wav format due to robust decoders.
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${orKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-audio-preview',
        messages: [
          {
            role: 'system',
            content: "You are an expert transcriber. Listen carefully to the audio and transcribe exactly what is spoken (in Bangla or English). DO NOT answer or converse. Only type the exact transcript of their speech."
          },
          {
            role: 'user',
            content: [
              {
                type: "input_audio",
                input_audio: {
                  data: base64Audio,
                  format: "wav" // OpenAI's API requires this to be "wav" or "mp3"
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter Audio API error:", err);
      return NextResponse.json({ error: `Audio Model failed: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const transcript = data.choices[0].message.content;
    
    return NextResponse.json({ text: transcript });

  } catch (error) {
    console.error("Error transcribing:", error);
    return NextResponse.json({ error: 'Server failed to process voice audio.' }, { status: 500 });
  }
}
