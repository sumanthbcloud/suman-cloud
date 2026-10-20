import React from 'react';

interface StorageProgressBarProps {
  usedBytes: number;
  totalBytes: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const StorageProgressBar: React.FC<StorageProgressBarProps> = ({
  usedBytes,
  totalBytes,
}) => {
  const percentage = Math.min(100, Math.round((usedBytes / totalBytes) * 100));

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
        <span>Storage</span>
        <span className="font-medium text-slate-700 dark:text-zinc-200">
          {formatBytes(usedBytes)} of {formatBytes(totalBytes)}
        </span>
      </div>

      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden border border-slate-200/60 dark:border-white/[0.06]">
        <div
          style={{ width: `${percentage}%` }}
          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
        />
      </div>
    </div>
  );
};
