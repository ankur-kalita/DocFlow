---

# 📄 Document Processing Application

A modern web-based **Document Management System** that enables users to **upload, view, edit, and extract data** from **PDF** and **DOCX** files.

## 🚀 Features

✅ **Document Management**
- Upload and preview PDF & DOCX files
- Edit and save DOCX documents
- Extract text and tables from PDFs

✅ **User Authentication**
- Secure login and registration
- JWT-based authentication for API access

✅ **Advanced Processing**
- PDF-to-text extraction using `pdf-parse`
- Table extraction with `pdf-table-extractor`
- DOCX rendering with `docx-preview`
- Seamless file handling with `mammoth.js` and `html-to-docx`

✅ **User Experience**
- Intuitive drag-and-drop upload
- Page navigation in PDF viewer
- Real-time text editing in DOCX editor
- Responsive design for all devices

---

## 🛠️ Tech Stack

### **Frontend**
- **React** (with TypeScript) – UI & state management
- **Vite** – Fast development tooling
- **Tailwind CSS** – Modern styling
- **react-pdf** – PDF rendering
- **docx-preview** – DOCX visualization
- **mammoth.js** – DOCX-to-HTML conversion
- **html-to-docx** – HTML-to-DOCX conversion
- **file-saver** – Client-side file saving
- **react-dropzone** – Drag & drop file uploads

### **Backend**
- **Node.js** – Server runtime
- **Express.js** – API framework
- **MongoDB** – Database storage (for user authentication & document metadata)
- **Multer** – File upload middleware
- **pdf-parse** – Extract text from PDFs
- **pdf-table-extractor** – Parse tables from PDFs
- **pdfreader** – Fallback for text extraction

---

## 🔧 Installation & Setup

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/ankur-kalita/DocFlow
cd DocFlow
```

### **2️⃣ Install Dependencies**
```bash
npm install
```

### **3️⃣ Configure Environment Variables**
Create a `.env` file in the root directory:
```
VITE_API_BASE_URL=http://localhost:5000
```

### **4️⃣ Start the Application**
```bash
npm run dev
```
The frontend should now be running at **[http://localhost:5173](http://localhost:5173)**.

### **5️⃣ Start the Backend**
Navigate to the `server/` directory:
```bash
cd server
npm install
npm start
```
The backend API should now be available at **[http://localhost:5000](http://localhost:5000/api/docs)**.

---

### **6️⃣ Configure Environment Variables**
Create a `.env` file in the root directory:
```
MONGO_URI
JWT_SECRET
PORT

