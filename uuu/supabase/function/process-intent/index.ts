import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, latitude, longitude } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const locationContext = latitude && longitude
      ? `User's GPS coordinates: ${latitude}, ${longitude}.`
      : "User location: Bangladesh (exact location unknown).";

    const systemPrompt = `You are NagrikAI, a civic assistant for Bangladesh. Analyze the user's spoken input and extract structured intent data.

${locationContext}

You MUST respond with a JSON object using this exact tool call. Classify the intent into one of these categories:
- file_police_report (Law Enforcement) — for crime, theft, violence, missing persons
- medical_assistance (Healthcare) — for health emergencies, hospitals, doctors
- civic_complaint (Civic Services) — for government services, road, water, electricity, corruption
- information_query (Information) — for holidays, events, schedules, general info
- emergency_report (Emergency) — for fire, flood, cyclone, earthquake, disasters

Determine priority:
- high: emergencies, police reports, life-threatening
- medium: medical assistance, urgent civic issues
- low: information queries, non-urgent complaints

For actionLabel, use a present-tense action like:
- "Reporting to Police"
- "Requesting Medical Help"  
- "Preparing Complaint"
- "Fetching Information"
- "Reporting Emergency"

Provide a voiceResponse field: a short, friendly spoken response (1-2 sentences) in the SAME language the user spoke in (Bangla or English). This will be read aloud to the user.

For location, try to extract a specific Bangladesh location from the text. If none mentioned, use "Unknown" or nearby city based on GPS.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_intent",
              description: "Classify the user's civic intent from their voice input",
              parameters: {
                type: "object",
                properties: {
                  intent: {
                    type: "string",
                    enum: ["file_police_report", "medical_assistance", "civic_complaint", "information_query", "emergency_report"],
                  },
                  category: {
                    type: "string",
                    enum: ["Law Enforcement", "Healthcare", "Civic Services", "Information", "Emergency"],
                  },
                  priority: {
                    type: "string",
                    enum: ["high", "medium", "low"],
                  },
                  location: { type: "string", description: "Extracted Bangladesh location or nearby city" },
                  summary: { type: "string", description: "Brief summary of what the user needs (max 150 chars)" },
                  confidence: { type: "number", description: "Confidence score 0.0 to 1.0" },
                  actionLabel: { type: "string", description: "Present-tense action label for UI header" },
                  voiceResponse: { type: "string", description: "Short spoken response in user's language" },
                },
                required: ["intent", "category", "priority", "location", "summary", "confidence", "actionLabel", "voiceResponse"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_intent" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI processing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "AI did not return structured data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-intent error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
