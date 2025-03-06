import fs from "fs";
import pdfParse from "pdf-parse";

export const extractTables = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read the uploaded PDF file from disk
    const pdfBuffer = fs.readFileSync(req.file.path);

    // Parse the PDF content using pdf-parse
    const data = await pdfParse(pdfBuffer);

    // Send extracted text as a response
    res.status(200).json({ text: data.text });
  } catch (error) {
    console.error("Error extracting tables:", error.message); // Log error for debugging
    res.status(500).json({ message: "Failed to process the PDF file" });
  } finally {
    // Clean up the uploaded file to avoid cluttering the server
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkError) {
      console.error("Error deleting uploaded file:", unlinkError.message);
    }
  }
};
