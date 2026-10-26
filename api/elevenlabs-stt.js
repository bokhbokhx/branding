module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      res.status(500).json({ error: "ELEVENLABS_API_KEY غير مُعدّ على الخادم" });
      return;
    }
    const body = req.body || {};
    const audioBase64 = body.audio_base64;
    if (!audioBase64) {
      res.status(400).json({ error: "audio_base64 required" });
      return;
    }
    const buffer = Buffer.from(audioBase64, "base64");
    const blob = new Blob([buffer], { type: "audio/webm" });
    const form = new FormData();
    form.append("file", blob, "audio.webm");
    form.append("model_id", "scribe_v1");

    const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY },
      body: form
    });
    const data = await r.json();
    if (!r.ok) {
      res.status(r.status).json({ error: data });
      return;
    }
    res.status(200).json({ text: data.text || "" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
