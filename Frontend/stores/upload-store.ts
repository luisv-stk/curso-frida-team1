import { create } from 'zustand';

// Types for file upload management
export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  uploadedUrl?: string;
  createdAt: Date;
}

export interface UploadState {
  // File management
  files: UploadFile[];
  showHello: boolean;
  showAddNewItem: boolean;
  showUploadDetails: boolean;
  
  // Upload status
  isUploading: boolean;
  uploadQueue: string[]; // Array of file IDs in queue
  
  // Progress tracking
  totalProgress: number;
  
  // Error handling
  errors: Record<string, string>; // fileId -> error message
  
  // UI state
  showUploadProgress: boolean;
  showSuccessMessage: boolean;
  lastUploadedFile?: UploadFile;
}

export interface UploadActions {
  // UI state actions
  displayHello: () => void;
  hideHello: () => void;
  displayAddNewItem: () => void;
  hideAddNewItem: () => void;
  displayUploadDetails: () => void;
  hideUploadDetails: () => void;

  // File management actions
  addFiles: (files: File[]) => void;
  removeFile: (fileId: string) => void;
  clearAllFiles: () => void;
  clearCompletedFiles: () => void;
  
  // Upload progress actions
  updateFileProgress: (fileId: string, progress: number) => void;
  setFileStatus: (fileId: string, status: UploadFile['status'], error?: string) => void;
  setFileUploadedUrl: (fileId: string, url: string) => void;
  
  // Queue management
  addToQueue: (fileId: string) => void;
  removeFromQueue: (fileId: string) => void;
  clearQueue: () => void;
  
  // Global state actions
  setIsUploading: (isUploading: boolean) => void;
  calculateTotalProgress: () => void;
  
  // UI state actions
  setShowUploadProgress: (show: boolean) => void;
  setShowSuccessMessage: (show: boolean) => void;
  setLastUploadedFile: (file?: UploadFile) => void;
  
  // Error handling
  setError: (fileId: string, error: string) => void;
  clearError: (fileId: string) => void;
  clearAllErrors: () => void;
  
  // Reset state
  resetStore: () => void;
}

export type UploadStore = UploadState & UploadActions;

// Initial state
const initialState: UploadState = {
  files: [],
  showHello: true,
  showAddNewItem: false,
  showUploadDetails: false,
  isUploading: false,
  uploadQueue: [],
  totalProgress: 0,
  errors: {},
  showUploadProgress: false,
  showSuccessMessage: false,
  lastUploadedFile: undefined,
};

// Helper function to generate unique IDs
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Create the Zustand store
export const useUploadStore = create<UploadStore>((set, get) => ({
  ...initialState,

  displayHello: () => {
    set({ showHello: true });
  },
  hideHello: () => {
    set({ showHello: false });
  },
  displayAddNewItem: () => {
    set({ showAddNewItem: true, showHello: false });
  },
  hideAddNewItem: () => {
    set({ showAddNewItem: false, showHello: true });
  },  
  displayUploadDetails: () => {
    set({ showUploadDetails: true, showHello: false });
  },
  hideUploadDetails: () => {
    set({ showUploadDetails: false, showHello: true });
  },
  // File management actions
  addFiles: (files: File[]) => {
    const newFiles: UploadFile[] = files.map((file) => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending',
      createdAt: new Date(),
    }));

    set((state) => ({
      files: [...state.files, ...newFiles],
    }));
  },

  removeFile: (fileId: string) => {
    set((state) => ({
      files: state.files.filter((file) => file.id !== fileId),
      uploadQueue: state.uploadQueue.filter((id) => id !== fileId),
      errors: Object.fromEntries(
        Object.entries(state.errors).filter(([id]) => id !== fileId)
      ),
    }));
    get().calculateTotalProgress();
  },

  clearAllFiles: () => {
    set({
      files: [],
      uploadQueue: [],
      errors: {},
      totalProgress: 0,
    });
  },

  clearCompletedFiles: () => {
    set((state) => ({
      files: state.files.filter((file) => file.status !== 'completed'),
    }));
    get().calculateTotalProgress();
  },

  // Upload progress actions
  updateFileProgress: (fileId: string, progress: number) => {
    set((state) => ({
      files: state.files.map((file) =>
        file.id === fileId ? { ...file, progress } : file
      ),
    }));
    get().calculateTotalProgress();
  },

  setFileStatus: (fileId: string, status: UploadFile['status'], error?: string) => {
    set((state) => ({
      files: state.files.map((file) =>
        file.id === fileId ? { ...file, status, error } : file
      ),
    }));

    if (error) {
      get().setError(fileId, error);
    } else {
      get().clearError(fileId);
    }

    get().calculateTotalProgress();
  },

  setFileUploadedUrl: (fileId: string, url: string) => {
    set((state) => ({
      files: state.files.map((file) =>
        file.id === fileId ? { ...file, uploadedUrl: url, status: 'completed' } : file
      ),
    }));
  },

  // Queue management
  addToQueue: (fileId: string) => {
    set((state) => ({
      uploadQueue: state.uploadQueue.includes(fileId)
        ? state.uploadQueue
        : [...state.uploadQueue, fileId],
    }));
  },

  removeFromQueue: (fileId: string) => {
    set((state) => ({
      uploadQueue: state.uploadQueue.filter((id) => id !== fileId),
    }));
  },

  clearQueue: () => {
    set({ uploadQueue: [] });
  },

  // Global state actions
  setIsUploading: (isUploading: boolean) => {
    set({ isUploading });
  },

  calculateTotalProgress: () => {
    const { files } = get();
    if (files.length === 0) {
      set({ totalProgress: 0 });
      return;
    }

    const totalProgress = files.reduce((sum, file) => sum + file.progress, 0) / files.length;
    set({ totalProgress });
  },

  // UI state actions
  setShowUploadProgress: (show: boolean) => {
    set({ showUploadProgress: show });
  },

  setShowSuccessMessage: (show: boolean) => {
    set({ showSuccessMessage: show });
  },

  setLastUploadedFile: (file?: UploadFile) => {
    set({ lastUploadedFile: file });
  },

  // Error handling
  setError: (fileId: string, error: string) => {
    set((state) => ({
      errors: { ...state.errors, [fileId]: error },
    }));
  },

  clearError: (fileId: string) => {
    set((state) => ({
      errors: Object.fromEntries(
        Object.entries(state.errors).filter(([id]) => id !== fileId)
      ),
    }));
  },

  clearAllErrors: () => {
    set({ errors: {} });
  },
  // Reset state
  resetStore: () => {
    set(initialState);
  },

  
}));
