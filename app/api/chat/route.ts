import { NextResponse } from "next/server";

const systemPrompt = `You are CodeNest AI, a friendly and reliable programming tutor and general question-answering assistant.
Teach Python, SQL/MySQL, Java, JavaScript, HTML/CSS, and AI/ML.
Answer the user's actual question directly. Do not refuse ordinary programming, study, technical, or general knowledge questions just because they are phrased as questions.
Assume the learner may be a complete beginner.
Explain step by step with simple language and small examples.
When useful, give a short practice question and a hint, but always provide the answer when the user asks for an answer.
Keep explanations clear and practical.
For coding questions, use fenced code blocks and explain the code after it.
Use the conversation history to understand follow-up questions and answer them in context.
`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchGemini(
  apiKey: string,
  model: string,
  contents: Array<{ role: "user" | "model"; parts: [{ text: string }] }>
) {
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.4,
          },
        }),
      }
    );

    if (response.ok) return response;

    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === maxAttempts - 1) {
      return response;
    }

    await sleep(1000 * 2 ** attempt + Math.floor(Math.random() * 500));
  }

  throw new Error("Gemini request failed.");
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const geminiKey = process.env.AI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const openaiModel = process.env.OPENAI_MODEL || "gpt-5.6-luna";
    const configuredGeminiModel = process.env.AI_MODEL || "gemini-3.8-flash";

    if (!geminiKey && !openaiKey) {
      return NextResponse.json(
        { error: "AI is not configured. Add AI_API_KEY in Vercel." },
        { status: 503 }
      );
    }

    const contents = (Array.isArray(messages) ? messages : [])
      .filter((message) => message?.role === "user" || message?.role === "assistant")
      .map((message) => ({
        role: message.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: String(message.content ?? "") }],
      }))
      .filter((message) => message.parts[0].text.trim());

    if (contents.length === 0) {
      return NextResponse.json({ error: "Please enter a message." }, { status: 400 });
    }

    let response: Response;
    let usingGemini = false;
    let usedModel = configuredGeminiModel;

    // Prefer the free Gemini key when it is configured.
    if (geminiKey) {
      usingGemini = true;
      const models = Array.from(
        new Set([
          configuredGeminiModel,
          "gemini-3.8-flash",
          "gemini-3.7-flash",
          "gemini-3.6-flash",
        ])
      );

      response = await fetchGemini(geminiKey, models[0], contents);

      // A 503/429 can be model-specific. Try another current Flash model before failing.
      if ([429, 500, 502, 503, 504].includes(response.status)) {
        for (const model of models.slice(1)) {
          const fallbackResponse = await fetchGemini(geminiKey, model, contents);
          if (fallbackResponse.ok) {
            response = fallbackResponse;
            usedModel = model;
            break;
          }
          response = fallbackResponse;
        }
      }
    } else {
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
    }

    if (!response.ok) {
      const detail = await response.text();
      let message = `AI API error: ${detail.slice(0, 300)}`;

      if (usingGemini && [429, 500, 502, 503, 504].includes(response.status)) {
        message =
          "Gemini is temporarily busy. CodeNest already retried and tried backup Flash models. Please try your question again in a moment.";
      } else if (usingGemini && response.status === 401) {
        message = "Gemini API key is invalid or expired. Create a new Gemini API key and update AI_API_KEY in Vercel.";
      } else if (usingGemini && response.status === 403) {
        message = "Gemini rejected this API key. Check the key restrictions and API access in Google AI Studio.";
      }

      return NextResponse.json({ error: message }, { status: response.status });
    }

    const data = await response.json();
    const message = usingGemini
      ? data.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text || "")
          .join("")
          .trim()
      : String(data.output_text || "").trim();

    return NextResponse.json({
      message: message || "I couldn't generate a response. Please try again.",
      model: usingGemini ? usedModel : openaiModel,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process the chat request. Please try again." },
      { status: 500 }
    );
  }
}
