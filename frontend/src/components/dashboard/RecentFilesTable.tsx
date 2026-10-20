import React, { useState, useEffect } from 'react';
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
import { fileService } from '../../services/fileService';
import type { CloudFile, FileCategory } from '../../types';

interface RecentFilesTableProps {
  files: CloudFile[];
  selectedCategory: FileCategory;
  searchQuery: string;
  onFileAction: (
    file: CloudFile,
    action: 'preview' | 'download' | 'delete',
    preloadedUrl?: string
  ) => void;
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
  photos: { iconBg: 'bg-rose-50 dark:bg-rose-950/35', iconColor: 'text-rose-600 dark:text-rose-400' },
  videos: { iconBg: 'bg-amber-50 dark:bg-amber-950/35', iconColor: 'text-amber-600 dark:text-amber-400' },
  audio: { iconBg: 'bg-emerald-50 dark:bg-emerald-950/35', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  documents: { iconBg: 'bg-blue-50 dark:bg-blue-950/35', iconColor: 'text-blue-600 dark:text-blue-400' },
};

/**
 * Visual thumbnail tile for the Photos gallery grid.
 * Fetches presigned URL, shows skeleton while loading, renders lazy image with object-cover,
 * and displays subtle hover actions and metadata.
 */
const PhotoThumbnailTile: React.FC<{
  file: CloudFile;
  onFileAction: (
    file: CloudFile,
    action: 'preview' | 'download' | 'delete',
    preloadedUrl?: string
  ) => void;
}> = ({ file, onFileAction }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    fileService
      .getPresignedUrl(file.id)
      .then((presignedUrl) => {
        if (active) {
          setUrl(presignedUrl);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [file.id]);

  return (
    <div
      onClick={() => onFileAction(file, 'preview', url || undefined)}
      className="group relative aspect-square rounded-xl overflow-hidden bg-white dark:bg-[#111318] border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18] hover:shadow-md transition-all duration-200 cursor-pointer select-none"
    >
      {/* Loading Skeleton */}
      {(loading || (!imgLoaded && !error)) && (
        <div className="absolute inset-0 bg-slate-200/70 dark:bg-[#16171d] animate-pulse flex items-center justify-center">
          <Image className="w-7 h-7 text-slate-300 dark:text-zinc-600" />
        </div>
      )}

      {/* Error Fallback */}
      {error && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-[#14151a] flex flex-col items-center justify-center p-3 text-center">
          <Image className="w-8 h-8 text-slate-300 dark:text-zinc-600 mb-1.5" />
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate w-full">
            {file.name}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
            Preview unavailable
          </span>
        </div>
      )}

      {/* Actual Thumbnail Image */}
      {url && !error && (
        <img
          src={url}
          alt={file.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Star indicator if starred */}
      {file.starred && (
        <Star className="w-4 h-4 text-amber-400 fill-amber-400 absolute top-2.5 left-2.5 drop-shadow-xs z-10" />
      )}

      {/* Subtle Hover Overlay with Title and Actions */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5 z-10">
        {/* Top bar quick actions */}
        <div className="flex items-center justify-end gap-1.5 self-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileAction(file, 'download', url || undefined);
            }}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-colors cursor-pointer"
            title="Download image"
            aria-label="Download image"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileAction(file, 'delete');
            }}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-rose-600 text-white backdrop-blur-xs transition-colors cursor-pointer"
            title="Delete image"
            aria-label="Delete image"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom file info */}
        <div className="min-w-0 pr-1">
          <p className="text-xs font-medium text-white truncate drop-shadow-xs" title={file.name}>
            {file.name}
          </p>
          <p className="text-[10px] text-slate-300 drop-shadow-xs mt-0.5">
            {formatBytes(file.size)}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Small row thumbnail for Photos in the list view (Home page).
 */
const RowThumbnail: React.FC<{
  file: CloudFile;
  fallbackStyle: { iconBg: string; iconColor: string };
  Icon: React.ComponentType<{ className?: string }>;
}> = ({ file, fallbackStyle, Icon }) => {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (file.category === 'photos') {
      fileService
        .getPresignedUrl(file.id)
        .then((url) => {
          if (active) setThumbUrl(url);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [file.id, file.category]);

  if (file.category === 'photos' && thumbUrl) {
    return (
      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-[#181920] border border-slate-200/80 dark:border-white/[0.08]">
        <img
          src={thumbUrl}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${fallbackStyle.iconBg} ${fallbackStyle.iconColor}`}
    >
      <Icon className="w-4 h-4 stroke-[1.8]" />
    </div>
  );
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
      <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200 dark:border-white/[0.08] py-12 px-4 text-center">
        <FileQuestion className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2.5" />
        <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-100">No files found</h4>
        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
          {searchQuery ? `No files matching "${searchQuery}"` : 'Upload your first file to get started'}
        </p>
      </div>
    );
  }

  // Category view: Photos gallery grid
  if (selectedCategory === 'photos') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4.5">
        {filteredFiles.map((file) => (
          <PhotoThumbnailTile
            key={file.id}
            file={file}
            onFileAction={onFileAction}
          />
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
            className="group bg-white dark:bg-[#111318] rounded-xl border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] hover:shadow-xs transition-all overflow-hidden flex flex-col"
          >
            {/* Video Thumbnail Placeholder */}
            <div
              onClick={() => onFileAction(file, 'preview')}
              className="h-32 bg-slate-100 dark:bg-[#14151a] flex items-center justify-center relative group-hover:bg-slate-200/60 dark:group-hover:bg-[#181920] transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-white dark:bg-[#181920] shadow-xs border border-slate-200/60 dark:border-white/[0.08] flex items-center justify-center text-slate-600 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>
            {/* Meta */}
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 dark:text-zinc-100 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                  {formatBytes(file.size)} • {file.updatedAt}
                </p>
              </div>
              <div className="flex items-center shrink-0 gap-0.5">
                <button
                  type="button"
                  onClick={() => onFileAction(file, 'preview')}
                  className="p-1 rounded text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onFileAction(file, 'download')}
                  className="p-1 rounded text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onFileAction(file, 'delete')}
                  className="p-1 rounded text-slate-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
    <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/90 dark:border-white/[0.08] overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-white/[0.08] text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider bg-slate-50/70 dark:bg-[#0e0f13]">
              <th className="py-2.5 pl-4 pr-3">Name</th>
              <th className="py-2.5 px-3 hidden sm:table-cell">Category</th>
              <th className="py-2.5 px-3 hidden md:table-cell">Size</th>
              <th className="py-2.5 px-3 hidden lg:table-cell">Modified</th>
              <th className="py-2.5 pl-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs">
            {filteredFiles.map((file) => {
              const Icon = CATEGORY_ICON_MAP[file.category] || FileText;
              const style = CATEGORY_STYLE_MAP[file.category];

              return (
                <tr
                  key={file.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  {/* File Name & Icon / Row Thumbnail */}
                  <td className="py-2.5 pl-4 pr-3">
                    <div className="flex items-center gap-3">
                      <RowThumbnail
                        file={file}
                        fallbackStyle={style}
                        Icon={Icon}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p
                            onClick={() => onFileAction(file, 'preview')}
                            className="font-medium text-slate-800 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                          >
                            {file.name}
                          </p>
                          {file.starred && (
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate sm:hidden">
                          {formatBytes(file.size)} • {file.updatedAt}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-2.5 px-3 hidden sm:table-cell">
                    <span className="inline-block text-[11px] font-medium text-slate-600 dark:text-zinc-400 capitalize">
                      {file.category}
                    </span>
                  </td>

                  {/* Size */}
                  <td className="py-2.5 px-3 hidden md:table-cell text-slate-500 dark:text-zinc-400 font-normal">
                    {formatBytes(file.size)}
                  </td>

                  {/* Upload Date */}
                  <td className="py-2.5 px-3 hidden lg:table-cell text-slate-400 dark:text-zinc-500">
                    {file.updatedAt}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 pl-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onFileAction(file, 'preview')}
                        title="Preview"
                        className="p-1 rounded-md text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onFileAction(file, 'download')}
                        title="Download"
                        className="p-1 rounded-md text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onFileAction(file, 'delete')}
                        title="Delete file"
                        className="p-1 rounded-md text-slate-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
