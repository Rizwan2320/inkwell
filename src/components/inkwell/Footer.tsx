'use client';

import { useAppStore } from '@/lib/store';
import { Shield } from 'lucide-react';

export default function Footer() {
  const { isAdmin, setIsAdmin, navigate } = useAppStore();

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      navigate('blog');
    } else {
      setIsAdmin(true);
      navigate('dashboard');
    }
  };

  return (
    <footer
      className="w-full mt-auto"
      style={{
        backgroundColor: '#000000',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
              <span className="text-sm font-medium">
                <span style={{ color: '#FFFFFF' }}>Ink</span>
                <span style={{ color: '#00FF00' }}>well</span>
              </span>
            </div>
            <span className="text-xs" style={{ color: '#333333' }}>•</span>
            <span className="text-xs" style={{ color: '#555555' }}>
              Powered by <span style={{ color: '#FFFFFF' }}>Ink</span><span style={{ color: '#00FF00' }}>well</span> CMS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs hidden sm:inline" style={{ color: '#333333' }}>Built with Next.js</span>
            {/* Admin toggle button */}
            <button
              onClick={handleAdminToggle}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all duration-200 hover:scale-105"
              style={{
                color: isAdmin ? '#00FF00' : '#444444',
                border: isAdmin ? '1px solid rgba(0,255,0,0.2)' : '1px solid rgba(255,255,255,0.06)',
                backgroundColor: isAdmin ? 'rgba(0,255,0,0.05)' : 'transparent',
              }}
              title={isAdmin ? 'Exit Admin Mode' : 'Admin Panel'}
            >
              <Shield size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
