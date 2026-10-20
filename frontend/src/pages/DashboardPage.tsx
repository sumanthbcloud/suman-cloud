import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { CategoryCards } from '../components/dashboard/CategoryCards';
import { RecentFilesTable } from '../components/dashboard/RecentFilesTable';
import { FilePreviewModal } from '../components/common/FilePreviewModal';
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileAction = async (
    file: CloudFile,
    action: 'preview' | 'download' | 'delete'
  ) => {
    if (action === 'delete') {
      const confirmed = window.confirm(`Delete "${file.name}"? This will delete the file from Amazon S3.`);
      if (!confirmed) return;
      try {
        await fileService.deleteFile(file.id);
        showToast(`"${file.name}" deleted successfully.`);
        onRefreshFiles();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete file';
        showToast(msg);
      }
      return;
    }

    try {
      showToast(`Generating secure S3 access link...`);
      const url = await fileService.getPresignedUrl(file.id);

      if (action === 'download') {
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Starting download for "${file.name}"`);
      } else if (action === 'preview') {
        setPreviewFile(file);
        setPreviewUrl(url);
        setPreviewOpen(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error accessing S3 object';
      showToast(msg);
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
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs shadow-lg border border-slate-800 dark:border-slate-700 flex items-center gap-2 animate-in fade-in">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Header Area */}
      {isHome ? (
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name || 'Suman'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your files, securely backed up and organized in Amazon S3.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between pb-1">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-1">
              <button
                type="button"
                onClick={() => onSelectCategory('all')}
                className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                All files
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              <span className="text-slate-600 dark:text-slate-300 font-medium capitalize">
                {categoryMeta?.label || currentCategory}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">
              {categoryMeta?.label || currentCategory}
            </h1>
          </div>
          {categoryMeta && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
    </div>
  );
};
