# Zustand Upload Store Documentation

This documentation covers the complete file upload management system built with Zustand for the Frida application.

## Overview

The upload system provides:

- **State Management**: Centralized file upload state with Zustand
- **Progress Tracking**: Real-time upload progress monitoring
- **Error Handling**: Comprehensive error management and recovery
- **Queue Management**: Upload queue with batch processing capabilities
- **Custom Hooks**: Easy-to-use React hooks for components
- **Type Safety**: Full TypeScript support

## Quick Start

```typescript
import { useUpload } from "../hooks/use-upload";

function MyComponent() {
  const { files, addFiles, uploadAllPending, isUploading, totalProgress } =
    useUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    addFiles(selectedFiles);
  };

  const handleUpload = async () => {
    await uploadAllPending();
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileSelect} />
      <button onClick={handleUpload} disabled={isUploading}>
        Upload Files ({files.length})
      </button>
      {isUploading && <div>Progress: {totalProgress}%</div>}
    </div>
  );
}
```

## Core Components

### 1. Upload Store (`stores/upload-store.ts`)

The main Zustand store that manages all upload-related state.

#### State Structure

```typescript
interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  uploadedUrl?: string;
  createdAt: Date;
}

interface UploadState {
  files: UploadFile[];
  isUploading: boolean;
  uploadQueue: string[];
  totalProgress: number;
  errors: Record<string, string>;
  showUploadProgress: boolean;
  showSuccessMessage: boolean;
  lastUploadedFile?: UploadFile;
}
```

#### Key Actions

- `addFiles(files: File[])` - Add files to the store
- `removeFile(fileId: string)` - Remove a specific file
- `clearAllFiles()` - Clear all files
- `updateFileProgress(fileId: string, progress: number)` - Update upload progress
- `setFileStatus(fileId: string, status: UploadFile['status'])` - Set file status

### 2. Upload Service (`services/upload-service.ts`)

Handles the actual file uploads with XMLHttpRequest for progress tracking.

#### Configuration

```typescript
interface UploadConfig {
  endpoint: string; // '/api/upload'
  method?: "POST" | "PUT"; // 'POST'
  fieldName?: string; // 'file'
  maxFileSize?: number; // 50MB
  allowedTypes?: string[]; // ['image/*', 'video/*', ...]
  timeout?: number; // 30000ms
  headers?: Record<string, string>; // Custom headers
}
```

#### Key Functions

- `uploadFile(fileId, file, config?)` - Upload single file
- `uploadFiles(fileIds, config?)` - Upload multiple files sequentially
- `uploadAllPendingFiles(config?)` - Upload all pending files
- `batchUpload(fileIds, config?, concurrency?)` - Concurrent uploads
- `retryUpload(fileId, config?)` - Retry failed upload
- `validateFile(file, config?)` - Validate file before upload

### 3. Custom Hooks (`hooks/use-upload.ts`)

#### Main Hook: `useUpload()`

Provides complete upload functionality:

```typescript
const {
  // State
  files,
  isUploading,
  totalProgress,
  errors,

  // File Management
  addFiles,
  removeFile,
  clearAllFiles,

  // Upload Actions
  uploadFile,
  uploadAllPending,
  retryUpload,

  // UI State
  showUploadProgress,
  setShowUploadProgress,
} = useUpload();
```

#### Specialized Hooks

**File-Specific Operations:**

```typescript
const { file, error, formattedSize, updateProgress, setStatus, remove } =
  useUploadFile(fileId);
```

**Filtered File Lists:**

```typescript
const { pendingFiles, uploadingFiles, completedFiles, errorFiles } =
  useFilteredFiles();
```

**Upload Statistics:**

```typescript
const {
  total,
  completed,
  errors,
  completionPercentage,
  totalSizeFormatted,
  isComplete,
} = useUploadStats();
```

**Drag & Drop:**

```typescript
const { handleDrop, handleFileInput } = useUploadDropzone();
```

## Usage Examples

### Basic File Upload

```typescript
function FileUploader() {
  const { addFiles, uploadAllPending, files, isUploading } = useUpload();

  const handleFiles = (selectedFiles: File[]) => {
    addFiles(selectedFiles);
  };

  const startUpload = async () => {
    const config = {
      endpoint: "/api/upload",
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ["image/*"],
    };

    await uploadAllPending(config);
  };

  return (
    <div>
      <FileDropzone onFilesAdded={handleFiles} />
      <FileList files={files} />
      <button onClick={startUpload} disabled={isUploading}>
        Upload {files.length} files
      </button>
    </div>
  );
}
```

### Upload Progress Display

