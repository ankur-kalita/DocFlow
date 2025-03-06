import express from "express";
import multer from "multer";
import { extractTables } from "../controllers/pdfController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", authenticateToken, upload.single("file"), extractTables);

export default router;
