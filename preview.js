import { getMakeupLook } from "../../makeup-looks.mjs";

const API = "https://generativelanguage.googleapis.com/v1beta/models/";
const MODEL = "gemini-3.1-flash-image";

async function readResponse(response) {
  const raw = await response.text();
  try { return raw ? JSON.parse(raw) : {}; }
  catch { return { error: { message: raw || `Empty response (${response.status})` } }; }
}

export async function onRequestPost({ request, env }) {
  const key = env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "Cloudflare Pages မှာ GEMINI_API_KEY Secret မထည့်ရသေးပါ။ Settings → Variables and Secrets မှာ ထည့်ပါ။" }, { status: 500 });
  try {
    const { image, mimeType = "image/jpeg", style = "douyin" } = await request.json();
    if (!image || typeof image !== "string") return Response.json({ error: "Photo မရှိပါ။" }, { status: 400 });
    if (image.length > 5_000_000) return Response.json({ error: "Photo data အရွယ်အစားကြီးလွန်းပါတယ်။ ပိုသေးတဲ့ပုံကို ရွေးပေးပါ။" }, { status: 413 });
    const selectedLook = getMakeupLook(style) || getMakeupLook("douyin");
    const prompt = `Edit the provided client's photo to apply only this makeup style (${selectedLook.name}): ${selectedLook.prompt}\n\nCRITICAL IDENTITY PRESERVATION:\nKeep the same person and preserve their identity, face shape, facial proportions, eye size and shape, nose, lips, jaw, skin tone, expression, pose, hairstyle, clothing, and background unchanged. Do not beautify, reshape, slim, enlarge, or alter facial anatomy. Only add realistic cosmetic makeup: foundation finish, eyeshadow, eyeliner, blush, makeup contour, highlight, and lipstick. Keep the result photorealistic and suitable for professional client consultation.`;
    const response = await fetch(`${API}${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: image } }] }], generationConfig: { responseModalities: ["IMAGE"] } }),
      signal: AbortSignal.timeout(52000)
    });
    const result = await readResponse(response);
    if (!response.ok) {
      const detail = result.error?.message || `Gemini image API error ${response.status}`;
      return Response.json({ error: `Gemini Preview API error (${response.status}): ${detail}`, detail }, { status: response.status });
    }
    const parts = result.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      const data = part.inlineData || part.inline_data;
      if (data?.data) return Response.json({ image: data.data, mimeType: data.mimeType || data.mime_type || "image/png" });
    }
    const finishReason = result.candidates?.[0]?.finishReason;
    const blockReason = result.promptFeedback?.blockReason;
    const detail = blockReason ? `Gemini safety filter: ${blockReason}` : finishReason ? `Gemini image response has no image (finishReason: ${finishReason})` : "Gemini က image data မပြန်ပေးခဲ့ပါ။";
    return Response.json({ error: `Preview ပုံမရရှိပါ။ ${detail}`, detail }, { status: 502 });
  } catch (error) {
    const message = error?.name === "TimeoutError" ? "Gemini Preview က 52 စက္ကန့်အတွင်း မတုံ့ပြန်ပါ။ ခဏစောင့်ပြီး ထပ်စမ်းပါ။" : (error?.message || "Preview server error");
    return Response.json({ error: message }, { status: 502 });
  }
}
