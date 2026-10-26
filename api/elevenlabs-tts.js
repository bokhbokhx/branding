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
    const text = body.text;
    if (!text) {
      res.status(400).json({ error: "text required" });
      return;
    }
    const voiceId = body.voice_id || process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";

    const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "content-type": "application/json",
        accept: "audio/mpeg"
      },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" })
    });
    if (!r.ok) {
      const errText = await r.text();
      res.status(r.status).json({ error: errText });
      return;
    }
    const arrayBuffer = await r.arrayBuffer();
    res.setHeader("content-type", "audio/mpeg");
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
