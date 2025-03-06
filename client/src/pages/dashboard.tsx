import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { FileText, LogOut, Upload, Eye } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/document-viewer/file-upload';
import PDFViewer from '@/components/document-viewer/pdf-viewer';

export function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                Document Manager
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="flex w-full space-x-4 rounded-xl bg-gray-100 p-1">
            <TabsTrigger
              value="upload"
              className="flex-1 flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm hover:bg-white/50"
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </TabsTrigger>
            <TabsTrigger
              value="view"
              className="flex-1 flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm hover:bg-white/50"
            >
              <Eye className="h-4 w-4" />
              View Document
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Document</h2>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept={{
                  'application/pdf': ['.pdf'],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                    ['.docx'],
                }}
              />
              {selectedFile && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-700 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Selected file: {selectedFile.name}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="view">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              {selectedFile ? (
                <PDFViewer file={selectedFile} />
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No document selected</p>
                  <p className="text-sm text-gray-500">
                    Please upload a document first from the Upload Document tab
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}