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
    const openaiKey = process.env.OPENAI_API_KEY;
    const openaiModel = process.env.OPENAI_MODEL || "gpt-5.6-luna";
    const geminiKey = process.env.AI_API_KEY;
    const geminiModel = process.env.AI_MODEL || "gemini-3.6-flash";

    if (!openaiKey && !geminiKey) {
      return NextResponse.json(
        { error: "AI is not configured. Add OPENAI_API_KEY or AI_API_KEY in Vercel." },
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

    let response: Response;

    if (openaiKey) {
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: openaiModel,
          instructions: systemPrompt,
          input: contents.map((message) => ({
            role: message.role === "model" ? "assistant" : "user",
            content: message.parts[0].text,
          })),
        }),
      });
    } else {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiKey!,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
          }),
        }
      );
    }

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: `AI API error: ${detail.slice(0, 300)}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const message = openaiKey
      ? String(data.output_text || "").trim()
      : data.candidates?.[0]?.content?.parts
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
