import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import { LoginForm } from "./components/auth/login-form";
import { Dashboard } from "./pages/dashboard";
import PDFViewer from "./components/document-viewer/pdf-viewer";
import DocxViewer from "./components/document-viewer/docx-viewer";
import { FileUpload } from "./components/document-viewer/file-upload";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PDFViewerWrapper() {
  const location = useLocation();
  const file = location.state?.file as File;
  const extractedText = location.state?.extractedText || "";

  return file ? <PDFViewer file={file} extractedText={extractedText} /> : <Navigate to="/upload" />;
}

function DocxViewerWrapper() {
  const location = useLocation();
  const file = location.state?.file as File;

  return file ? <DocxViewer file={file} /> : <Navigate to="/upload" />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/login"
            element={
              <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <LoginForm />
              </div>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/upload" element={<FileUpload />} />
          <Route
            path="/pdf-viewer"
            element={
              <PrivateRoute>
                <PDFViewerWrapper />
              </PrivateRoute>
            }
          />
          <Route
            path="/docx-editor"
            element={
              <PrivateRoute>
                <DocxViewerWrapper />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
