import React from 'react';
import {
  Image,
  Video,
  Music,
  FileText,
  Download,
  Eye,
  Trash2,
  Star,
  Play,
  FileQuestion,
} from 'lucide-react';
import { formatBytes } from '../common/StorageProgressBar';
import type { CloudFile, FileCategory } from '../../types';

interface RecentFilesTableProps {
  files: CloudFile[];
  selectedCategory: FileCategory;
  searchQuery: string;
  onFileAction: (file: CloudFile, action: 'preview' | 'download' | 'delete') => void;
}

const CATEGORY_ICON_MAP: Record<CloudFile['category'], React.ComponentType<{ className?: string }>> = {
  photos: Image,
  videos: Video,
  audio: Music,
  documents: FileText,
};

const CATEGORY_STYLE_MAP: Record<
  CloudFile['category'],
  { iconBg: string; iconColor: string }
> = {
  photos: { iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
  videos: { iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  audio: { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  documents: { iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
};

export const RecentFilesTable: React.FC<RecentFilesTableProps> = ({
  files,
  selectedCategory,
  searchQuery,
  onFileAction,
}) => {
  const filteredFiles = files.filter((file) => {
    const matchesCategory =
      selectedCategory === 'all' || file.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filteredFiles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 py-12 px-4 text-center">
        <FileQuestion className="w-8 h-8 text-slate-300 mx-auto mb-2.5" />
        <h4 className="text-xs font-semibold text-slate-800">No files found</h4>
        <p className="text-xs text-slate-400 mt-1">
          {searchQuery ? `No files matching "${searchQuery}"` : 'Upload your first file to get started'}
        </p>
      </div>
    );
  }

  // Category view: Photos grid
  if (selectedCategory === 'photos') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all overflow-hidden flex flex-col"
          >
            {/* Thumbnail Placeholder */}
            <div
              onClick={() => onFileAction(file, 'preview')}
              className="h-32 bg-slate-100 flex items-center justify-center relative group-hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <Image className="w-8 h-8 text-slate-300 group-hover:text-rose-500 transition-colors" />
              {file.starred && (
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 absolute top-2 right-2" />
              )}
            </div>
            {/* Meta */}
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {formatBytes(file.size)}
                </p>
              </div>
              <div className="flex items-center shrink-0 gap-0.5">
                <button
                  type="button"
                  onClick={() => onFileAction(file, 'preview')}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onFileAction(file, 'download')}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onFileAction(file, 'delete')}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Category view: Videos grid
  if (selectedCategory === 'videos') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all overflow-hidden flex flex-col"
          >
            {/* Video Thumbnail Placeholder */}
            <div
              onClick={() => onFileAction(file, 'preview')}
              className="h-32 bg-slate-100 flex items-center justify-center relative group-hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-600 group-hover:text-blue-600 transition-colors">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>
            {/* Meta */}
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {formatBytes(file.size)} • {file.updatedAt}
                </p>
              </div>
              <div className="flex items-center shrink-0 gap-0.5">
                <button
                  type="button"
                  onClick={() => onFileAction(file, 'preview')}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onFileAction(file, 'download')}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onFileAction(file, 'delete')}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Standard clean list view (Home & Documents / Audio)
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/70">
              <th className="py-2.5 pl-4 pr-3">Name</th>
              <th className="py-2.5 px-3 hidden sm:table-cell">Category</th>
              <th className="py-2.5 px-3 hidden md:table-cell">Size</th>
              <th className="py-2.5 px-3 hidden lg:table-cell">Modified</th>
              <th className="py-2.5 pl-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredFiles.map((file) => {
              const Icon = CATEGORY_ICON_MAP[file.category] || FileText;
              const style = CATEGORY_STYLE_MAP[file.category];

              return (
                <tr
                  key={file.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* File Name & Icon */}
                  <td className="py-2.5 pl-4 pr-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconColor}`}
                      >
                        <Icon className="w-4 h-4 stroke-[1.8]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p
                            onClick={() => onFileAction(file, 'preview')}
                            className="font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            {file.name}
                          </p>
                          {file.starred && (
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate sm:hidden">
                          {formatBytes(file.size)} • {file.updatedAt}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-2.5 px-3 hidden sm:table-cell">
                    <span className="inline-block text-[11px] font-medium text-slate-600 capitalize">
                      {file.category}
                    </span>
                  </td>

                  {/* Size */}
                  <td className="py-2.5 px-3 hidden md:table-cell text-slate-500 font-normal">
                    {formatBytes(file.size)}
                  </td>

                  {/* Upload Date */}
                  <td className="py-2.5 px-3 hidden lg:table-cell text-slate-400">
                    {file.updatedAt}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 pl-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onFileAction(file, 'preview')}
                        title="Preview"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onFileAction(file, 'download')}
                        title="Download"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onFileAction(file, 'delete')}
                        title="Delete file"
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