```

## 🔗 API Endpoints

| Method | Endpoint                | Description                  |
|--------|-------------------------|------------------------------|
| POST   | `/api/auth/register`     | User registration            |
| POST   | `/api/auth/login`        | User login                   |
| POST   | `/api/documents`         | Upload a new document        |
| GET    | `/api/documents`         | Retrieve all documents       |

For detailed API documentation, visit **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**.

* Using Postman to first register and then login and then sign in in the browser.

---


markdown
## ⚠️ Warning: ENOENT Error in `pdf-parse`

If you encounter the following error during deployment or execution:


Error: ENOENT: no such file or directory, open './test/data/05-versions-space.pdf'
    at Object.openSync (node:fs:561:18)
    at Object.readFileSync (node:fs:445:35)
    at Object.<anonymous> (/opt/render/project/src/server/node_modules/pdf-parse/index.js:15:25)

### 🔍 **Solution**
1. **Go to the file** located at:
   
   server/node_modules/pdf-parse/index.js:15:25
   
2. **Modify the code** to disable the debug mode.  
   - Find the following block and either **comment it out** or **remove it**:

   ```js
   const Fs = require('fs');
   const Pdf = require('./lib/pdf-parse.js');

   module.exports = Pdf;

   let isDebugMode = false; // Set this to false to disable debug mode

   // Comment out or remove the debug code
   /*
   if (isDebugMode) {
       let PDF_FILE = './test/data/05-versions-space.pdf';
       let dataBuffer = Fs.readFileSync(PDF_FILE);
       Pdf(dataBuffer).then(function(data) {
           Fs.writeFileSync(`${PDF_FILE}.txt`, data.text, {
               encoding: 'utf8',
               flag: 'w'
           });
           debugger;
       }).catch(function(err) {
           debugger;
       });
   }
   */
   ```

3. **Save the file and restart your server.**  

### ✅ **Why This Fix Works?**
The error occurs because `pdf-parse` is trying to read a **test PDF file** that doesn't exist in the deployed environment.  
Disabling the debug mode prevents this unnecessary file access.

---

💡 If you still face issues, consider adding a **dummy PDF file** in the expected location:
```sh
mkdir -p test/data
touch test/data/05-versions-space.pdf
```

This ensures the file exists and prevents the error from occurring.

---
🚀 **Now, your project should run smoothly!** 🚀  


## 📂 Project Structure

### **Frontend (React)**
📂 `client/`
- `App.tsx` – Main application component
- `dashboard.tsx` – User dashboard
- `file-upload.tsx` – File upload component
- `pdf-viewer.tsx` – PDF viewer with text/table extraction
- `docx-viewer.tsx` – DOCX viewer & editor

### **Backend (Node.js + Express)**
📂 `server/`
- `server.js` – Entry point for API
- `controllers/` – Business logic (PDF & DOCX processing)
- `models/` – Database models (Users, Documents)
- `routes/` – API route definitions
- `uploads/` – Temporary storage for uploaded files

---

## 🔥 Key Features & Challenges Solved

### 📜 **PDF Processing**
- **Extracted Text**: Uses `pdf-parse` for text extraction.
- **Table Extraction**: Uses `pdf-table-extractor`, with a **fallback to `pdfreader`** for complex layouts.
- **Page Navigation**: Implemented with `react-pdf`.

### 📄 **DOCX Processing**
- **Editing**: Uses `contentEditable` div for inline editing.
- **Conversion**:
  - **DOCX → HTML**: `mammoth.js`
  - **HTML → DOCX**: `html-to-docx`
- **File Saving**: Uses `file-saver` for client-side downloads.

### 📂 **File Management**
- **Drag-and-Drop Upload**: `react-dropzone`
- **Optimized Handling**: Uses `URL.createObjectURL()` to improve performance instead of passing large files through React state.

---

## ⚠️ Assumptions & Limitations

1. **Max File Size**: 10MB per upload (to prevent performance issues).
2. **Authentication**: JWT-based authentication is required for document access.
3. **File Persistence**: Uploaded files are stored **temporarily** in `uploads/`.
4. **Browser Support**: Modern browsers with File API support (Chrome, Edge, Firefox).
5. **Backend Required**: The frontend expects a running Express API for file processing.

---

## 🚀 Future Enhancements

✅ **Optical Character Recognition (OCR)**
- Extract text from **scanned** PDFs using Tesseract.js.

✅ **Batch Processing**
- Enable **multiple file uploads** at once.

✅ **Cloud Storage Integration**
- Support **Google Drive, AWS S3, or Firebase** for storing documents.

✅ **Collaborative Editing**
- Implement **real-time editing** using WebSockets.

✅ **Advanced Search**
- Add **full-text search** for document content.

---

## 👨‍💻 Contributing

We welcome contributions! 🎉  
1. **Fork the repository**
2. **Create a new branch**
3. **Commit your changes**
4. **Submit a pull request**

For major changes, open an issue first to discuss the changes.

---


## 🏆 Credits

Thanks to the following open-source projects:
- **[pdf-parse](https://www.npmjs.com/package/pdf-parse)** for PDF text extraction.
- **[pdf-table-extractor](https://www.npmjs.com/package/pdf-table-extractor)** for table parsing.
- **[react-pdf](https://www.npmjs.com/package/react-pdf)** for rendering PDFs in the browser.
- **[mammoth.js](https://www.npmjs.com/package/mammoth)** for DOCX-to-HTML conversion.
- **[html-to-docx](https://www.npmjs.com/package/html-to-docx)** for saving DOCX files.
- **[react-dropzone](https://www.npmjs.com/package/react-dropzone)** for drag-and-drop file uploads.
- **[file-saver](https://www.npmjs.com/package/file-saver)** for client-side file downloads.

---

