'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import {
  ArrowLeft,
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Eye,
  Save,
  Upload,
  Image as ImageIconLucide,
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface PostData {
  id: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  published: boolean;
  coverImage: string | null;
  categoryId: string | null;
  category: { id: string; name: string; color: string } | null;
}

export default function PostEditor() {
  const { navigate, goBack, editingPostId, user } = useAppStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [published, setPublished] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      console.error('Failed to fetch categories');
    }
  }, []);

  const fetchPost = useCallback(async () => {
    if (!editingPostId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/posts/${editingPostId}`);
      const data = await res.json();
      if (data.post) {
        const p: PostData = data.post;
        setTitle(p.title);
        setContent(p.content || '');
        setExcerpt(p.excerpt || '');
        setPublished(p.published);
        setCoverImage(p.coverImage || '');
        setCategoryId(p.categoryId || null);
      }
    } catch {
      console.error('Failed to fetch post');
    } finally {
      setLoading(false);
    }
  }, [editingPostId]);

  useEffect(() => {
    fetchCategories();
    fetchPost();
  }, [fetchCategories, fetchPost]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      toast.error('Invalid file type. Only images allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum 5MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setCoverImage(data.url);
        toast.success('Image uploaded successfully');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    setSaving(true);
    try {
      const body = {
        title,
        content,
        excerpt: excerpt || undefined,
        published,
        coverImage: coverImage || null,
        categoryId: categoryId || null,
        authorId: user?.id || 'default-author',
      };

      if (editingPostId) {
        await fetch(`/api/posts/${editingPostId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        toast.success('Post updated successfully');
      } else {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.post) {
          toast.success('Post created successfully');
        }
      }
    } catch {
      toast.error('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = content.substring(0, start) + prefix + selected + suffix + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = start + prefix.length + selected.length;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: '#00FF00', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
        style={{ display: 'none' }}
      />

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="p-1.5 rounded-lg transition-all duration-150 hover:bg-[#0a0a0a] hover:text-[#00FF00]"
            style={{ color: '#999999' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
              {editingPostId ? 'Edit Post' : 'New Post'}
            </h1>
            <p className="text-sm" style={{ color: '#999999' }}>Write something amazing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 hover:border-[rgba(0,255,0,0.2)] hover:text-[#00FF00]"
            style={{ color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 hover:scale-[1.03] hover:shadow-[0_0_12px_rgba(0,255,0,0.15)] disabled:opacity-50 disabled:hover:scale-100"
            style={{ backgroundColor: '#00FF00', color: '#000000' }}
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-0">
          {/* Title Input */}
          <input
            type="text"
            placeholder="Post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-lg focus:outline-none transition-colors mb-4 focus:border-[rgba(0,255,0,0.3)]"
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#FFFFFF',
            }}
          />

          {!showPreview ? (
            <>
              {/* Toolbar */}
              <div
                className="flex items-center gap-1 px-3 py-2 rounded-t-lg"
                style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderBottom: 'none',
                }}
              >
                <button onClick={() => insertMarkdown('**', '**')} className="p-1.5 rounded transition-all duration-100 hover:bg-[#111111] hover:text-[#FFFFFF]" style={{ color: '#999999' }} title="Bold">
                  <Bold size={16} />
                </button>
                <button onClick={() => insertMarkdown('*', '*')} className="p-1.5 rounded transition-all duration-100 hover:bg-[#111111] hover:text-[#FFFFFF]" style={{ color: '#999999' }} title="Italic">
                  <Italic size={16} />
                </button>
                <button onClick={() => insertMarkdown('## ')} className="p-1.5 rounded transition-all duration-100 hover:bg-[#111111] hover:text-[#FFFFFF]" style={{ color: '#999999' }} title="Heading">
                  <Heading2 size={16} />
                </button>
                <div className="w-px h-4 mx-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <button onClick={() => insertMarkdown('- ')} className="p-1.5 rounded transition-all duration-100 hover:bg-[#111111] hover:text-[#FFFFFF]" style={{ color: '#999999' }} title="Bullet List">
                  <List size={16} />
                </button>
                <button onClick={() => insertMarkdown('1. ')} className="p-1.5 rounded transition-all duration-100 hover:bg-[#111111] hover:text-[#FFFFFF]" style={{ color: '#999999' }} title="Numbered List">
                  <ListOrdered size={16} />
                </button>
                <div className="w-px h-4 mx-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <button onClick={() => insertMarkdown('[', '](url)')} className="p-1.5 rounded transition-all duration-100 hover:bg-[#111111] hover:text-[#FFFFFF]" style={{ color: '#999999' }} title="Link">
                  <LinkIcon size={16} />
                </button>
                <button onClick={() => insertMarkdown('![alt](', ')')} className="p-1.5 rounded transition-all duration-100 hover:bg-[#111111] hover:text-[#FFFFFF]" style={{ color: '#999999' }} title="Image">
                  <ImageIcon size={16} />
                </button>
              </div>

              {/* Content Textarea */}
              <textarea
                id="content-editor"
                placeholder="Start writing your story... (Markdown supported)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[400px] px-4 py-3 rounded-b-lg resize-y font-mono text-sm leading-relaxed focus:outline-none transition-colors focus:border-[rgba(0,255,0,0.2)]"
                style={{
                  backgroundColor: '#000000',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderTop: 'none',
                  color: '#FFFFFF',
                }}
              />
            </>
          ) : (
            <div
              className="rounded-lg p-6 min-h-[400px]"
              style={{
                backgroundColor: '#000000',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="prose-inkwell">
                {content ? (
                  <div dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
                ) : (
                  <p style={{ color: '#555555' }} className="italic">Nothing to preview</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-4">
          {/* Publish Settings */}
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: '#FFFFFF' }}>Published</label>
              <button
                onClick={() => setPublished(!published)}
                className="relative w-10 h-5 rounded-full transition-colors duration-200"
                style={{ backgroundColor: published ? '#00FF00' : '#222222' }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-200"
                  style={{
                    backgroundColor: '#FFFFFF',
                    transform: published ? 'translateX(20px)' : 'translateX(0)',
                  }}
                />
              </button>
            </div>
            <p className="text-xs" style={{ color: '#555555' }}>
              {published ? 'This post will be visible to everyone' : 'This post is saved as a draft'}
            </p>
          </div>

          {/* Cover Image */}
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <label className="text-sm font-medium block mb-3" style={{ color: '#FFFFFF' }}>Cover Image</label>
            {coverImage ? (
              <div className="mb-3 relative rounded-lg overflow-hidden">
                <img src={coverImage} alt="Cover" className="w-full h-32 object-cover" />
                <button
                  onClick={() => setCoverImage('')}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-150 hover:bg-[#FF0000]"
                  style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#FFFFFF' }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                className="mb-3 rounded-lg p-6 text-center cursor-pointer transition-all duration-150 hover:bg-[#0a0a0a] hover:border-[rgba(0,255,0,0.25)]"
                style={{ border: '2px dashed rgba(0,255,0,0.15)' }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <ImageIconLucide size={28} className="mx-auto mb-2" style={{ color: '#00FF00' }} />
                <p className="text-sm font-medium mb-1" style={{ color: '#FFFFFF' }}>
                  {uploading ? 'Uploading...' : 'Click to upload'}
                </p>
                <p className="text-xs" style={{ color: '#555555' }}>
                  or drag and drop
                </p>
              </div>
            )}
            <div className="space-y-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all duration-150 hover:border-[rgba(0,255,0,0.2)] hover:text-[#00FF00] disabled:opacity-50 w-full justify-center"
                style={{
                  backgroundColor: '#111111',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                }}
              >
                <Upload size={12} />
                {uploading ? 'Uploading...' : 'Upload from device'}
              </button>
              <p className="text-xs" style={{ color: '#555555' }}>Or paste image URL:</p>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-3 py-1.5 rounded text-sm focus:outline-none transition-colors focus:border-[rgba(0,255,0,0.3)]"
                style={{
                  backgroundColor: '#000000',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                }}
              />
            </div>
          </div>

          {/* Category */}
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <label className="text-sm font-medium block mb-2" style={{ color: '#FFFFFF' }}>Category</label>
            <select
              value={categoryId || ''}
              onChange={(e) => setCategoryId(e.target.value || null)}
              className="w-full px-3 py-1.5 rounded text-sm focus:outline-none appearance-none cursor-pointer"
              style={{
                backgroundColor: '#000000',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23555555' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2rem',
              }}
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs mt-2" style={{ color: '#555555' }}>
                No categories yet.{' '}
                <button
                  onClick={() => navigate('categories')}
                  className="hover:underline transition-colors duration-150"
                  style={{ color: '#00FF00' }}
                >
                  Create one
                </button>
              </p>
            )}
          </div>

          {/* Excerpt */}
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <label className="text-sm font-medium block mb-2" style={{ color: '#FFFFFF' }}>Excerpt</label>
            <textarea
              placeholder="A brief summary of your post..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm focus:outline-none resize-none h-20 focus:border-[rgba(0,255,0,0.3)]"
              style={{
                backgroundColor: '#000000',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#FFFFFF',
              }}
            />
            <p className="text-xs mt-1.5" style={{ color: '#555555' }}>
              Leave empty to auto-generate from the title
            </p>
          </div>
        </div>
      </div>
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
