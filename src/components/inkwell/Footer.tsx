'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Shield, X } from 'lucide-react';

export default function Footer() {
  const { isAdmin, setIsAdmin, navigate } = useAppStore();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminToggle = async () => {
    if (isAdmin) {
      setIsAdmin(false);
      navigate('blog');
    } else {
      setShowLogin(true);
      setError('');
      setEmail('');
      setPassword('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setIsAdmin(true);
          setShowLogin(false);
          navigate('dashboard');
        }
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

      {/* Admin Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowLogin(false)} />
          <div
            className="relative z-10 w-full max-w-sm rounded-xl p-6"
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4"
              style={{ color: '#666666' }}
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <Shield size={24} style={{ color: '#00FF00' }} />
              <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Admin Login</h2>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="text-sm block mb-2" style={{ color: '#999999' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none"
                  style={{
                    backgroundColor: '#000000',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                  }}
                  placeholder="admin@inkwell.dev"
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="text-sm block mb-2" style={{ color: '#999999' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none"
                  style={{
                    backgroundColor: '#000000',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                  }}
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <p className="text-sm mb-4" style={{ color: '#ff4444' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: '#00FF00',
                  color: '#000000',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Checking...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}