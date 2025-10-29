import { AnalysisResult, UploadedFile, useUploadStore } from '../stores/upload-store';

// Configuration interface for upload service
export interface UploadConfig {
  endpoint: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  fieldName?: string; // Form field name for the file
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  timeout?: number; // in milliseconds
  chunkSize?: number; // for chunked uploads
}

// Default configuration
const defaultConfig: UploadConfig = {
  endpoint: '/api/upload',
  method: 'POST',
  fieldName: 'file',
  maxFileSize: 2 * 1024 * 1024, // 50MB
  allowedTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*'],
  timeout: 30000, // 30 seconds
};

// Upload response interface
export interface UploadResponse {
  analysisResult?: string;
  error?: string;
  url?: string;
  success?: boolean;
}

// Upload progress callback type
export type ProgressCallback = (progress: number) => void;

// File validation utility
export const validateFile = (file: File, config: UploadConfig = defaultConfig): { valid: boolean; error?: string } => {
  // Check file size
  if (config.maxFileSize && file.size > config.maxFileSize) {
    const maxSizeMB = (config.maxFileSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `El archivo es demasiado grande. Tamaño máximo permitido: ${maxSizeMB}MB`,
    };
  }

  // Check file type
  if (config.allowedTypes && config.allowedTypes.length > 0) {
    const isAllowed = config.allowedTypes.some(allowedType => {
      if (allowedType.endsWith('/*')) {
        const baseType = allowedType.slice(0, -2);
        return file.type.startsWith(baseType);
      }
      return file.type === allowedType;
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido. Tipos permitidos: ${config.allowedTypes.join(', ')}`,
      };
    }
  }

  return { valid: true };
};

// Create FormData for file upload
const createFormData = (file: File, fieldName: string = 'file', additionalData?: Record<string, unknown>): FormData => {
  const formData = new FormData();
  formData.append(fieldName, file);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
    });
  }

  return formData;
};

// Upload a single file with progress tracking
export const uploadFile = async (
  fileId: string,
  file: File,
  config: UploadConfig = defaultConfig,
  additionalData?: Record<string, unknown>
): Promise<UploadResponse> => {
  const store = useUploadStore.getState();

  try {
    // Validate file
    const validation = validateFile(file, config);
    if (!validation.valid) {
      store.setFileStatus(fileId, 'error', validation.error);
      return {
        success: false,
        error: validation.error,
      };
    }

    // Set status to uploading
    store.setFileStatus(fileId, 'uploading');
    store.setIsUploading(true);

    // Create FormData
    const formData = createFormData(file, config.fieldName, additionalData);

    // Create XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();

    return new Promise<UploadResponse>((resolve, reject) => {
      // Upload progress handler
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          store.updateFileProgress(fileId, progress);
        }
      });

      // Upload completion handler
      xhr.addEventListener('load', () => {
        try {
          const response: UploadResponse = JSON.parse(xhr.responseText);
          
          if (xhr.status >= 200 && xhr.status < 300 ) {
            store.setFileStatus(fileId, 'completed');
            store.updateFileProgress(fileId, 100);
            
            if (response.analysisResult) {
              store.setFileUploadedUrl(fileId, response.analysisResult);
            }

            // Set as last uploaded file and show success message
            const uploadedFile = store.files.find(f => f.id === fileId);
            if (uploadedFile) {
              store.setLastUploadedFile({ ...uploadedFile, uploadedUrl: response.url });
              store.setShowSuccessMessage(true);
            }

            resolve(response);
          } else {
            const error = response.error || `Error del servidor: ${xhr.status}`;
            store.setFileStatus(fileId, 'error', error);
            resolve({
              success: false,
              error,
            });
          }
        } catch (parseError) {
          const error = 'Error al procesar la respuesta del servidor';
          store.setFileStatus(fileId, 'error', error);
          resolve({
            success: false,
            error,
          });
        }
      });

      // Error handler
      xhr.addEventListener('error', () => {
        const error = 'Error de conexión durante la subida';
        store.setFileStatus(fileId, 'error', error);
        resolve({
          success: false,
          error,
        });
      });

      // Timeout handler
      xhr.addEventListener('timeout', () => {
        const error = 'Tiempo de espera agotado';
        store.setFileStatus(fileId, 'error', error);
        resolve({
          success: false,
          error,
        });
      });

      // Configure and send request
      xhr.open(config.method || 'POST', config.endpoint);
      
      if (config.timeout) {
        xhr.timeout = config.timeout;
      }

      // Set custom headers
      if (config.headers) {
        Object.entries(config.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      xhr.send(formData);
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido durante la subida';
    store.setFileStatus(fileId, 'error', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  } finally {
    // Check if all uploads are completed
    const currentState = useUploadStore.getState();
    const hasUploadingFiles = currentState.files.some(f => f.status === 'uploading');
    if (!hasUploadingFiles) {
      store.setIsUploading(false);
    }
  }
};

// Upload multiple files sequentially
export const uploadFiles = async (
  fileIds: string[],
  config: UploadConfig = defaultConfig,
  additionalData?: Record<string, unknown>
): Promise<UploadResponse[]> => {
  const store = useUploadStore.getState();
  const results: UploadResponse[] = [];

  store.setIsUploading(true);
  store.setShowUploadProgress(true);

  for (const fileId of fileIds) {
    const file = store.files.find(f => f.id === fileId);
    if (!file) {
      results.push({
        success: false,
        error: `Archivo con ID ${fileId} no encontrado`,
      });
      continue;
    }

    try {
      const result = await uploadFile(fileId, file.file, config, additionalData);
      results.push(result);

      // Small delay between uploads to prevent server overload
      if (fileIds.indexOf(fileId) < fileIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error durante la subida';
      results.push({
        success: false,
        error: errorMessage,
      });
    }
  }

  store.setIsUploading(false);
  
  // Hide progress after a delay if all uploads are complete
  setTimeout(() => {
    const currentState = useUploadStore.getState();
    const hasUploadingFiles = currentState.files.some(f => f.status === 'uploading');
    if (!hasUploadingFiles) {
      store.setShowUploadProgress(false);
    }
  }, 1000);

  return results;
};

// Upload all pending files
export const uploadAllPendingFiles = async (
  config: UploadConfig = defaultConfig,
  additionalData?: Record<string, unknown>
): Promise<UploadResponse[]> => {
  const store = useUploadStore.getState();
  const pendingFiles = store.files
    .filter(file => file.status === 'pending')
    .map(file => file.id);

  if (pendingFiles.length === 0) {
    return [];
  }

  return uploadFiles(pendingFiles, config, additionalData);
};

/**
 * Uploads an image as a base64 string to the specified endpoint via JSON POST.
**/
export const uploadBase64ImageFile = async (
  fileId: string,
  file: File,
  config: UploadConfig = {
    endpoint: 'http://localhost:5231/process-image',
    method: 'POST',
    headers: {
      'accept': '*/*',
      'Content-Type': 'application/json',
    },
    // Other config irrelevant for base64 upload removed
  },
): Promise<UploadResponse> => {
  const store = useUploadStore.getState();

  // Validate file as before
  const validation = validateFile(file, config);
  if (!validation.valid) {
    store.setFileStatus(fileId, 'error', validation.error);
    return {
      success: false,
      error: validation.error,
    };
  }

  store.setFileStatus(fileId, 'uploading');
  store.setIsUploading(true);

  // Helper: Convert file to base64 (returns a Promise)
  function fileToBase64(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove "data:<type>;base64," prefix if present
        const base64String = (reader.result as string).split(',')[1] ?? '';
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(f);
    });
  }

  try {
    const base64Image = await fileToBase64(file);

    // JSON Data
    const body = JSON.stringify({ base64Image });

    // Use fetch for JSON POST
    const response = await fetch(config.endpoint, {
      method: config.method || 'POST',
      headers: config.headers,
      body,
      // timeout option not supported in fetch, implement via AbortController if needed
    });

    const result: UploadResponse = await response.json();

    if (response.ok && result.analysisResult) {
      store.setFileStatus(fileId, 'completed');
      store.updateFileProgress(fileId, 100);
      
      const responseData = JSON.parse(result.analysisResult) as Record<string, unknown>;
      const currentFile = store.files.find(f => f.id === fileId);

      if (responseData && currentFile && responseData.format) {
        const newUploadFile: UploadedFile = {
          id: fileId,
          name: typeof responseData.name === 'string'
            ? responseData.name
            : (currentFile.name || 'unknown'),
          size: {
            width: responseData.width as number | null,
            height: responseData.height as number | null,
          },
          format: responseData.format as string,
          tags: responseData.tags as string[],
          author: responseData.author as string | null,
          date: responseData.date ? new Date(responseData.date as string) : null,
          upload_date: responseData.upload_date ? new Date(responseData.upload_date as string) : null,
          uncertain: responseData.uncertain as boolean,
          uploadedUrl: `data:image/jpeg;base64,${base64Image}`,
        };
        store.addUploadFile([newUploadFile]);
        store.setShowSuccessMessage(true);
      }
      
      return result;
    } else {
      const error = result.error || `Error del servidor: ${response.status}`;
      store.setFileStatus(fileId, 'error', error);
      return { success: false, error };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido durante la subida';
    store.setFileStatus(fileId, 'error', errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    const currentState = useUploadStore.getState();
    const hasUploadingFiles = currentState.files.some(f => f.status === 'uploading');
    if (!hasUploadingFiles) {
      store.setIsUploading(false);
    }
  }
};

// Cancel upload (note: this is a simple implementation, real cancellation would need xhr.abort())
export const cancelUpload = (fileId: string): void => {
  const store = useUploadStore.getState();
  store.setFileStatus(fileId, 'pending');
  store.updateFileProgress(fileId, 0);
  store.removeFromQueue(fileId);
};

// Retry failed upload
export const retryUpload = async (
  fileId: string,
  config: UploadConfig = defaultConfig,
  additionalData?: Record<string, unknown>
): Promise<UploadResponse> => {
  const store = useUploadStore.getState();
  const file = store.files.find(f => f.id === fileId);
  
  if (!file) {
    return {
      success: false,
      error: 'Archivo no encontrado',
    };
  }

  // Reset file status and progress
  store.setFileStatus(fileId, 'pending');
  store.updateFileProgress(fileId, 0);
  store.clearError(fileId);

  // Upload the file
  return uploadFile(fileId, file.file, config, additionalData);
};

// Batch upload utility with concurrency control
export const batchUpload = async (
  fileIds: string[],
  config: UploadConfig = defaultConfig,
  additionalData?: Record<string, unknown>,
  concurrency: number = 3
): Promise<UploadResponse[]> => {
  const store = useUploadStore.getState();
  const results: UploadResponse[] = [];
  
  store.setIsUploading(true);
  store.setShowUploadProgress(true);

  // Process files in chunks based on concurrency
  for (let i = 0; i < fileIds.length; i += concurrency) {
    const chunk = fileIds.slice(i, i + concurrency);
    
    const chunkPromises = chunk.map(async (fileId) => {
      const file = store.files.find(f => f.id === fileId);
      if (!file) {
        return {
          success: false,
          error: `Archivo con ID ${fileId} no encontrado`,
        };
      }

      return uploadFile(fileId, file.file, config, additionalData);
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
  }

  store.setIsUploading(false);
  
  setTimeout(() => {
    const currentState = useUploadStore.getState();
    const hasUploadingFiles = currentState.files.some(f => f.status === 'uploading');
    if (!hasUploadingFiles) {
      store.setShowUploadProgress(false);
    }
  }, 1000);

  return results;
};
