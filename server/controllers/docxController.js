import fs from "fs";

export const processDocx = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // Just return the file path for frontend processing
    res.status(200).json({ 
      filePath: req.file.path,
      message: "DOCX file uploaded successfully" 
    });
  } catch (error) {
    console.error("Error processing DOCX:", error.message);
    res.status(500).json({ message: "Failed to process the DOCX file" });
  }
};
