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
    const model = process.env.AI_MODEL || "gpt-4o-mini";
    const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI is not configured yet. Add AI_API_KEY in your environment variables." },
        { status: 503 }
      );
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...(messages || [])],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: `AI provider error: ${detail.slice(0, 300)}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ message: data.choices?.[0]?.message?.content || "I couldn't generate a response." });
  } catch {
    return NextResponse.json({ error: "Unable to process the chat request." }, { status: 500 });
  }
}
