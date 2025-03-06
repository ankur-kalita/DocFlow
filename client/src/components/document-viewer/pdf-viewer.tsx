import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File;
  extractedText?: string;
}

function PDFViewer({ file, extractedText: initialExtractedText }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [extractedText, setExtractedText] = useState<string>(initialExtractedText || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file && !initialExtractedText) {
      extractTextFromPDF();
    }
  }, [file, initialExtractedText]);

  const extractTextFromPDF = async () => {
    setExtractedText("");
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:5000/api/pdf/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setExtractedText(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPageNumber: number) => {
    setPageNumber(Math.max(1, Math.min(newPageNumber, numPages)));
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h2 className="text-lg font-bold">View PDF</h2>

      {/* PDF Preview */}
      {file && (
        <div className="mt-4">
          <Document 
            file={file} 
            onLoadSuccess={({ numPages }) => setNumPages(numPages)} 
            onLoadError={(error) => setError(error.message)}
            className="max-w-full"
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={false} 
              renderAnnotationLayer={false} 
              className="shadow-lg" 
            />
          </Document>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button 
              onClick={() => handlePageChange(pageNumber - 1)} 
              disabled={pageNumber <= 1} 
              variant="outline" 
              size="icon"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>Page {pageNumber} of {numPages}</span>
            <Button 
              onClick={() => handlePageChange(pageNumber + 1)} 
              disabled={pageNumber >= numPages} 
              variant="outline" 
              size="icon"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Extracted Text Output */}
      {loading && <p className="text-blue-500 mt-4">Processing file...</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {extractedText && (
        <div className="mt-4 p-4 bg-gray-100 border rounded w-full max-w-3xl">
          <h3 className="font-semibold">Extracted Text:</h3>
          <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-60">{extractedText}</pre>
        </div>
      )}
    </div>
  );
}

export default PDFViewer;
