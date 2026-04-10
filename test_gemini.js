async function run() {
  const apiKey = "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";
  // Attempt with gemini-1.5-flash
  const payload = {
    model: 'google/gemini-1.5-flash',
    messages: [
      { role: 'user', content: [
        { type: "text", text: "Respond 'yes' if you work" },
        { type: "input_audio", input_audio: { data: "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=", format: "wav" } }
      ] }
    ]
  };
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  console.log(response.status);
  console.log(await response.text());
}
run();
