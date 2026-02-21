import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deckContent, companyStage, industry, slideCount } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const prompt = `
You are a venture capital analyst.

Analyze the pitch deck and return ONLY valid JSON.

Company Stage: ${companyStage}
Industry: ${industry}
Total Slides: ${slideCount}

Pitch Deck Content:
${deckContent}

Return JSON in this exact format:

{
  "overallScore": number,
  "scores": {
    "teamExperience": number,
    "marketPotential": number,
    "flowAndClarity": number,
    "problemSolution": number,
    "businessModel": number
  },
  "promisingAspects": string,
  "areasForImprovement": string[],
  "nextSteps": string[]
}

Return ONLY JSON. No explanations.
`;

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3
        },
      }),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json(
        { error: "Gemini API request failed." },
        { status: 500 }
      );
    }

    const data = await geminiRes.json();

    // Extract text safely
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    // Remove markdown wrapping if present
    const cleanedText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleanedText);
    } catch (err) {
      console.error("Failed to parse Gemini JSON:", cleanedText);
      return NextResponse.json(
        { error: "Invalid JSON returned from AI." },
        { status: 500 }
      );
    }

    // Optional: Ensure safe defaults (prevents frontend crashes)
    const safeResponse = {
      overallScore: parsed?.overallScore ?? 0,
      scores: {
        teamExperience: parsed?.scores?.teamExperience ?? 0,
        marketPotential: parsed?.scores?.marketPotential ?? 0,
        flowAndClarity: parsed?.scores?.flowAndClarity ?? 0,
        problemSolution: parsed?.scores?.problemSolution ?? 0,
        businessModel: parsed?.scores?.businessModel ?? 0,
      },
      promisingAspects: parsed?.promisingAspects ?? "",
      areasForImprovement: parsed?.areasForImprovement ?? [],
      nextSteps: parsed?.nextSteps ?? [],
    };

    return NextResponse.json(safeResponse);

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}