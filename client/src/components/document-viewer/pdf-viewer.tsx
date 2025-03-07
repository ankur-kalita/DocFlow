import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File;
  extractedText?: string;
}

interface TableMerge {
  row: number;
  col: number;
  width: number;
  height: number;
}

interface PageData {
  page: number;
  tables: string[][];
  merges?: Record<string, TableMerge>;
  merge_alias?: Record<string, string>;
  width?: number;
  height?: number;
}

function PDFViewer({ file, extractedText: initialExtractedText }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [extractedText, setExtractedText] = useState<string>(initialExtractedText || "");
  const [extractedTables, setExtractedTables] = useState<PageData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const extractTextFromPDF = async () => {
      setExtractedText("");
      setExtractedTables([]);
      setError(null);
      setLoading(true);
      
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/pdf/upload`, {
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
        console.log('Tables data structure:', data.tables);

        setExtractedText(data.text);
        if (data.tables) {
          setExtractedTables(data.tables);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };
    
    if (file && !initialExtractedText) {
      extractTextFromPDF();
    }
  }, [file, initialExtractedText]);

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

      {/* Extracted Tables Output */}
      {extractedTables.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 border rounded w-full max-w-3xl">
          <h3 className="font-semibold">Extracted Tables:</h3>
          {extractedTables.map((pageData, pageIndex) => (
            <div key={pageIndex} className="mb-6">
              <h4 className="font-medium mb-2">Page {pageData.page}</h4>
              {pageData.tables && Array.isArray(pageData.tables) && (
                <div className="space-y-4">
                  {pageData.tables.filter(row => row.some(cell => cell.trim() !== '')).map((row, rowIndex) => (
                    <div key={rowIndex} className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300">
                        <tbody>
                          <tr>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="border border-gray-300 p-2 text-sm">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PDFViewer;
