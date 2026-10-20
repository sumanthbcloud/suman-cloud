import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  LogOut,
} from 'lucide-react';
import { SumanLogo } from '../components/common/SumanLogo';
import { Avatar } from '../components/common/Avatar';

interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenUpload: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user?: { name: string; email: string } | null;
  onSignOut?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  onOpenUpload,
  searchQuery,
  onSearchChange,
  user,
  onSignOut,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Visible on mobile where sidebar is hidden */}
        <div className="lg:hidden">
          <SumanLogo size="sm" />
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search files..."
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 transition-colors outline-none"
          />
        </div>
      </div>

      {/* Right: Upload Button & Simple Profile Menu */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          id="topbar-upload-btn"
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>Upload</span>
        </button>

          {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="User menu"
          >
            <Avatar name={user?.name || 'Suman'} size="sm" />
          </button>

          {/* Profile Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-slate-200 shadow-lg p-1.5 text-xs z-50 text-left">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="font-semibold text-slate-900">{user?.name || 'Suman'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
              </div>

              <div className="mt-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    if (onSignOut) onSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
