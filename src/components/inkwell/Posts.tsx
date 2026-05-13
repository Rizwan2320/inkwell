'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Eye,
  MoreVertical,
  Clock,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  published: boolean;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string; color: string } | null;
  author: { id: string; name: string };
}

export default function Posts() {
  const { navigate, goBack, setEditingPostId, setViewingPostId } = useAppStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'published') params.set('published', 'true');
      if (filter === 'draft') params.set('published', 'false');
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      console.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [filter, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      toast.success('Post deleted successfully');
      fetchPosts();
    } catch {
      toast.error('Failed to delete post');
    }
    setOpenMenu(null);
  };

  const handleTogglePublish = async (post: Post) => {
    try {
      await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published }),
      });
      toast.success(post.published ? 'Post unpublished' : 'Post published');
      fetchPosts();
    } catch {
      toast.error('Failed to update post');
    }
    setOpenMenu(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getReadTime = (content: string | null) => {
    if (!content) return '1 min';
    const words = content.split(/\s+/).length;
    return `${Math.max(1, Math.ceil(words / 200))} min`;
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="p-1.5 rounded-lg transition-all duration-150 hover:bg-[#0a0a0a] hover:text-[#00FF00]"
            style={{ color: '#999999' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>Posts</h1>
            <p className="text-sm" style={{ color: '#999999' }}>Manage your blog posts</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingPostId(null); navigate('editor'); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:scale-[1.03] hover:shadow-[0_0_12px_rgba(0,255,0,0.15)]"
          style={{ backgroundColor: '#00FF00', color: '#000000' }}
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1">
          {(['all', 'published', 'draft'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 capitalize hover:scale-[1.03]"
              style={{
                backgroundColor: filter === f ? '#00FF00' : '#0a0a0a',
                color: filter === f ? '#000000' : '#999999',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#555555' }} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-sm focus:outline-none transition-colors focus:border-[rgba(0,255,0,0.3)]"
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#FFFFFF',
            }}
          />
        </div>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={48} className="mx-auto mb-4" style={{ color: '#1a1a1a' }} />
          <p className="text-lg mb-2" style={{ color: '#999999' }}>No posts found</p>
          <p className="text-sm mb-4" style={{ color: '#555555' }}>
            {searchQuery || filter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first blog post to get started'}
          </p>
          {!searchQuery && filter === 'all' && (
            <button
              onClick={() => { setEditingPostId(null); navigate('editor'); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:scale-[1.03]"
              style={{ backgroundColor: '#00FF00', color: '#000000' }}
            >
              <Plus size={16} />
              Create your first post
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-xl p-4 flex items-start gap-4 group transition-all duration-200 hover:border-[rgba(0,255,0,0.12)]"
              style={{
                backgroundColor: '#000000',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate" style={{ color: '#FFFFFF' }}>{post.title}</h3>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium shrink-0"
                    style={{
                      backgroundColor: post.published ? 'rgba(0,255,0,0.1)' : 'rgba(255,170,0,0.1)',
                      color: post.published ? '#00FF00' : '#FFAA00',
                    }}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm truncate mb-2" style={{ color: '#555555' }}>
                  {post.excerpt || post.content?.slice(0, 100) || 'No content'}
                </p>
                <div className="flex items-center gap-3 text-xs" style={{ color: '#555555' }}>
                  <span>{formatDate(post.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {getReadTime(post.content)}
                  </span>
                  {post.category && (
                    <span
                      className="px-1.5 py-0.5 rounded text-xs"
                      style={{
                        backgroundColor: post.category.color + '20',
                        color: post.category.color,
                      }}
                    >
                      {post.category.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative shrink-0">
                <button
                  onClick={() => setOpenMenu(openMenu === post.id ? null : post.id)}
                  className="p-1.5 rounded-lg transition-colors duration-150 hover:bg-[#0a0a0a] hover:text-[#FFFFFF]"
                  style={{ color: '#555555' }}
                >
                  <MoreVertical size={18} />
                </button>
                {openMenu === post.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                    <div
                      className="absolute right-0 top-8 z-20 w-44 rounded-lg py-1 shadow-xl"
                      style={{
                        backgroundColor: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <button
                        onClick={() => { setEditingPostId(post.id); navigate('editor'); setOpenMenu(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors duration-100 hover:bg-[#111111]"
                        style={{ color: '#CCCCCC' }}
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => { setViewingPostId(post.id); navigate('article'); setOpenMenu(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors duration-100 hover:bg-[#111111]"
                        style={{ color: '#CCCCCC' }}
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors duration-100 hover:bg-[#111111]"
                        style={{ color: '#CCCCCC' }}
                      >
                        <Eye size={14} /> {post.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <div className="my-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors duration-100 hover:bg-[rgba(255,0,0,0.08)]"
                        style={{ color: '#FF0000' }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
