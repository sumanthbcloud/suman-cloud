import React, { useRef, useState } from 'react';
import { X, Upload, FileUp, AlertCircle, CheckCircle } from 'lucide-react';
import { fileService } from '../../services/fileService';
import { formatBytes } from './StorageProgressBar';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);

    try {
      await fileService.uploadFile(selectedFile);
      setSelectedFile(null);
      onUploadSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload file';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setSelectedFile(null);
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Upload file</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add photos, videos, audio, and documents to your personal S3 storage
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag and Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="mt-5 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/60 hover:bg-blue-50/30 transition-all cursor-pointer group"
        >
          {selectedFile ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <CheckCircle className="w-6 h-6 stroke-[2]" />
              </div>
              <p className="text-sm font-semibold text-slate-800 break-all max-w-sm">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {formatBytes(selectedFile.size)} • Click to choose a different file
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors mb-3">
                <Upload className="w-6 h-6 stroke-[1.8]" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                Drag and drop a file here, or{' '}
                <span className="text-blue-600 hover:underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports photos, videos, audio, and documents (up to 100MB)
              </p>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <FileUp className="w-3.5 h-3.5" />
            {uploading ? 'Uploading to S3...' : selectedFile ? 'Ready to upload' : 'Choose file'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={selectedFile ? handleUpload : () => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              {uploading ? 'Uploading...' : selectedFile ? 'Upload now' : 'Browse files'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
