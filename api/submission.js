const { kvGet, kvSet } = require("./_lib/kv");
const { requireAuth } = require("./_lib/auth");

module.exports = async (req, res) => {
  const id = (req.query && req.query.id) || "";
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }

  if (req.method === "GET") {
    if (!requireAuth(req, res)) return;
    try {
      const rec = await kvGet("brandy:submission:" + id);
      if (!rec) {
        res.status(404).json({ error: "not found" });
        return;
      }
      res.status(200).json(rec);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  if (req.method === "PATCH") {
    if (!requireAuth(req, res)) return;
    try {
      const rec = await kvGet("brandy:submission:" + id);
      if (!rec) {
        res.status(404).json({ error: "not found" });
        return;
      }
      const patch = req.body || {};
      Object.assign(rec, patch);
      await kvSet("brandy:submission:" + id, rec);
      res.status(200).json(rec);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
};
