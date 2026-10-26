const { kvSet, kvKeys, kvGet } = require("./_lib/kv");
const { requireAuth } = require("./_lib/auth");
const crypto = require("crypto");

module.exports = async (req, res) => {
  if (req.method === "POST") {
    try {
      const body = req.body || {};
      const id = crypto.randomBytes(8).toString("hex");
      const record = {
        id,
        createdAt: Date.now(),
        status: "new",
        homework: body.homework || {},
        profile: body.profile || {},
        analysis: "",
        specialistNotes: "",
        approved: false,
        meeting: { date: "", time: "", mode: "حضوري", place: "", notes: "" },
        deliverables: { cv: "", profile_doc: "", linkedin: "", persona: "", content_prompts: "" }
      };
      await kvSet("brandy:submission:" + id, record);
      res.status(200).json({ id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  if (req.method === "GET") {
    if (!requireAuth(req, res)) return;
    try {
      const keys = await kvKeys("brandy:submission:*");
      const items = [];
      for (const k of keys) {
        const rec = await kvGet(k);
        if (rec) {
          items.push({ id: rec.id, createdAt: rec.createdAt, status: rec.status });
        }
      }
      items.sort((a, b) => b.createdAt - a.createdAt);
      res.status(200).json({ items });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
};
