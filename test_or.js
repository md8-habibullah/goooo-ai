async function run() {
  const apiKey = "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";
  // Attempt with openai/gpt-audio-mini
  const payload = {
    model: 'openai/gpt-audio-mini',
    messages: [
      { role: 'user', content: 'Say hello world' }
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
