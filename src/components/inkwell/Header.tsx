'use client';

import { useAppStore, type Page } from '@/lib/store';
import { LayoutDashboard, FileText, FolderOpen, LogOut, PenLine } from 'lucide-react';

const adminNavItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'blog', label: 'Blog', icon: <PenLine size={16} /> },
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { page: 'posts', label: 'Posts', icon: <FileText size={16} /> },
  { page: 'categories', label: 'Categories', icon: <FolderOpen size={16} /> },
];

export default function Header() {
  const { currentPage, navigate, user, isAdmin, setIsAdmin } = useAppStore();

  const handleExitAdmin = () => {
    setIsAdmin(false);
    navigate('blog');
  };

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: '#000000',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => navigate('blog')}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            {/* Ink quill icon */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
            <span className="text-xl font-bold tracking-tight">
              <span style={{ color: '#FFFFFF' }}>Ink</span>
              <span style={{ color: '#00FF00' }}>well</span>
            </span>
          </button>

          {/* Navigation — only shown when in admin mode */}
          {isAdmin ? (
            <div className="flex items-center gap-1">
              {adminNavItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => navigate(item.page)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-150 hover:scale-[1.02]"
                  style={{
                    color: currentPage === item.page ? '#FFFFFF' : '#999999',
                    backgroundColor: currentPage === item.page ? 'rgba(0,255,0,0.08)' : 'transparent',
                  }}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}

              {/* User info + Logout */}
              <div className="ml-2 flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm"
                  style={{ color: '#999999' }}
                >
                  <div
                    className="w-2 h-2 rounded-full animate-pulse-green"
                    style={{ backgroundColor: '#00FF00' }}
                  />
                  <span className="hidden sm:inline">{user?.name || 'Admin'}</span>
                </div>
                <button
                  onClick={handleExitAdmin}
                  className="flex items-center gap-1 p-1.5 rounded-md text-sm transition-all duration-150 hover:scale-105 hover:text-[#FF4444]"
                  style={{ color: '#555555' }}
                  title="Exit Admin"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* Public pages: clean minimal header, no admin controls */
            <div className="flex items-center gap-3">
              <span className="text-sm hidden sm:inline" style={{ color: '#666666' }}>Home</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
