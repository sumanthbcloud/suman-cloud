import React, { useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  fileName,
  onConfirm,
  onCancel,
  deleting = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !deleting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, deleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 dark:bg-black/80 backdrop-blur-xs transition-opacity duration-200"
      onClick={() => {
        if (!deleting) onCancel();
      }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-white/[0.08] p-5 sm:p-6 shadow-2xl text-left transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4 stroke-[2]" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100">
            Delete file?
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
          Delete <span className="font-semibold text-slate-800 dark:text-zinc-200 break-all">"{fileName}"</span>? This file will be permanently deleted.
        </p>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 dark:disabled:bg-rose-800/60 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
