const API = "https://generativelanguage.googleapis.com/v1beta/models/";
const MODEL = "gemini-3.1-flash-lite";

async function readResponse(response) {
  const raw = await response.text();
  try { return raw ? JSON.parse(raw) : {}; }
  catch { return { error: { message: raw || `Empty response (${response.status})` } }; }
}

export async function onRequestPost({ request, env }) {
  const key = env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "Cloudflare Pages မှာ GEMINI_API_KEY Secret မထည့်ရသေးပါ။ Settings → Variables and Secrets မှာ ထည့်ပါ။" }, { status: 500 });
  try {
    const { image, mimeType = "image/jpeg", language = "Burmese", occasion = "General", notes = "" } = await request.json();
    if (!image || typeof image !== "string") return Response.json({ error: "Photo data မရှိပါ။" }, { status: 400 });
    if (image.length > 5_000_000) return Response.json({ error: "Photo data အရွယ်အစားကြီးလွန်းပါတယ်။ ပိုသေးတဲ့ပုံကို ရွေးပေးပါ။" }, { status: 413 });
    const prompt = `You are a careful professional makeup artist assistant supporting a human makeup artist. Analyze only visible cosmetic features; do not infer personality, ethnicity, health, age, or attractiveness. Lighting and camera can distort skin tone, so label undertone and shade as tentative and request in-person swatch confirmation. Do not criticize the client. Preserve their natural identity and features in all recommendations. Reply in ${language}. Occasion: ${occasion}. Artist notes: ${notes || "None"}. Give a structured, practical consultation with: (1) photo quality and visible limitations, (2) tentative face shape and visible eye/lip/nose/cheek features without overclaiming, (3) skin tone/undertone caveat, (4) specific eye makeup placement, (5) contour/blush/highlight placement, (6) base and foundation selection guidance, (7) lip and brow suggestions, (8) complete recommended look, (9) product types and application sequence, (10) alternative direction. Prioritize Douyin, Vietnamese, and Korean styles. Explain which of those three could suit the requested occasion and why. Be concise but useful for a professional artist.`;
    const response = await fetch(`${API}${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: image } }] }], generationConfig: { maxOutputTokens: 1500 } }),
      signal: AbortSignal.timeout(24000)
    });
    const result = await readResponse(response);
    if (!response.ok) {
      const detail = result.error?.message || `Gemini API error ${response.status}`;
      return Response.json({ error: `Gemini Analyze မအောင်မြင်ပါ။ ${detail}`, detail }, { status: response.status });
    }
    const parts = result.candidates?.[0]?.content?.parts || [];
    const answer = parts.filter(part => typeof part.text === "string").map(part => part.text).join("\n");
    if (!answer) {
      const reason = result.promptFeedback?.blockReason;
      return Response.json({ error: reason ? `Gemini safety filter ကြောင့် မဖြေနိုင်ပါ (${reason})။` : "Gemini က စာသားမပြန်ပေးပါ။ ပုံကို ပြန်ရွေးပြီး ထပ်စမ်းပါ။" }, { status: 502 });
    }
    return Response.json({ text: answer, model: MODEL });
  } catch (error) {
    const message = error?.name === "TimeoutError" ? "Gemini Analyze က 24 စက္ကန့်အတွင်း မတုံ့ပြန်နိုင်ပါ။ ပုံအရွယ်အစားလျှော့ပြီး ထပ်စမ်းပါ။" : (error?.message || "Server error");
    return Response.json({ error: message }, { status: 502 });
  }
}
