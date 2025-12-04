# AI Document Vault

A full-stack web application that allows users to upload documents and uses Google's Gemini AI to generate intelligent summaries and formatted markdown versions.

## Features

- **Multi-format Support**: Upload PDF, DOCX, DOC, TXT, and Markdown files
- **AI-Powered Processing**: Automatic text extraction and summarization using Google Gemini 2.0 Flash
- **Real-time Status Updates**: Live processing status with visual indicators
- **Dual View Mode**: View both AI-generated summaries and formatted markdown content
- **Drag & Drop Upload**: Intuitive file upload interface
- **Document Management**: View, manage, and delete uploaded documents

## Tech Stack

### Frontend
- React 19 with Vite
- Custom CSS with dark theme
- react-markdown for content rendering

### Backend
- Node.js with Express 5
- Multer for file uploads
- Google Generative AI (Gemini)
- pdf-parse for PDF extraction
- Mammoth for DOCX/DOC parsing

## Prerequisites

- Node.js (v18.0.0 or higher)
- npm
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vault-ai
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

Start the backend server:

```bash
npm start
```

The server will run on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend/vault-ai
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`.

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`.

## Project Structure

```
vault-ai/
├── frontend/
│   └── vault-ai/
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── css/            # Component stylesheets
│       │   ├── hoc/            # Higher-order components
│       │   ├── pages/          # Page components
│       │   ├── services/       # API service layer
│       │   └── App.jsx         # Main application component
│       └── package.json
│
├── backend/
│   ├── services/
│   │   ├── ai.js               # Gemini AI integration
│   │   ├── textExtractor.js    # Document text extraction
│   │   └── storage.js          # Document metadata storage
│   ├── data/                   # JSON data storage
│   ├── uploads/                # Uploaded files directory
│   ├── app.js                  # Express app configuration
│   ├── server.js               # Server entry point
│   └── package.json
│
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | Health check |
| POST | `/api/documents/upload` | Upload a document |
| GET | `/api/documents` | Get all documents |
| GET | `/api/documents/:id` | Get a specific document |
| DELETE | `/api/documents/:id` | Delete a document |

## Architecture & Design Choices

### Monorepo Structure
The project uses a monorepo approach with separate `frontend` and `backend` directories. This keeps related code together while maintaining clear separation of concerns, making it easy to develop and deploy independently.

### Asynchronous Processing
Document processing happens asynchronously in the background. When a file is uploaded, the API immediately returns a response with a "processing" status. The frontend polls for updates every 2 seconds until processing completes. This approach:
- Provides immediate feedback to users
- Prevents request timeouts for large documents
- Allows the UI to remain responsive

### JSON-Based Storage
For simplicity and rapid development, document metadata is stored in a local JSON file (`backend/data/documents.json`). This eliminates the need for database setup while still providing persistence. For production use, this could be replaced with a database like PostgreSQL or MongoDB.

### Component-Based Frontend
The React frontend follows a modular component architecture:
- **Components**: Small, reusable UI elements (Button, Card, Spinner, etc.)
- **HOC (Higher-Order Components)**: Larger composite components with business logic (Sidebar, DocumentViewer, UploadZone)
- **Pages**: Full page layouts
- **Services**: API communication abstracted into a dedicated layer

### Text Extraction Strategy
Different document types require different parsing libraries:
- **PDF**: Uses `pdf-parse` for text extraction
- **DOCX/DOC**: Uses `mammoth` for Word document conversion
- **TXT/MD**: Direct file reading

This modular approach in `textExtractor.js` makes it easy to add support for additional formats.

### AI Integration
The Gemini AI integration (`services/ai.js`) sends extracted text with a structured prompt requesting JSON output containing both a summary and formatted markdown. This provides:
- Concise summaries for quick document overview
- Rich markdown formatting for detailed reading
- Consistent output structure for frontend rendering

### Error Handling
The application implements comprehensive error handling:
- File validation (type and size) at upload
- Graceful handling of text extraction failures
- AI processing error capture and display
- Frontend error states with user-friendly messages

## Available Scripts

### Backend
- `npm start` - Start the server with nodemon (auto-reload on changes)

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Configuration

### File Upload Limits
- Maximum file size: 10MB
- Supported formats: PDF, DOCX, DOC, TXT, MD

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `PORT` | Backend server port | 5000 |

## License

MIT
