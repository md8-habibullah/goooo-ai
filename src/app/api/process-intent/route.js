import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // For local fallback if API key is missing, mock the response
      console.warn("OPENROUTER_API_KEY is missing. Using local fallback.");
      return NextResponse.json({
        intent: "General Inquiry",
        category: "Information",
        priority: "Low",
        location: "Unknown",
        summary: `Mock parsed: ${text}`,
        confidence: 0.8
      });
    }

    const systemPrompt = `You are a Voice-based AI Civic Assistant for Bangladesh.
Your task is to take the user's spoken text (in Bangla or English) and extract structured intent data.
Return ONLY valid JSON in the following format:
{
  "intent": "Police Report" | "Hospital Emergency" | "Government Service" | "Complaint" | "General Inquiry",
  "category": "e.g., Theft, Accident, Water Issue",
  "priority": "High" | "Medium" | "Low",
  "location": "Extract any location mentioned, else Unknown",
  "summary": "A concise 1-sentence summary of the request",
  "confidence": 0.0 to 1.0
}
No Markdown wrapping, just raw JSON.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter error:", err);
      throw new Error("Failed to call OpenRouter");
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean up if the model includes markdown formatting
    if (content.startsWith('\`\`\`json')) {
      content = content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Error in process-intent:", error);
    return NextResponse.json({ error: 'Failed to process intent' }, { status: 500 });
  }
}
