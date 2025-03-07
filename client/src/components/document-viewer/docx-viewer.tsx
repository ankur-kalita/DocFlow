import React, { useState, useEffect, useRef } from "react";
import { renderAsync } from "docx-preview";
import mammoth from "mammoth";

interface DocxViewerProps {
  file: File;
}

function DocxViewer({ file }: DocxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocx = async () => {
      if (!file) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // For preview
        if (containerRef.current) {
          await renderAsync(file, containerRef.current);
        }
        
        // For editing (convert to HTML)
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtmlContent(result.value);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    loadDocx();
  }, [file]);

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold">DOCX Viewer & Editor</h2>
      
      {loading && <p>Loading document...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="mt-4">
        <h3 className="font-semibold">Preview:</h3>
        <div ref={containerRef} className="border p-4 min-h-[400px]"></div>
      </div>
      
      {htmlContent && (
        <div className="mt-4">
          <h3 className="font-semibold">Edit:</h3>
          <div 
            className="border p-4 min-h-[400px]" 
            contentEditable={true}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          ></div>
          <button 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => {
              // Implement save functionality here
              alert("Save functionality to be implemented");
            }}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

export default DocxViewer;
