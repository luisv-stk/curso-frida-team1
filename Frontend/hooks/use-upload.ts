import { useCallback, useMemo } from 'react';
import { useUploadStore, UploadFile, formatFileSize } from '../stores/upload-store';
import { 
  uploadFile, 
  uploadFiles, 
  uploadBase64ImageFile,
  uploadAllPendingFiles, 
  retryUpload, 
  batchUpload,
  cancelUpload,
  UploadConfig,
  UploadResponse 
} from '../services/upload-service';

// Main hook for file upload functionality
export const useUpload = () => {
  const store = useUploadStore();

  // Upload actions with error handling
  const handleUploadFile = useCallback(async (
    fileId: string,
    file: File,
    config?: UploadConfig,
    additionalData?: Record<string, any>
  ): Promise<UploadResponse> => {
    try {
      return await uploadBase64ImageFile(fileId, file, config);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error during file upload';
      store.setError(fileId, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [store]);

  const handleUploadFiles = useCallback(async (
    fileIds: string[],
    config?: UploadConfig,
    additionalData?: Record<string, any>
  ): Promise<UploadResponse[]> => {
    try {
      return await uploadFiles(fileIds, config, additionalData);
    } catch (error) {
      console.error('Error uploading files:', error);
      return fileIds.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : 'Error during files upload',
      }));
    }
  }, []);

  const handleUploadAllPending = useCallback(async (
    config?: UploadConfig,
    additionalData?: Record<string, any>
  ): Promise<UploadResponse[]> => {
    try {
      return await uploadAllPendingFiles(config, additionalData);
    } catch (error) {
      console.error('Error uploading all pending files:', error);
      return [];
    }
  }, []);

  const handleRetryUpload = useCallback(async (
    fileId: string,
    config?: UploadConfig,
    additionalData?: Record<string, any>
  ): Promise<UploadResponse> => {
    try {
      return await retryUpload(fileId, config, additionalData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrying upload';
      store.setError(fileId, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [store]);

  const handleBatchUpload = useCallback(async (
    fileIds: string[],
    config?: UploadConfig,
    additionalData?: Record<string, any>,
    concurrency?: number
  ): Promise<UploadResponse[]> => {
    try {
      return await batchUpload(fileIds, config, additionalData, concurrency);
    } catch (error) {
      console.error('Error in batch upload:', error);
      return fileIds.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : 'Error during batch upload',
      }));
    }
  }, []);

  // File management actions
  const addFiles = useCallback((files: File[]) => {
    store.addFiles(files);
  }, [store]);

  const removeFile = useCallback((fileId: string) => {
    store.removeFile(fileId);
  }, [store]);

  const clearAllFiles = useCallback(() => {
    store.clearAllFiles();
  }, [store]);

  const clearCompletedFiles = useCallback(() => {
    store.clearCompletedFiles();
  }, [store]);

  // UI state management
  const setShowUploadProgress = useCallback((show: boolean) => {
    store.setShowUploadProgress(show);
  }, [store]);

  const setShowSuccessMessage = useCallback((show: boolean) => {
    store.setShowSuccessMessage(show);
  }, [store]);

  // Cancel upload
  const handleCancelUpload = useCallback((fileId: string) => {
    cancelUpload(fileId);
  }, []);

  return {
    // State
    files: store.files,
    isUploading: store.isUploading,
    uploadQueue: store.uploadQueue,
    totalProgress: store.totalProgress,
    errors: store.errors,
    showUploadProgress: store.showUploadProgress,
    showSuccessMessage: store.showSuccessMessage,
    lastUploadedFile: store.lastUploadedFile,

    // Actions
    addFiles,
    removeFile,
    clearAllFiles,
    clearCompletedFiles,
    setShowUploadProgress,
    setShowSuccessMessage,

    // Upload actions
    uploadFile: handleUploadFile,
    uploadFiles: handleUploadFiles,
    uploadBase64: uploadBase64ImageFile,
    uploadAllPending: handleUploadAllPending,
    retryUpload: handleRetryUpload,
    batchUpload: handleBatchUpload,
    cancelUpload: handleCancelUpload,

    // Store actions
    updateFileProgress: store.updateFileProgress,
    setFileStatus: store.setFileStatus,
    setFileUploadedUrl: store.setFileUploadedUrl,
    addToQueue: store.addToQueue,
    removeFromQueue: store.removeFromQueue,
    clearQueue: store.clearQueue,
    setIsUploading: store.setIsUploading,
    calculateTotalProgress: store.calculateTotalProgress,
    setLastUploadedFile: store.setLastUploadedFile,
    setError: store.setError,
    clearError: store.clearError,
    clearAllErrors: store.clearAllErrors,
    resetStore: store.resetStore,
  };
};

// Hook for file-specific operations
export const useUploadFile = (fileId: string) => {
  const store = useUploadStore();
  
  const file = useMemo(() => 
    store.files.find(f => f.id === fileId), 
    [store.files, fileId]
  );

  const error = useMemo(() => 
    store.errors[fileId], 
    [store.errors, fileId]
  );

  const isInQueue = useMemo(() => 
    store.uploadQueue.includes(fileId), 
    [store.uploadQueue, fileId]
  );

  const formattedSize = useMemo(() => 
    file ? formatFileSize(file.size) : '', 
    [file]
  );

  const updateProgress = useCallback((progress: number) => {
    store.updateFileProgress(fileId, progress);
  }, [store, fileId]);

  const setStatus = useCallback((status: UploadFile['status'], error?: string) => {
    store.setFileStatus(fileId, status, error);
  }, [store, fileId]);

  const setUploadedUrl = useCallback((url: string) => {
    store.setFileUploadedUrl(fileId, url);
  }, [store, fileId]);

  const addToQueue = useCallback(() => {
    store.addToQueue(fileId);
  }, [store, fileId]);

  const removeFromQueue = useCallback(() => {
    store.removeFromQueue(fileId);
  }, [store, fileId]);

  const remove = useCallback(() => {
    store.removeFile(fileId);
  }, [store, fileId]);

  return {
    file,
    error,
    isInQueue,
    formattedSize,
    updateProgress,
    setStatus,
    setUploadedUrl,
    addToQueue,
    removeFromQueue,
    remove,
  };
};

// Selector hooks for specific data
export const useUploadFiles = () => {
  return useUploadStore(state => state.files);
};

export const useUploadProgress = () => {
  return useUploadStore(state => ({
    totalProgress: state.totalProgress,
    isUploading: state.isUploading,
    showUploadProgress: state.showUploadProgress,
  }));
};

export const useUploadErrors = () => {
  return useUploadStore(state => state.errors);
};

export const useUploadQueue = () => {
  return useUploadStore(state => state.uploadQueue);
};

export const useUploadSuccessMessage = () => {
  return useUploadStore(state => ({
    showSuccessMessage: state.showSuccessMessage,
    lastUploadedFile: state.lastUploadedFile,
  }));
};

// Hook for filtered file lists
export const useFilteredFiles = () => {
  const files = useUploadFiles();

  const pendingFiles = useMemo(() => 
    files.filter(file => file.status === 'pending'), 
    [files]
  );

  const uploadingFiles = useMemo(() => 
    files.filter(file => file.status === 'uploading'), 
    [files]
  );

  const completedFiles = useMemo(() => 
    files.filter(file => file.status === 'completed'), 
    [files]
  );

  const errorFiles = useMemo(() => 
    files.filter(file => file.status === 'error'), 
    [files]
  );

  return {
    allFiles: files,
    pendingFiles,
    uploadingFiles,
    completedFiles,
    errorFiles,
  };
};

// Hook for upload statistics
export const useUploadStats = () => {
  const files = useUploadFiles();
  const { totalProgress, isUploading } = useUploadProgress();

  const stats = useMemo(() => {
    const total = files.length;
    const pending = files.filter(f => f.status === 'pending').length;
    const uploading = files.filter(f => f.status === 'uploading').length;
    const completed = files.filter(f => f.status === 'completed').length;
    const errors = files.filter(f => f.status === 'error').length;

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const uploadedSize = files
      .filter(f => f.status === 'completed')
      .reduce((sum, file) => sum + file.size, 0);

    return {
      total,
      pending,
      uploading,
      completed,
      errors,
      totalSize,
      uploadedSize,
      totalSizeFormatted: formatFileSize(totalSize),
      uploadedSizeFormatted: formatFileSize(uploadedSize),
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      hasErrors: errors > 0,
      isComplete: total > 0 && completed === total,
      isEmpty: total === 0,
    };
  }, [files]);

  return {
    ...stats,
    totalProgress,
    isUploading,
  };
};

// Hook for drag and drop functionality
export const useUploadDropzone = () => {
  const { addFiles } = useUpload();

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      addFiles(acceptedFiles);
    }
  }, [addFiles]);

  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addFiles(Array.from(files));
    }
    // Reset input value to allow same file selection
    event.target.value = '';
  }, [addFiles]);

  return {
    handleDrop,
    handleFileInput,
  };
};
