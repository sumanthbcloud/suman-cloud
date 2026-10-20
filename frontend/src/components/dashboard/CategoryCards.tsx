import React from 'react';
import { Image, Video, Music, FileText } from 'lucide-react';
import type { FileCategory, StorageCategoryBreakdown } from '../../types';

interface CategoryCardsProps {
  categories: StorageCategoryBreakdown[];
  selectedCategory: FileCategory;
  onSelectCategory: (category: FileCategory) => void;
}

const CATEGORY_STYLE_MAP: Record<
  'photos' | 'videos' | 'audio' | 'documents',
  {
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
  }
> = {
  photos: {
    icon: Image,
    iconBg: 'bg-rose-50 dark:bg-rose-950/50',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  videos: {
    icon: Video,
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  audio: {
    icon: Music,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  documents: {
    icon: FileText,
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
};

export const CategoryCards: React.FC<CategoryCardsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      {categories.map((cat) => {
        const style = CATEGORY_STYLE_MAP[cat.category];
        const Icon = style.icon;
        const isSelected = selectedCategory === cat.category;

        return (
          <button
            key={cat.category}
            type="button"
            onClick={() => onSelectCategory(isSelected ? 'all' : cat.category)}
            className={`group rounded-xl p-3.5 sm:p-4 border text-left transition-all duration-150 flex items-center gap-3 cursor-pointer ${
              isSelected
                ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500 ring-1 ring-blue-400/40 dark:ring-blue-500/40 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/60 shadow-2xs'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconColor}`}
            >
              <Icon className="w-5 h-5 stroke-[1.8]" />
            </div>

            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {cat.label}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {cat.count.toLocaleString()} files
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
