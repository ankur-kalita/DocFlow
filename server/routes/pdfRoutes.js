import express from "express";
import multer from "multer";
import { extractTables } from "../controllers/pdfController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Generate unique filenames
  },
});

// Multer upload configuration
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"), false);
    }
    cb(null, true);
  },
});

// Route for uploading and extracting tables from a PDF
router.post("/upload", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Call the controller function to process the uploaded file
    await extractTables(req, res);
  } catch (error) {
    console.error("Error in upload route:", error.message); // Log error for debugging
    return res.status(500).json({ message: error.message });
  }
});

export default router;
