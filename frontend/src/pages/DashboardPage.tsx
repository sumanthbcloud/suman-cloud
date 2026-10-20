import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { CategoryCards } from '../components/dashboard/CategoryCards';
import { RecentFilesTable } from '../components/dashboard/RecentFilesTable';
import { FilePreviewModal } from '../components/common/FilePreviewModal';
import { DeleteConfirmModal } from '../components/common/DeleteConfirmModal';
import { fileService } from '../services/fileService';
import type {
  CloudFile,
  FileCategory,
  StorageOverviewData,
} from '../types';

interface DashboardPageProps {
  files: CloudFile[];
  storageData: StorageOverviewData;
  currentCategory: FileCategory;
  onSelectCategory: (category: FileCategory) => void;
  searchQuery: string;
  onRefreshFiles: () => void;
  user?: { name: string; email: string } | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  files,
  storageData,
  currentCategory,
  onSelectCategory,
  searchQuery,
  onRefreshFiles,
  user,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<CloudFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<CloudFile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileAction = async (
    file: CloudFile,
    action: 'preview' | 'download' | 'delete',
    preloadedUrl?: string
  ) => {
    if (action === 'delete') {
      setFileToDelete(file);
      return;
    }

    try {
      let url = preloadedUrl;
      if (!url) {
        url = await fileService.getPresignedUrl(file.id);
      }

      if (action === 'download') {
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Downloading "${file.name}"...`);
      } else if (action === 'preview') {
        setPreviewFile(file);
        setPreviewUrl(url);
        setPreviewOpen(true);
      }
    } catch {
      showToast('Unable to open this file. Please try again.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setDeleting(true);
    try {
      await fileService.deleteFile(fileToDelete.id);
      showToast(`"${fileToDelete.name}" deleted.`);
      onRefreshFiles();
      setFileToDelete(null);
    } catch {
      showToast('Unable to delete this file. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const isHome = currentCategory === 'all';
  const categoryMeta = storageData.categories.find(
    (c) => c.category === currentCategory
  );

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-[#181920] text-white text-xs shadow-xl border border-slate-800 dark:border-white/[0.12] flex items-center gap-2 animate-in fade-in">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Header Area */}
      {isHome ? (
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Welcome back, {user?.name || 'Suman'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            All your files, organized and securely stored in your account.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between pb-1">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500 mb-1">
              <button
                type="button"
                onClick={() => onSelectCategory('all')}
                className="hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                All files
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600" />
              <span className="text-slate-600 dark:text-zinc-300 font-medium capitalize">
                {categoryMeta?.label || currentCategory}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 capitalize">
              {categoryMeta?.label || currentCategory}
            </h1>
          </div>
          {categoryMeta && (
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {categoryMeta.count.toLocaleString()} files
            </span>
          )}
        </div>
      )}

      {/* Primary Category Tiles (on Home view) */}
      {isHome && (
        <CategoryCards
          categories={storageData.categories}
          selectedCategory={currentCategory}
          onSelectCategory={onSelectCategory}
        />
      )}

      {/* Recent Files Section */}
      <section className="space-y-3">
        {isHome && (
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Recent files
          </h2>
        )}

        <RecentFilesTable
          files={files}
          selectedCategory={currentCategory}
          searchQuery={searchQuery}
          onFileAction={handleFileAction}
        />
      </section>

      {/* Native Browser Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        url={previewUrl}
        isOpen={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewFile(null);
          setPreviewUrl(null);
        }}
      />

      {/* Consumer-Grade Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(fileToDelete)}
        fileName={fileToDelete?.name || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setFileToDelete(null)}
        deleting={deleting}
      />
    </div>
  );
};
