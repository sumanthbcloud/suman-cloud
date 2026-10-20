import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import type { CloudFile } from '../../types';
import { fileService } from '../../services/fileService';

interface FilePreviewModalProps {
  file: CloudFile | null;
  url: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (file: CloudFile) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  url,
  isOpen,
  onClose,
  onDownload,
}) => {
  if (!isOpen || !file || !url) return null;

  const handleDownload = async () => {
    if (onDownload) {
      onDownload(file);
      return;
    }
    try {
      const downloadUrl = await fileService.getDownloadUrl(file.id);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.location.href = url;
    }
  };

  const isPhoto = file.category === 'photos' || file.mimeType.startsWith('image/');
  const isVideo = file.category === 'videos' || file.mimeType.startsWith('video/');
  const isAudio = file.category === 'audio' || file.mimeType.startsWith('audio/');
  const isPdf = file.mimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.08] bg-white dark:bg-[#111318]">
          <div className="min-w-0 pr-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate" title={file.name}>
              {file.name}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 capitalize">
              {file.category} • {file.mimeType}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
              title="Open in new window"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-4 flex items-center justify-center bg-slate-950/5 dark:bg-black/50 overflow-auto min-h-[280px]">
          {isPhoto && (
            <img
              src={url}
              alt={file.name}
              className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-xs"
            />
          )}

          {isVideo && (
            <video
              controls
              autoPlay
              src={url}
              className="max-h-[70vh] w-full rounded-lg shadow-xs bg-black"
            >
              Your browser does not support the video tag.
            </video>
          )}

          {isAudio && (
            <div className="w-full max-w-md p-6 bg-white dark:bg-[#14151a] rounded-xl shadow-xs border border-slate-200 dark:border-white/[0.08] flex flex-col items-center gap-4">
              <p className="text-xs font-medium text-slate-700 dark:text-zinc-200 text-center truncate w-full">
                {file.name}
              </p>
              <audio controls autoPlay src={url} className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {isPdf && (
            <iframe
              src={url}
              title={file.name}
              className="w-full h-[65vh] rounded-lg border border-slate-200 dark:border-white/[0.08]"
            />
          )}

          {!isPhoto && !isVideo && !isAudio && !isPdf && (
            <div className="text-center py-12 px-6">
              <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                Browser preview is not available for this document type
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 mb-4">
                You can download the file or open it directly in a new window.
              </p>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download file</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
