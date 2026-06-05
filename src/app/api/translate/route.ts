import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { text, from } = await request.json();

    if (!text?.trim()) {
      return Response.json({ translation: "" });
    }

    const targetLang = from === "he" ? "English" : "Hebrew";
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Translate the following text to ${targetLang}. Return only the translation, nothing else, no quotes, no explanation:\n\n${text}`,
        },
      ],
    });

    const translation =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";
    return Response.json({ translation });
  } catch (error) {
    console.error("Translation error:", error);
    return Response.json({ translation: "" }, { status: 500 });
  }
}
