import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FileUploadProps {
  accept?: Record<string, string[]>; // Allow custom accepted file types
}

export function FileUpload({ accept }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Validate file size
    if (file.size > MAX_SIZE) {
      setError("File size exceeds the maximum limit of 10MB.");
      return;
    }

    setUploading(true);
    setError(null);

    const fileType = file.name.split(".").pop()?.toLowerCase();

    // If it's a PDF, upload it to the API
    if (fileType === "pdf") {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/pdf/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to upload file.");
        }

        const data = await response.json();
        navigate("/pdf-viewer", { state: { file, extractedText: data.text } });
      } catch (err) {
        setError((err as Error).message || "An unknown error occurred.");
      } finally {
        setUploading(false);
      }
    }
    // If it's a DOCX, just navigate without API processing
    else if (fileType === "docx") {
      navigate("/docx-editor", { state: { file } });
    } else {
      setError("Unsupported file type. Please upload a PDF or DOCX file.");
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: accept || { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
  });

  return (
    <div className="flex flex-col items-center">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-200 hover:border-indigo-500 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className={`mx-auto h-12 w-12 ${isDragActive ? "text-indigo-500" : "text-gray-400"}`} />
        <p className={`mt-4 text-sm ${isDragActive ? "text-indigo-600" : "text-gray-600"}`}>
          {isDragActive ? (
            "Drop the file here"
          ) : (
            <>
              <span className="font-semibold">Click to upload</span> or drag and drop
              <br />
              <span className="text-gray-500">PDF or DOCX (max 10MB)</span>
            </>
          )}
        </p>
      </div>

      {uploading && <p className="mt-2 text-sm text-blue-500">Uploading...</p>}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
