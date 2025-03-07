import fs from "fs-extra";
import pdfParse from "pdf-parse";
import PDFTableExtractor from "pdf-table-extractor";
import { PdfReader } from "pdfreader";
import Tesseract from "tesseract.js";
import sharp from "sharp";
import { exec } from "child_process";
import path from "path";


// Convert PDF to images using MuPDF's mutool
const convertPdfToImages = async (pdfPath, outputDir) => {
  return new Promise((resolve, reject) => {
    const command = `mutool draw -o ${outputDir}/page-%d.png ${pdfPath}`;
    exec(command, (error) => {
      if (error) {
        console.error("Error converting PDF to images:", error);
        return reject(error);
      }
      fs.readdir(outputDir, (err, files) => {
        if (err) return reject(err);
        const imagePaths = files
          .filter(file => file.endsWith(".png"))
          .map(file => path.join(outputDir, file));
        resolve(imagePaths);
      });
    });
  });
};

// Process images and run OCR
const extractTextWithOCR = async (pdfPath) => {
  const outputDir = "./temp_images";
  await fs.ensureDir(outputDir); // Ensure the directory exists

  try {
    console.log("Converting PDF to images for OCR...");
    const imagePaths = await convertPdfToImages(pdfPath, outputDir);

    let extractedText = "";
    for (const imagePath of imagePaths) {
      console.log(`Processing OCR for ${imagePath}`);
      
      // Convert to grayscale and preprocess for better OCR accuracy
      const processedImage = await sharp(imagePath)
        .grayscale()
        .toBuffer();

      const { data } = await Tesseract.recognize(processedImage, "eng", {
        logger: (m) => console.log(m),
      });

      extractedText += data.text + "\n\n";
    }

    console.log("OCR Extraction Complete.");
    return extractedText.trim();
  } catch (err) {
    console.error("OCR extraction failed:", err);
    return "";
  } finally {
    await fs.remove(outputDir); // Clean up temp files
  }
};

export const extractTables = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const pdfBuffer = fs.readFileSync(req.file.path);
    const textData = await pdfParse(pdfBuffer);
    let extractedText = textData.text.trim();
    
    console.log("Extracted text from pdf-parse:", extractedText);

    // If pdf-parse extracted empty or useless text, use OCR as a fallback
    if (!extractedText || extractedText.length < 10) {
      console.log("Fallback to OCR...");
      extractedText = await extractTextWithOCR(req.file.path);
    }

    // Try extracting tables
    try {
      PDFTableExtractor(req.file.path, (result) => {
        res.status(200).json({
          text: extractedText,
          tables: result.pageTables,
        });
      }, (error) => {
        console.error("Table extraction failed:", error);
        fallbackExtraction(req.file.path, extractedText, res);
      });
    } catch (extractError) {
      console.error("Primary extraction failed:", extractError.message);
      fallbackExtraction(req.file.path, extractedText, res);
    }
  } catch (error) {
    console.error("Error processing PDF:", error.message);
    res.status(500).json({
      message: "Failed to process the PDF file",
      error: error.message,
    });
  } finally {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};

// Fallback extraction method using pdfreader
const fallbackExtraction = (filePath, extractedText, res) => {
  const rows = {};
  const pages = [];
  let currentPage = 1;

  new PdfReader().parseFileItems(filePath, (err, item) => {
    if (err) {
      console.error("Error in fallback extraction:", err);
      return res.status(200).json({
        text: extractedText,
        tables: [],
        message: "Used fallback extraction but encountered errors",
      });
    }

    if (!item) {
      // End of file, send the response
      const pageTables = [];

      pages.forEach(pageNum => {
        const pageRows = [];
        Object.keys(rows)
          .filter(key => parseInt(key.split('-')[0]) === pageNum)
          .sort((a, b) => {
            const [aPage, aRow, aCol] = a.split('-').map(Number);
            const [bPage, bRow, bCol] = b.split('-').map(Number);
            return aRow - bRow || aCol - bCol;
          })
          .forEach(key => {
            const [page, row, col] = key.split('-').map(Number);
            if (!pageRows[row]) pageRows[row] = [];
            pageRows[row][col] = rows[key];
          });

        const tableRows = [];
        let lastRowIndex = -1;

        pageRows.forEach((row, i) => {
          if (row && row.some(cell => cell && cell.trim())) {
            const filledRow = [];
            for (let j = 0; j < (row.length || 0); j++) {
              filledRow[j] = row[j] || '';
            }
            tableRows.push(filledRow);
            lastRowIndex = i;
          }
        });

        if (tableRows.length > 0) {
          pageTables.push({
            page: pageNum,
            tables: tableRows,
            width: Math.max(...tableRows.map(row => row.length)),
            height: lastRowIndex + 1
          });
        }
      });

      return res.status(200).json({
        text: extractedText,
        tables: pageTables,
        message: "Used fallback extraction method",
      });
    }

    if (item.page) {
      currentPage = item.page;
      if (!pages.includes(currentPage)) {
        pages.push(currentPage);
      }
    }

    if (item.text) {
      const rowIndex = Math.floor(item.y || 0);
      const colIndex = Math.floor(item.x || 0);
      const key = `${currentPage}-${rowIndex}-${colIndex}`;
      rows[key] = item.text;
    }
  });
};
