import React from 'react';
import {
  Home,
  Image,
  Video,
  Music,
  FileText,
  X,
} from 'lucide-react';
import { SumanLogo } from '../components/common/SumanLogo';
import { StorageProgressBar } from '../components/common/StorageProgressBar';
import type { FileCategory, StorageOverviewData } from '../types';

interface SidebarProps {
  currentCategory: FileCategory;
  onSelectCategory: (category: FileCategory) => void;
  storageData: StorageOverviewData;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: FileCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  storageData,
  isOpen,
  onClose,
}) => {
  const navItems: NavItem[] = [
    { id: 'all', label: 'Home', icon: Home },
    { id: 'photos', label: 'Photos', icon: Image },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 dark:bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <SumanLogo size="md" />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentCategory === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectCategory(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 stroke-[1.8] ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Simple Storage Indicator */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <StorageProgressBar
            usedBytes={storageData.usedBytes}
            totalBytes={storageData.totalBytes}
          />
        </div>
      </aside>
    </>
  );
};