```typescript
function UploadProgressBar() {
  const { totalProgress, isUploading, showUploadProgress } =
    useUploadProgress();

  if (!showUploadProgress) return null;

  return (
    <div className="upload-progress">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${totalProgress}%` }} />
      </div>
      <span>{totalProgress}%</span>
      {isUploading && <span>Uploading...</span>}
    </div>
  );
}
```

### File List with Individual Progress

```typescript
function FileListItem({ fileId }: { fileId: string }) {
  const { file, error, formattedSize, remove } = useUploadFile(fileId);

  if (!file) return null;

  const getStatusColor = () => {
    switch (file.status) {
      case "pending":
        return "gray";
      case "uploading":
        return "blue";
      case "completed":
        return "green";
      case "error":
        return "red";
    }
  };

  return (
    <div className="file-item">
      <span>{file.name}</span>
      <span>{formattedSize}</span>
      <div className="status" style={{ color: getStatusColor() }}>
        {file.status} {file.progress > 0 && `${file.progress}%`}
      </div>
      {error && <div className="error">{error}</div>}
      <button onClick={remove}>Remove</button>
    </div>
  );
}
```

### Error Handling

```typescript
function UploadErrorHandler() {
  const { errorFiles } = useFilteredFiles();
  const { retryUpload } = useUpload();

  const handleRetry = async (fileId: string) => {
    await retryUpload(fileId);
  };

  if (errorFiles.length === 0) return null;

  return (
    <div className="error-panel">
      <h3>Upload Errors ({errorFiles.length})</h3>
      {errorFiles.map((file) => (
        <div key={file.id} className="error-item">
          <span>
            {file.name}: {file.error}
          </span>
          <button onClick={() => handleRetry(file.id)}>Retry</button>
        </div>
      ))}
    </div>
  );
}
```

### Drag & Drop Integration

```typescript
function DropzoneComponent() {
  const { handleDrop, handleFileInput } = useUploadDropzone();
  const [isDragOver, setIsDragOver] = useState(false);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleDrop(files);
  };

  return (
    <div
      className={`dropzone ${isDragOver ? "drag-over" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <p>Drag files here or click to select</p>
      <input
        type="file"
        multiple
        onChange={handleFileInput}
        style={{ display: "none" }}
        id="file-input"
      />
      <label htmlFor="file-input" className="file-button">
        Choose Files
      </label>
    </div>
  );
}
```

## Integration with Existing Components

### Updating Upload Progress Component

```typescript
// Update existing components/upload-progress.tsx
import {
  useUploadProgress,
  useUploadSuccessMessage,
} from "../hooks/use-upload";

const UploadProgress: React.FC = () => {
  const { totalProgress, isUploading, showUploadProgress } =
    useUploadProgress();
  const { lastUploadedFile } = useUploadSuccessMessage();

  if (!showUploadProgress) return null;

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md mx-auto border rounded-lg shadow-md bg-f5f9fd flex flex-col items-center">
        <div className="p-8">
          <div className="flex justify-center items-center mb-4">
            <FaRocket className="text-7xl text-blue-500" />
          </div>
          <div className="flex justify-center items-center space-x-1 mb-2">
            {Array.from({ length: 15 }).map((_, index) => (
              <div
                key={index}
                className={`h-1 w-3 ${
                  index < Math.floor((totalProgress / 100) * 15)
                    ? "bg-blue-700"
                    : "bg-blue-300"
                }`}
              />
            ))}
          </div>
          <h2 className="text-center text-lg font-semibold">
            Subiendo ({totalProgress}%)
          </h2>
          {lastUploadedFile && (
            <p className="text-center text-gray-700">
              {lastUploadedFile.name} - {formatFileSize(lastUploadedFile.size)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
```

## API Integration

The upload service expects your backend API to:

1. **Accept multipart/form-data** with file field
2. **Return JSON response**:
   ```json
   {
     "success": true,
     "url": "https://example.com/uploaded-file.jpg",
     "message": "File uploaded successfully"
   }
   ```
3. **Handle progress** (automatic with XMLHttpRequest)
4. **Return errors**:
   ```json
   {
     "success": false,
     "error": "File too large"
   }
   ```

## Best Practices

1. **Configure upload limits** appropriate for your use case
2. **Validate files** before adding to store
3. **Handle errors gracefully** with retry mechanisms
4. **Use batch uploads** for better performance
5. **Clean up completed files** periodically
6. **Provide visual feedback** during uploads
7. **Test with different file types and sizes**

## Advanced Features

### Custom Upload Configuration

```typescript
const customConfig: UploadConfig = {
  endpoint: "/api/media/upload",
  method: "POST",
  fieldName: "media",
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: ["image/*", "video/mp4", "video/quicktime"],
  timeout: 60000, // 1 minute
  headers: {
    Authorization: "Bearer " + token,
    "X-Upload-Source": "web-app",
  },
};
```

### Concurrent Uploads

```typescript
const { batchUpload } = useUpload();

// Upload up to 3 files simultaneously
await batchUpload(fileIds, config, {}, 3);
```

### Upload Queue Management

```typescript
const { addToQueue, uploadQueue, clearQueue } = useUpload();

// Add specific files to queue
fileIds.forEach((id) => addToQueue(id));

// Process queue
await uploadFiles(uploadQueue);
```

This system provides a robust, type-safe, and user-friendly file upload solution that integrates seamlessly with your existing React components and can be easily customized for different use cases.
