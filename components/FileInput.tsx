
import React, { useRef, useState, useCallback } from 'react';
import { UploadCloudIcon, FileIcon, XIcon } from './icons';

interface FileInputProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  clearFiles: () => void;
}

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const FileInput: React.FC<FileInputProps> = ({ onFilesSelected, selectedFiles, clearFiles }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    onFilesSelected(files);
  };
  
  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    onFilesSelected(files);
    if(fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col flex-grow">
      <div 
        onDragEnter={onDragEnter}
        onDragOver={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={openFileDialog}
        className={`flex-grow flex flex-col justify-center items-center border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-blue-900/30' : 'border-gray-600 hover:border-blue-500 hover:bg-gray-700/50'}`}
      >
        <UploadCloudIcon className="w-12 h-12 text-gray-500 mb-2" />
        <p className="text-gray-300 font-semibold">
          <span className="text-blue-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500">Any document, text, media, or image files</p>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-400">Selected Files: {selectedFiles.length}</h3>
            <button
              onClick={clearFiles}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
            >
              <XIcon className="w-3 h-3"/> Clear All
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="bg-gray-700 p-2 rounded-md flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                    <FileIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="truncate text-gray-300" title={file.name}>{file.name}</span>
                </div>
                <span className="text-gray-500 flex-shrink-0">{formatBytes(file.size)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
