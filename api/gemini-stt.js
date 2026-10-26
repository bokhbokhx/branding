const { fetchWithRetry } = require("./_lib/gemini");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: "GEMINI_API_KEY غير مُعدّ على الخادم" });
      return;
    }
    const body = req.body || {};
    const audioBase64 = body.audio_base64;
    const mimeType = body.mime_type || "audio/webm";
    if (!audioBase64) {
      res.status(400).json({ error: "audio_base64 required" });
      return;
    }
    const model = process.env.GEMINI_STT_MODEL || "gemini-3.8-flash";

    const r = await fetchWithRetry(
      "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: "فرّغ هذا المقطع الصوتي حرفيًا إلى نص عربي فقط. لا تضف أي تعليق أو شرح، أعد النص المنطوق فقط." },
                { inline_data: { mime_type: mimeType, data: audioBase64 } }
              ]
            }
          ]
        })
      }
    );
    const data = await r.json();
    if (!r.ok) {
      res.status(r.status).json({ error: data });
      return;
    }
    const candidate = (data.candidates || [])[0];
    const parts = (candidate && candidate.content && candidate.content.parts) || [];
    const text = parts.map((p) => p.text || "").join("").trim();
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
