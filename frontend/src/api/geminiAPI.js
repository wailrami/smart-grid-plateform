export async function callGeminiAPI(prompt) {
  // IMPORTANT: This is a placeholder for your actual API key.
  // In a real application, this should be handled securely and not hardcoded.
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Replace with your actual API key
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text;
    } else {
        console.error("Unexpected response structure:", result);
        return "Error: Could not parse Gemini's response.";
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return `Error: Could not retrieve insights. ${error.message}`;
  }
}

