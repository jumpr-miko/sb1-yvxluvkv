import React, { useState, useCallback, useRef, useEffect } from 'react';
import { File, Upload, X, FileText, Image, Download, Paperclip, ArrowUpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface FileAttachmentPanelProps {
  jobId?: string | null;
  readOnly?: boolean;
  onFilesUpdated?: () => void;
}

// File type for our application
interface FileObject {
  id: string;
  name: string;
  size: number;
  created_at: string;
  type: string;
  path: string;
}

// Component for individual file item
const FileItem = ({ file, onDelete, readOnly }: { 
  file: FileObject, 
  onDelete: (path: string) => void, 
  readOnly: boolean 
}) => {
  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    const fileTypeIcons: Record<string, React.ReactNode> = {
      pdf: <FileText className="h-5 w-5 text-red-400" />,
      doc: <FileText className="h-5 w-5 text-blue-400" />,
      docx: <FileText className="h-5 w-5 text-blue-400" />,
      txt: <FileText className="h-5 w-5 text-gray-400" />,
      jpg: <Image className="h-5 w-5 text-green-400" />,
      jpeg: <Image className="h-5 w-5 text-green-400" />,
      png: <Image className="h-5 w-5 text-green-400" />,
    };
    return fileTypeIcons[fileType.toLowerCase()] || <File className="h-5 w-5 text-gray-400" />;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file URL for download
  const getFileUrl = (filePath: string) => {
    const { data } = supabase
      .storage
      .from('job-attachments')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between bg-bolt-gray rounded p-2 text-xs group"
    >
      <div className="flex items-center overflow-hidden">
        {getFileIcon(file.type)}
        <span className="ml-2 truncate" title={file.name}>
          {file.name}
        </span>
        <span className="ml-2 text-gray-400">
          ({formatFileSize(file.size)})
        </span>
      </div>
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={getFileUrl(file.path)}
          download
          className="p-1 rounded hover:bg-bolt-dark transition-colors"
          title="Download"
        >
          <Download size={14} className="text-blue-400" />
        </a>
        {!readOnly && (
          <button
            onClick={() => onDelete(file.path)}
            className="p-1 rounded hover:bg-bolt-dark transition-colors"
            title="Delete"
          >
            <X size={14} className="text-red-400" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Drop area for file uploads
const DropArea = ({ 
  isDragging, 
  onDragEnter, 
  onDragLeave, 
  onDragOver, 
  onDrop,
  onBrowseClick,
  uploadProgress,
  isLoading 
}: { 
  isDragging: boolean, 
  onDragEnter: (e: React.DragEvent) => void,
  onDragLeave: (e: React.DragEvent) => void,
  onDragOver: (e: React.DragEvent) => void,
  onDrop: (e: React.DragEvent) => void,
  onBrowseClick: () => void,
  uploadProgress: number | null,
  isLoading: boolean
}) => (
  <div
    className={`border-2 border-dashed rounded-md p-4 text-center transition-colors ${
      isDragging
        ? 'border-bolt-blue bg-bolt-blue bg-opacity-5'
        : 'border-border hover:border-gray-400'
    }`}
    onDragEnter={onDragEnter}
    onDragLeave={onDragLeave}
    onDragOver={onDragOver}
    onDrop={onDrop}
  >
    {isLoading && uploadProgress !== null ? (
      <div className="text-center">
        <div className="h-2 bg-bolt-gray rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-bolt-blue"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">Uploading: {uploadProgress}%</p>
      </div>
    ) : (
      <button
        onClick={onBrowseClick}
        disabled={isLoading}
        className="text-xs text-gray-400 hover:text-bolt-light flex flex-col items-center justify-center w-full"
      >
        <ArrowUpCircle className="h-6 w-6 mb-1" />
        <span>Drag files here or click to upload</span>
      </button>
    )}
  </div>
);

const FileAttachmentPanel: React.FC<FileAttachmentPanelProps> = ({
  jobId,
  readOnly = false,
  onFilesUpdated
}) => {
  // State
  const [files, setFiles] = useState<FileObject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define loadFiles first, since other functions will use it
  const loadFiles = useCallback(async () => {
    if (!jobId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .storage
        .from('job-attachments')
        .list(`${jobId}`);
        
      if (error) {
        console.error('Error loading files:', error);
        return;
      }
      
      if (data) {
        const fileObjects = data.map(file => ({
          id: file.id,
          name: file.name,
          size: file.metadata?.size || 0,
          created_at: file.created_at,
          type: file.name.split('.').pop() || 'unknown',
          path: `${jobId}/${file.name}`
        }));
        
        setFiles(fileObjects);
      }
    } catch (error) {
      console.error('Error in loadFiles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  // Load files when jobId changes
  useEffect(() => {
    if (jobId) {
      loadFiles();
    } else {
      setFiles([]);
    }
  }, [jobId, loadFiles]);

  // Now define uploadFiles, which uses loadFiles
  const uploadFiles = useCallback(async (filesToUpload: File[]) => {
    if (!jobId || filesToUpload.length === 0) return;
    
    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const filePath = `${jobId}/${file.name}`;
        
        // Upload the file to Supabase storage
        const { error } = await supabase
          .storage
          .from('job-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (error) {
          console.error('Error uploading file:', error);
          continue;
        }
        
        // Update progress
        const progress = Math.round(((i + 1) / filesToUpload.length) * 100);
        setUploadProgress(progress);
      }
      
      // Reload files to show the newly uploaded ones
      await loadFiles();
      onFilesUpdated?.();
    } catch (error) {
      console.error('Error in uploadFiles:', error);
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
  }, [jobId, loadFiles, onFilesUpdated]);

  // Open file browser
  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle file change from input
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !jobId) return;
    await uploadFiles(Array.from(e.target.files));
    e.target.value = ''; // Reset the input
  }, [jobId, uploadFiles]);

  // Delete file from storage
  const deleteFile = useCallback(async (filePath: string) => {
    if (!jobId) return;
    
    if (window.confirm('Are you sure you want to delete this file?')) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .storage
          .from('job-attachments')
          .remove([filePath]);
          
        if (error) {
          console.error('Error deleting file:', error);
          return;
        }
        
        // Update state to remove the deleted file
        setFiles(prev => prev.filter(file => file.path !== filePath));
        onFilesUpdated?.();
      } catch (error) {
        console.error('Error in deleteFile:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [jobId, onFilesUpdated]);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!jobId || !e.dataTransfer.files.length) return;
    await uploadFiles(Array.from(e.dataTransfer.files));
  }, [jobId, uploadFiles]);

  return (
    <div className="bg-secondary border-t border-border p-4 flex flex-col">
      <h3 className="font-medium text-sm mb-3 flex items-center">
        <Paperclip className="h-4 w-4 mr-2 text-gray-400" />
        Attachments
        <span className="text-xs text-gray-400 ml-2">
          {files.length > 0 ? `(${files.length})` : ''}
        </span>
      </h3>
      
      <div className="space-y-3">
        {/* File list */}
        <AnimatePresence>
          {files.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file) => (
                <FileItem 
                  key={file.id} 
                  file={file} 
                  onDelete={deleteFile} 
                  readOnly={readOnly} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-xs text-gray-400 py-2">
              {jobId ? 'No files attached' : 'Select a job to add attachments'}
            </div>
          )}
        </AnimatePresence>
        
        {/* Upload area */}
        {!readOnly && jobId && (
          <>
            <DropArea 
              isDragging={isDragging}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onBrowseClick={handleBrowseClick}
              uploadProgress={uploadProgress}
              isLoading={isLoading}
            />
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
            
            <p className="text-xs text-gray-400 text-center">
              Add files to provide more context about this job role
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(FileAttachmentPanel);