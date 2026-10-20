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
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  videos: {
    icon: Video,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  audio: {
    icon: Music,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  documents: {
    icon: FileText,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
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
                ? 'bg-blue-50/60 border-blue-400 ring-1 ring-blue-400/40 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconColor}`}
            >
              <Icon className="w-5 h-5 stroke-[1.8]" />
            </div>

            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                {cat.label}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {cat.count.toLocaleString()} files
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
