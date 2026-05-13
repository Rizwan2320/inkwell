'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import {
  ArrowLeft,
  Clock,
  Copy,
  ExternalLink,
  Linkedin,
  Eye,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner';

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

export default function ArticleView() {
  const { navigate, goBack, viewingPostId } = useAppStore();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState(0);
  const [avgReadSec, setAvgReadSec] = useState(0);
  const readStartRef = useRef<number>(0);
  const trackedRef = useRef<boolean>(false);

  const fetchPost = useCallback(async () => {
    if (!viewingPostId) return;
    try {
      const res = await fetch(`/api/posts/${viewingPostId}`);
      const data = await res.json();
      const p = data.post || null;
      setPost(p);
      if (p) {
        setViews(p.views);
        setAvgReadSec(p.views > 0 ? Math.round(p.totalReadMs / p.views / 1000) : 0);
      }
    } catch {
      console.error('Failed to fetch post');
    } finally {
      setLoading(false);
    }
  }, [viewingPostId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // Track visit on mount and reading time on unmount
  useEffect(() => {
    if (!viewingPostId || trackedRef.current) return;
    trackedRef.current = true;
    readStartRef.current = Date.now();

    // Track the view visit
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: viewingPostId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.views) setViews(data.views);
        if (data.avgReadTime) setAvgReadSec(data.avgReadTime);
      })
      .catch(() => {});

    // Track reading time when leaving the page
    return () => {
      const readMs = Date.now() - readStartRef.current;
      if (readMs > 2000) {
        // Only track if user spent at least 2 seconds
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: viewingPostId, readMs }),
        }).catch(() => {});
      }
    };
  }, [viewingPostId]);

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

  const formatViews = (v: number) => {
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return v.toString();
  };

  const formatAvgRead = (sec: number) => {
    if (sec === 0) return 'N/A';
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const handleBack = () => {
    goBack();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: '#00FF00', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <p className="text-lg mb-4" style={{ color: '#999999' }}>Post not found</p>
        <button
          onClick={() => navigate('blog')}
          className="inline-flex items-center gap-1.5 text-sm transition-colors duration-150 hover:text-[#00FF00]"
          style={{ color: '#00FF00' }}
        >
          <ArrowLeft size={16} />
          Back to all articles
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm transition-colors duration-150 hover:text-[#00FF00]"
          style={{ color: '#999999' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-sm transition-colors duration-150 hover:text-[#00FF00]"
            style={{ color: '#999999' }}
          >
            <Copy size={14} />
            Copy Link
          </button>
          <button
            className="flex items-center gap-1.5 text-sm transition-colors duration-150 hover:text-[#00FF00]"
            style={{ color: '#999999' }}
          >
            <ExternalLink size={14} />
            Share
          </button>
        </div>
      </div>

      {/* Article */}
      <article>
        {/* Cover Image */}
        {post.coverImage && (
          <div className="rounded-xl overflow-hidden mb-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
          </div>
        )}

        {/* Category */}
        {post.category && (
          <span
            className="inline-block px-2.5 py-1 rounded-md text-xs font-medium mb-4"
            style={{
              backgroundColor: post.category.color + '20',
              color: post.category.color,
            }}
          >
            {post.category.name}
          </span>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight" style={{ color: '#FFFFFF' }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm mb-8 pb-8" style={{ color: '#999999', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span>{formatDate(post.createdAt)}</span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {getReadTime(post.content)}
          </span>
          <span>By {post.author.name}</span>
          <span className="flex items-center gap-1">
            <Eye size={14} />
            {formatViews(views)} views
          </span>
          {avgReadSec > 0 && (
            <span className="flex items-center gap-1">
              <Timer size={14} />
              Avg read: {formatAvgRead(avgReadSec)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="prose-inkwell mb-12">
          {post.content ? (
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }} />
          ) : (
            <p className="italic" style={{ color: '#555555' }}>No content</p>
          )}
        </div>

        {/* Stats Bar */}
        <div
          className="rounded-xl p-5 mb-6 flex flex-wrap items-center gap-6"
          style={{
            backgroundColor: '#000000',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-2">
            <Eye size={18} style={{ color: '#00FF00' }} />
            <div>
              <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{formatViews(views)}</p>
              <p className="text-xs" style={{ color: '#555555' }}>Total Views</p>
            </div>
          </div>
          <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <div className="flex items-center gap-2">
            <Timer size={18} style={{ color: '#00FF00' }} />
            <div>
              <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{formatAvgRead(avgReadSec)}</p>
              <p className="text-xs" style={{ color: '#555555' }}>Avg Reading Time</p>
            </div>
          </div>
          <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <div className="flex items-center gap-2">
            <Clock size={18} style={{ color: '#00FF00' }} />
            <div>
              <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{getReadTime(post.content)}</p>
              <p className="text-xs" style={{ color: '#555555' }}>Est. Read Time</p>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: '#000000',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h3 className="font-medium mb-4" style={{ color: '#FFFFFF' }}>Share this article</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150 hover:border-[rgba(0,255,0,0.2)] hover:text-[#00FF00]"
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#CCCCCC',
              }}
            >
              <Copy size={14} />
              Copy Link
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150 hover:border-[rgba(0,255,0,0.2)] hover:text-[#00FF00]"
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#CCCCCC',
              }}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Post on X
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150 hover:border-[rgba(0,255,0,0.2)] hover:text-[#00FF00]"
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#CCCCCC',
              }}
            >
              <Linkedin size={14} />
              LinkedIn
            </button>
          </div>
        </div>

        {/* Back button */}
        <div className="mt-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm transition-colors duration-150 hover:text-[#00FF00]"
            style={{ color: '#999999' }}
          >
            <ArrowLeft size={16} />
            Back to all articles
          </button>
        </div>
      </article>
    </div>
  );
}

// Simple markdown to HTML converter
function markdownToHtml(md: string): string {
  let html = md
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:1rem 0" />')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr />')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');

  if (!html.startsWith('<')) {
    html = '<p>' + html + '</p>';
  }

  return html;
}
