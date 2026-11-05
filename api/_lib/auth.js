const crypto = require("crypto");

function getSecret() {
  return (
    process.env.ADMIN_SECRET ||
    crypto
      .createHash("sha256")
      .update((process.env.ADMIN_PASSWORD || "") + "brandy-salt")
      .digest("hex")
  );
}

function signToken() {
  const secret = getSecret();
  const expiry = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const payload = String(expiry);
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(payload + "." + sig).toString("base64url");
}

function verifyToken(token) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(".");
    const payload = parts[0];
    const sig = parts[1];
    const secret = getSecret();
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (sig !== expected) return false;
    if (Number(payload) < Date.now()) return false;
    return true;
  } catch (e) {
    return false;
  }
}

function isAuthed(req) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  return !!token && verifyToken(token);
}

function requireAuth(req, res) {
  if (!isAuthed(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

module.exports = { signToken, verifyToken, requireAuth, isAuthed };
