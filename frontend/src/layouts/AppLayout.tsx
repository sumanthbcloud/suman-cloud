import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { UploadModal } from '../components/common/UploadModal';
import type { FileCategory, StorageOverviewData } from '../types';

interface AppLayoutProps {
  children: React.ReactNode;
  currentCategory: FileCategory;
  onSelectCategory: (category: FileCategory) => void;
  storageData: StorageOverviewData;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  uploadModalOpen: boolean;
  onOpenUpload: () => void;
  onCloseUpload: () => void;
  onUploadSuccess: () => void;
  user?: { name: string; email: string } | null;
  onSignOut?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentCategory,
  onSelectCategory,
  storageData,
  searchQuery,
  onSearchChange,
  uploadModalOpen,
  onOpenUpload,
  onCloseUpload,
  onUploadSuccess,
  user,
  onSignOut,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar navigation */}
      <Sidebar
        currentCategory={currentCategory}
        onSelectCategory={onSelectCategory}
        storageData={storageData}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        {/* Topbar */}
        <Topbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenUpload={onOpenUpload}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          user={user}
          onSignOut={onSignOut}
        />

        {/* Dynamic page content */}
        <main className="flex-1 p-5 sm:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Single clean Upload Modal triggered only by primary Upload button */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={onCloseUpload}
        onUploadSuccess={onUploadSuccess}
      />
    </div>
  );
};
