'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import {
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  X,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  _count: { posts: number };
}

const COLORS = [
  '#00FF00', '#00CC00', '#009900',
  '#00BBFF', '#0077CC', '#0055AA',
  '#AA66FF', '#8833FF', '#6600CC',
  '#FF66AA', '#FF3388', '#CC0066',
  '#FFAA33', '#FF8800', '#CC6600',
  '#FFEE00', '#DDCC00', '#AAAA00',
  '#00FFCC', '#00CCAA', '#009988',
  '#FF4444', '#CC2222', '#AA0000',
];

export default function Categories() {
  const { navigate, goBack } = useAppStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#00FF00');

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      console.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setColor('#00FF00');
    setEditingCategory(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (cat: Category) => {
    setName(cat.name);
    setDescription(cat.description || '');
    setColor(cat.color);
    setEditingCategory(cat);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      if (editingCategory) {
        await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, color }),
        });
        toast.success('Category updated');
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, color }),
        });
        toast.success('Category created');
      }
      handleCloseModal();
      fetchCategories();
    } catch {
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      toast.success('Category deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
    setDeleteConfirm(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="p-1.5 rounded-lg transition-all duration-150 hover:bg-[#0a0a0a] hover:text-[#00FF00]"
            style={{ color: '#999999' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>Categories</h1>
            <p className="text-sm" style={{ color: '#999999' }}>Organize your posts with categories</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:scale-[1.03] hover:shadow-[0_0_12px_rgba(0,255,0,0.15)]"
          style={{ backgroundColor: '#00FF00', color: '#000000' }}
        >
          <Plus size={16} />
          New Category
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen size={48} className="mx-auto mb-4" style={{ color: '#1a1a1a' }} />
          <p className="text-lg mb-2" style={{ color: '#999999' }}>No categories yet</p>
          <p className="text-sm mb-4" style={{ color: '#555555' }}>Create your first category to organize your posts</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:scale-[1.03]"
            style={{ backgroundColor: '#00FF00', color: '#000000' }}
          >
            <Plus size={16} />
            Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl p-5 group relative transition-all duration-200 hover:border-[rgba(0,255,0,0.12)] hover:translate-y-[-1px]"
              style={{
                backgroundColor: '#000000',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <h3 className="font-medium" style={{ color: '#FFFFFF' }}>{cat.name}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1 rounded transition-colors duration-100 hover:text-[#00FF00]"
                    style={{ color: '#999999' }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(cat.id)}
                    className="p-1 rounded transition-colors duration-100 hover:text-[#FF0000]"
                    style={{ color: '#999999' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {cat.description && (
                <p className="text-sm mb-3 line-clamp-2" style={{ color: '#999999' }}>{cat.description}</p>
              )}
              <div className="flex items-center gap-1 text-xs" style={{ color: '#555555' }}>
                <FileText size={12} />
                {cat._count.posts} {cat._count.posts === 1 ? 'post' : 'posts'}
              </div>

              {/* Delete confirmation */}
              {deleteConfirm === cat.id && (
                <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-3 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}>
                  <p className="text-sm text-center" style={{ color: '#CCCCCC' }}>Delete &quot;{cat.name}&quot;?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 rounded-lg text-sm transition-all duration-150 hover:border-[rgba(255,255,255,0.2)]"
                      style={{ color: '#999999', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="px-3 py-1.5 rounded-lg text-sm transition-all duration-150 hover:scale-[1.03]"
                      style={{ backgroundColor: '#FF0000', color: '#FFFFFF' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 transition-opacity" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }} onClick={handleCloseModal} />
          <div
            className="relative w-full max-w-md rounded-xl p-6 shadow-2xl"
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg transition-colors duration-150 hover:text-[#FFFFFF]"
                style={{ color: '#999999' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="text-sm block mb-1.5" style={{ color: '#999999' }}>Name</label>
              <input
                type="text"
                placeholder="Category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors focus:border-[rgba(0,255,0,0.3)]"
                style={{
                  backgroundColor: '#000000',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                }}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-sm block mb-1.5" style={{ color: '#999999' }}>Description</label>
              <textarea
                placeholder="What is this category about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none h-20 focus:border-[rgba(0,255,0,0.3)]"
                style={{
                  backgroundColor: '#000000',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                }}
              />
            </div>

            {/* Color Picker */}
            <div className="mb-6">
              <label className="text-sm block mb-2" style={{ color: '#999999' }}>Color</label>
              <div className="grid grid-cols-8 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-full transition-all duration-150 hover:scale-[1.15]"
                    style={{
                      backgroundColor: c,
                      outline: color === c ? '2px solid #FFFFFF' : 'none',
                      outlineOffset: color === c ? '2px' : '0',
                      transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-mono" style={{ color: '#999999' }}>{color}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg text-sm transition-colors duration-150 hover:text-[#FFFFFF]"
                style={{ color: '#999999' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:scale-[1.03] hover:shadow-[0_0_12px_rgba(0,255,0,0.15)]"
                style={{ backgroundColor: '#00FF00', color: '#000000' }}
              >
                {editingCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
