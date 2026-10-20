import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import type { CloudFile } from '../../types';

interface FilePreviewModalProps {
  file: CloudFile | null;
  url: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  url,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !file || !url) return null;

  const isPhoto = file.category === 'photos' || file.mimeType.startsWith('image/');
  const isVideo = file.category === 'videos' || file.mimeType.startsWith('video/');
  const isAudio = file.category === 'audio' || file.mimeType.startsWith('audio/');
  const isPdf = file.mimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white">
          <div className="min-w-0 pr-4">
            <h3 className="text-sm font-semibold text-slate-900 truncate" title={file.name}>
              {file.name}
            </h3>
            <p className="text-[11px] text-slate-400 capitalize">
              {file.category} • {file.mimeType}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Open in new window"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={url}
              download={file.name}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-4 flex items-center justify-center bg-slate-950/5 overflow-auto min-h-[280px]">
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
            <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col items-center gap-4">
              <p className="text-xs font-medium text-slate-700 text-center truncate w-full">
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
              className="w-full h-[65vh] rounded-lg border border-slate-200"
            />
          )}

          {!isPhoto && !isVideo && !isAudio && !isPdf && (
            <div className="text-center py-12 px-6">
              <p className="text-sm font-semibold text-slate-800">
                Browser preview is not available for this document type
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                You can download the file or open it directly in a new window.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Open / Download file</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
