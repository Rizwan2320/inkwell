'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import {
  FileText,
  Eye,
  Pencil,
  FolderOpen,
  Plus,
  Globe,
  ArrowUpRight,
  Users,
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  published: boolean;
  views: number;
  totalReadMs: number;
  createdAt: string;
  category: { id: string; name: string; color: string } | null;
}

interface Category {
  id: string;
  name: string;
}

export default function Dashboard() {
  const { navigate, setEditingPostId } = useAppStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [postsRes, catsRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/categories'),
      ]);
      const postsData = await postsRes.json();
      const catsData = await catsRes.json();
      setPosts(postsData.posts || []);
      setCategories(catsData.categories || []);
    } catch {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPosts = posts.length;
  const published = posts.filter((p) => p.published).length;
  const drafts = posts.filter((p) => !p.published).length;
  const totalCategories = categories.length;
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalReadMs = posts.reduce((sum, p) => sum + (p.totalReadMs || 0), 0);
  const avgReadSec = totalViews > 0 ? Math.round(totalReadMs / totalViews / 1000) : 0;

  const formatAvgRead = (sec: number) => {
    if (sec === 0) return '0s';
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const stats = [
    { label: 'Total Posts', value: totalPosts, icon: FileText, color: '#00FF00' },
    { label: 'Published', value: published, icon: Eye, color: '#00FF00' },
    { label: 'Total Views', value: totalViews, icon: Users, color: '#00BBFF' },
    { label: 'Avg Read', value: formatAvgRead(avgReadSec), icon: ClockIcon, color: '#FFAA00' },
    { label: 'Drafts', value: drafts, icon: Pencil, color: '#FF6644' },
    { label: 'Categories', value: totalCategories, icon: FolderOpen, color: '#AA66FF' },
  ];

  const quickActions = [
    { label: 'Write a new post', icon: Plus, action: () => { setEditingPostId(null); navigate('editor'); } },
    { label: 'Manage categories', icon: FolderOpen, action: () => navigate('categories') },
    { label: 'View all posts', icon: FileText, action: () => navigate('posts') },
    { label: 'View public site', icon: Globe, action: () => navigate('blog') },
  ];

  const recentPosts = posts.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: '#00FF00', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>Dashboard</h1>
        <p style={{ color: '#999999' }}>Welcome back! Here&apos;s your blog overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4 relative overflow-hidden transition-all duration-200 hover:border-[rgba(0,255,0,0.15)] hover:translate-y-[-1px]"
            style={{
              backgroundColor: '#000000',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{stat.value}</p>
                <p className="text-xs mt-1" style={{ color: '#999999' }}>{stat.label}</p>
              </div>
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: '#000000',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>Quick Actions</h2>
          <div className="space-y-1">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-150 hover:bg-[#0a0a0a] hover:text-[#FFFFFF] hover:translate-x-[2px]"
                style={{ color: '#999999' }}
              >
                <action.icon size={18} />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: '#000000',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>Recent Posts</h2>
            <button
              onClick={() => navigate('posts')}
              className="text-sm transition-colors duration-150 hover:text-[#00FF00]"
              style={{ color: '#999999' }}
            >
              View all
            </button>
          </div>
          {recentPosts.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={32} className="mx-auto mb-2" style={{ color: '#1a1a1a' }} />
              <p className="text-sm" style={{ color: '#999999' }}>No posts yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => { setEditingPostId(post.id); navigate('editor'); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-150 hover:bg-[#0a0a0a] hover:translate-x-[2px]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: '#FFFFFF' }}>{post.title}</p>
                    <p className="text-xs" style={{ color: '#555555' }}>
                      {post.published ? 'Published' : 'Draft'} • {new Date(post.createdAt).toLocaleDateString()}
                      {post.views > 0 && ` • ${post.views} views`}
                    </p>
                  </div>
                  {post.category && (
                    <span
                      className="ml-2 px-2 py-0.5 rounded text-xs shrink-0"
                      style={{
                        backgroundColor: post.category.color + '20',
                        color: post.category.color,
                      }}
                    >
                      {post.category.name}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple clock icon component for stats
function ClockIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
