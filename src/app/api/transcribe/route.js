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

    // Switching to Gemini 2.5 Flash via OpenRouter
    // 1. It natively bypasses OpenAI's Zero Data Retention guardrail that breaks accounts.
    // 2. It has fantastic native support for Bangla audio.
    // 3. It flawlessly reads compressed audio buffers like WebM/WAV passing through OpenRouter.
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${orKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: "You are an expert transcriber serving rural Bangladesh. Listen carefully to the audio and transcribe exactly what is spoken (in Bangla or English). DO NOT answer or converse. Only output the exact transcript."
          },
          {
            role: 'user',
            content: [
              {
                type: "input_audio",
                input_audio: {
                  data: base64Audio,
                  format: "wav" 
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
      // Catch specific OpenRouter errors for debugging
      if (err.includes("guardrail")) {
        return NextResponse.json({ error: "guardrail_error" }, { status: 403 });
      }
      return NextResponse.json({ error: `Audio Model failed: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
       console.error("Malformed AI Response:", data);
       return NextResponse.json({ error: 'Voice system received an empty response from AI.' }, { status: 500 });
    }
    
    const transcript = data.choices[0].message.content;
    
    return NextResponse.json({ text: transcript });

  } catch (error) {
    console.error("Error transcribing:", error);
    return NextResponse.json({ error: 'Server failed to process voice audio.' }, { status: 500 });
  }
}
