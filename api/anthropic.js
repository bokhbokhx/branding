async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(500).json({ error: "ANTHROPIC_API_KEY غير مُعدّ على الخادم" });
      return;
    }
    const body = req.body || {};
    const system = body.system;
    const messages = body.messages;
    const tools = body.tools;
    const max_tokens = body.max_tokens || 1024;
    if (!messages) {
      res.status(400).json({ error: "messages required" });
      return;
    }
    const payload = {
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens,
      system,
      messages
    };
    if (tools) payload.tools = tools;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = handler;
module.exports.config = { maxDuration: 30 };
