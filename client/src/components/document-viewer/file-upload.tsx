import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

// interface UploadedFileData {
//   // Define the expected structure of the data here
//   text: string;
//   // Add other properties as needed
// }

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
}

export function FileUpload({ onFileSelect, accept }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      setUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("http://localhost:5000/api/pdf/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Secure endpoint
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error("File upload failed. Please try again.");
        }

        const data = await response.json();
        onFileSelect(data); // Pass extracted data to parent component
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setUploading(false);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
  });

  return (
    <div className="flex flex-col items-center">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-200 hover:border-indigo-500 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className={`mx-auto h-12 w-12 ${isDragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
        <p className={`mt-4 text-sm ${isDragActive ? 'text-indigo-600' : 'text-gray-600'}`}>
          {isDragActive ? (
            'Drop the file here'
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
