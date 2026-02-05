/**
 * File Upload Composable
 * 
 * Encapsulates file upload logic including drag-and-drop handling,
 * file validation, and file list management.
 * 
 * Usage:
 * ```ts
 * const { files, isDragging, addFiles, removeFile, ... } = useFileUpload({
 *   acceptedTypes: ['image/', 'application/pdf']
 * });
 * ```
 */

import { ref, readonly, type Ref } from 'vue';

export interface FileUploadOptions {
  /**
   * MIME type prefixes or file extensions to accept.
   * Examples: 'image/', 'application/pdf', '.svg'
   */
  acceptedTypes?: string[];
  /**
   * Maximum number of files allowed
   */
  maxFiles?: number;
  /**
   * Maximum file size in bytes
   */
  maxSizeBytes?: number;
}

export interface UseFileUploadReturn {
  /** Readonly list of uploaded files */
  files: Readonly<Ref<readonly File[]>>;
  /** Whether files are being dragged over the drop zone */
  isDragging: Readonly<Ref<boolean>>;
  /** Add files to the list (with validation) */
  addFiles: (newFiles: File[]) => void;
  /** Remove a file by index */
  removeFile: (index: number) => void;
  /** Clear all files */
  clearFiles: () => void;
  /** Format file size for display */
  formatFileSize: (bytes: number) => string;
  /** Handle drag enter event */
  handleDragEnter: (event: DragEvent) => void;
  /** Handle drag leave event */
  handleDragLeave: () => void;
  /** Handle drop event */
  handleDrop: (event: DragEvent) => void;
  /** Reset drag state (call if drag is cancelled) */
  resetDragState: () => void;
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/',
  'application/pdf',
  '.ai',
  '.psd',
  '.eps',
  '.svg'
];

/**
 * File upload composable
 */
export function useFileUpload(options: FileUploadOptions = {}): UseFileUploadReturn {
  const {
    acceptedTypes = DEFAULT_ACCEPTED_TYPES,
    maxFiles,
    maxSizeBytes
  } = options;

  // Internal state
  const files = ref<File[]>([]);
  const isDragging = ref(false);
  let dragCounter = 0;

  /**
   * Validate a single file against acceptance criteria
   */
  function isValidFile(file: File): boolean {
    // Check size
    if (maxSizeBytes && file.size > maxSizeBytes) {
      return false;
    }

    // Check type
    return acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        // File extension check
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      // MIME type prefix check
      return file.type.startsWith(type);
    });
  }

  /**
   * Add files to the list (immutable update)
   */
  function addFiles(newFiles: File[]): void {
    const validFiles = newFiles.filter(isValidFile);
    
    if (validFiles.length === 0) return;

    // Apply max files limit
    let filesToAdd = validFiles;
    if (maxFiles) {
      const remaining = maxFiles - files.value.length;
      filesToAdd = validFiles.slice(0, Math.max(0, remaining));
    }

    if (filesToAdd.length === 0) return;

    // Immutable update
    files.value = [...files.value, ...filesToAdd];
  }

  /**
   * Remove a file by index (immutable update)
   */
  function removeFile(index: number): void {
    if (index < 0 || index >= files.value.length) return;
    files.value = files.value.filter((_, i) => i !== index);
  }

  /**
   * Clear all files
   */
  function clearFiles(): void {
    files.value = [];
  }

  /**
   * Format file size for display
   */
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${size} ${sizes[i]}`;
  }

  /**
   * Handle drag enter event
   */
  function handleDragEnter(event: DragEvent): void {
    dragCounter++;
    if (event.dataTransfer?.types.includes('Files')) {
      isDragging.value = true;
    }
  }

  /**
   * Handle drag leave event
   */
  function handleDragLeave(): void {
    dragCounter--;
    if (dragCounter === 0) {
      isDragging.value = false;
    }
  }

  /**
   * Handle drop event
   */
  function handleDrop(event: DragEvent): void {
    resetDragState();
    
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles) {
      addFiles(Array.from(droppedFiles));
    }
  }

  /**
   * Reset drag state
   */
  function resetDragState(): void {
    dragCounter = 0;
    isDragging.value = false;
  }

  return {
    files: readonly(files) as Readonly<Ref<readonly File[]>>,
    isDragging: readonly(isDragging),
    addFiles,
    removeFile,
    clearFiles,
    formatFileSize,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    resetDragState
  };
}
