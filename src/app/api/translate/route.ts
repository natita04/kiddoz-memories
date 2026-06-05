import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, from } = await request.json();

    if (!text?.trim()) {
      return Response.json({ translation: "" });
    }

    const langPair = from === "he" ? "he|en" : "en|he";
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    const res = await fetch(url);
    const data = await res.json();

    const translation: string =
      data?.responseStatus === 200
        ? data.responseData.translatedText
        : "";

    return Response.json({ translation });
  } catch (error) {
    console.error("Translation error:", error);
    return Response.json({ translation: "" }, { status: 500 });
  }
}
