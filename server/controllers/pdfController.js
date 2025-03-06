import fs from "fs";
import pdfParse from "pdf-parse";

export const extractTables = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const pdfBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(pdfBuffer);
    res.status(200).json({ text: data.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
