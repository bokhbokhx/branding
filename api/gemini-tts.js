function pcmToWav(pcmBuffer, sampleRate, channels, bitDepth) {
  const byteRate = (sampleRate * channels * bitDepth) / 8;
  const blockAlign = (channels * bitDepth) / 8;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcmBuffer.length, 40);
  return Buffer.concat([header, pcmBuffer]);
}

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
    const text = body.text;
    if (!text) {
      res.status(400).json({ error: "text required" });
      return;
    }
    const model = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
    const voiceName = process.env.GEMINI_VOICE_NAME || "Kore";

    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
          }
        })
      }
    );
    if (!r.ok) {
      const errData = await r.json().catch(() => ({}));
      res.status(r.status).json({ error: errData });
      return;
    }
    const data = await r.json();
    const candidate = (data.candidates || [])[0];
    const parts = (candidate && candidate.content && candidate.content.parts) || [];
    const audioPart = parts.find((p) => p.inlineData || p.inline_data);
    const inline = audioPart && (audioPart.inlineData || audioPart.inline_data);
    if (!inline || !inline.data) {
      res.status(502).json({ error: "لم يرجع Gemini صوتًا" });
      return;
    }
    const pcm = Buffer.from(inline.data, "base64");
    const wav = pcmToWav(pcm, 24000, 1, 16);
    res.setHeader("content-type", "audio/wav");
    res.status(200).send(wav);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
