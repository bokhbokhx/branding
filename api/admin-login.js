const { signToken } = require("./_lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const body = req.body || {};
  const password = body.password;
  if (!process.env.ADMIN_PASSWORD) {
    res.status(500).json({ error: "ADMIN_PASSWORD غير مُعدّ على الخادم" });
    return;
  }
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "كلمة المرور غير صحيحة" });
    return;
  }
  res.status(200).json({ token: signToken() });
};
