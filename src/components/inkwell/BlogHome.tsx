'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Search, FileText, Clock, Eye } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  published: boolean;
  coverImage: string | null;
  slug: string;
  views: number;
  totalReadMs: number;
  createdAt: string;
  category: { id: string; name: string; color: string } | null;
  author: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  color: string;
  _count: { posts: number };
}

export default function BlogHome() {
  const { navigate, setViewingPostId, searchQuery, setSearchQuery, selectedCategoryId, setSelectedCategoryId } = useAppStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams({ published: 'true' });
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategoryId) params.set('categoryId', selectedCategoryId);
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      console.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategoryId]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      console.error('Failed to fetch categories');
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getReadTime = (content: string | null) => {
    if (!content) return '1 min read';
    const words = content.split(/\s+/).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
  };

  const getAvgReadTime = (post: Post) => {
    if (post.views === 0 || post.totalReadMs === 0) return null;
    const avgSec = Math.round(post.totalReadMs / post.views / 1000);
    if (avgSec < 60) return `${avgSec}s`;
    const mins = Math.floor(avgSec / 60);
    const secs = avgSec % 60;
    return `${mins}m ${secs}s`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
    return views.toString();
  };

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
          <span style={{ color: '#00FF00' }}>Understand</span>
          <span style={{ color: '#FFFFFF' }}> and </span>
          <span style={{ color: '#00FF00' }}>Builds</span>
          <span style={{ color: '#FFFFFF' }}> Intelligence</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: '#999999' }}>
          Exploring the frontier of AI engineering. From neural networks to production systems.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mx-auto mb-10">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#00FF00' }} />
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-lg text-base focus:outline-none transition-colors focus:border-[#00FF00]/40"
          style={{
            backgroundColor: '#000000',
            border: '1px solid rgba(0,255,0,0.2)',
            color: '#FFFFFF',
          }}
        />
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 hover:scale-[1.03]"
            style={{
              backgroundColor: !selectedCategoryId ? '#00FF00' : '#0a0a0a',
              color: !selectedCategoryId ? '#000000' : '#999999',
            }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 hover:scale-[1.03]"
              style={{
                backgroundColor: selectedCategoryId === cat.id ? cat.color : '#0a0a0a',
                color: selectedCategoryId === cat.id ? '#000000' : '#999999',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              {cat.name} ({cat._count.posts})
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: '#00FF00', borderTopColor: 'transparent' }} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={48} className="mx-auto mb-4" style={{ color: '#1a1a1a' }} />
          <p className="text-lg" style={{ color: '#999999' }}>No articles yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Featured Post */}
          {featuredPost && !searchQuery && !selectedCategoryId && (
            <button
              onClick={() => { setViewingPostId(featuredPost.id); navigate('article'); }}
              className="w-full text-left rounded-xl overflow-hidden transition-all duration-200 group hover:border-[rgba(0,255,0,0.15)]"
              style={{
                backgroundColor: '#000000',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {featuredPost.coverImage && (
                <div className="w-full h-48 sm:h-64 overflow-hidden">
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: '#00FF00', color: '#000000' }}>
                    Featured
                  </span>
                  {featuredPost.category && (
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: featuredPost.category.color + '20',
                        color: featuredPost.category.color,
                      }}
                    >
                      {featuredPost.category.name}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-[#00FF00] transition-colors duration-200" style={{ color: '#FFFFFF' }}>
                  {featuredPost.title}
                </h2>
                <p className="mb-4 line-clamp-2" style={{ color: '#999999' }}>
                  {featuredPost.excerpt || featuredPost.content?.slice(0, 160) || ''}
                </p>
                <div className="flex items-center gap-4 text-sm" style={{ color: '#555555' }}>
                  <span>{formatDate(featuredPost.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {getReadTime(featuredPost.content)}
                  </span>
                  {featuredPost.views > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {formatViews(featuredPost.views)} views
                    </span>
                  )}
                </div>
              </div>
            </button>
          )}

          {/* Other Posts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(searchQuery || selectedCategoryId ? posts : otherPosts).map((post) => (
              <button
                key={post.id}
                onClick={() => { setViewingPostId(post.id); navigate('article'); }}
                className="text-left rounded-xl p-5 transition-all duration-200 group hover:border-[rgba(0,255,0,0.15)] hover:translate-y-[-1px]"
                style={{
                  backgroundColor: '#000000',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {post.category && (
                  <span
                    className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-3"
                    style={{
                      backgroundColor: post.category.color + '20',
                      color: post.category.color,
                    }}
                  >
                    {post.category.name}
                  </span>
                )}
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#00FF00] transition-colors duration-200 line-clamp-2" style={{ color: '#FFFFFF' }}>
                  {post.title}
                </h3>
                <p className="text-sm mb-3 line-clamp-2" style={{ color: '#999999' }}>
                  {post.excerpt || post.content?.slice(0, 120) || ''}
                </p>
                <div className="flex items-center justify-between text-xs" style={{ color: '#555555' }}>
                  <div className="flex items-center gap-3">
                    <span>{formatDate(post.createdAt)}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {getReadTime(post.content)}
                    </span>
                  </div>
                  {post.views > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {formatViews(post.views)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
