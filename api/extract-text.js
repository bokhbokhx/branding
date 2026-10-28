async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const body = req.body || {};
    const fileBase64 = body.file_base64;
    const mimeType = (body.mime_type || "").toLowerCase();
    const filename = (body.filename || "").toLowerCase();
    if (!fileBase64) {
      res.status(400).json({ error: "file_base64 required" });
      return;
    }
    const buffer = Buffer.from(fileBase64, "base64");
    let text = "";

    if (mimeType.includes("pdf") || filename.endsWith(".pdf")) {
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      text = data.text || "";
    } else if (
      mimeType.includes("wordprocessingml") ||
      filename.endsWith(".docx")
    ) {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || "";
    } else if (mimeType.startsWith("text/") || filename.endsWith(".txt")) {
      text = buffer.toString("utf8");
    } else {
      res.status(400).json({ error: "صيغة غير مدعومة. الصيغ المدعومة: PDF، DOCX، TXT." });
      return;
    }

    text = text.trim().slice(0, 20000);
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: "تعذّر قراءة الملف: " + err.message });
  }
}

module.exports = handler;
module.exports.config = { maxDuration: 30 };
