import { NextResponse } from "next/server";

const systemPrompt = `You are CodeNest AI, a friendly programming tutor.
Teach Python, SQL/MySQL, Java, JavaScript, HTML/CSS, and AI/ML.
Assume the learner may be a complete beginner.
Explain step by step with simple language and small examples.
When useful, give a short practice question and a hint.
Do not overwhelm the learner with advanced concepts unless requested.
For coding questions, use fenced code blocks and explain the code after it.
`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const apiKey = process.env.AI_API_KEY;
    const configuredModel = process.env.AI_MODEL || "gemini-3.6-flash";
    const model = configuredModel === "gemini-2.5-flash" ? "gemini-3.6-flash" : configuredModel;

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI is not configured yet. Add AI_API_KEY in your Vercel environment variables." },
        { status: 503 }
      );
    }

    const contents = (Array.isArray(messages) ? messages : [])
      .filter((message) => message?.role === "user" || message?.role === "assistant")
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: String(message.content ?? "") }],
      }))
      .filter((message) => message.parts[0].text.trim());

    if (contents.length === 0) {
      return NextResponse.json({ error: "Please enter a message." }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            },
        }),
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: `Gemini API error: ${detail.slice(0, 300)}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const message = data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim();

    return NextResponse.json({
      message: message || "I couldn't generate a response. Please try again.",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process the chat request." },
      { status: 500 }
    );
  }
}
