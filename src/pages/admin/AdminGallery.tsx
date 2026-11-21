import React, { useState } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useI18n } from '../../context/I18nContext';
import { apiFetch, fileToDataUrl } from '../../lib/api';
import { MediaFrame } from '../../components/MediaFrame';
import type { GalleryCategory, GalleryItem, VisualKey } from '../../shared/types';

const CATS: GalleryCategory[] = ['Projects', 'Factory', 'Exhibitions', 'VIP Visits', 'Products'];

export function AdminGallery() {
  const { data, reloadAdmin } = useAdminData();
  const { pick } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    titleEn: '',
    titleAr: '',
    album: 'Projects',
    category: 'Projects' as GalleryCategory,
    mediaUrl: '',
    visualKey: 'hero-caravan' as VisualKey,
    altText: '',
    published: true,
  });

  function openCreate() {
    setEditingId(null);
    setForm({
      titleEn: '',
      titleAr: '',
      album: 'Projects',
      category: 'Projects',
      mediaUrl: '',
      visualKey: 'hero-caravan',
      altText: '',
      published: true,
    });
    setModalOpen(true);
  }

  function openEdit(g: GalleryItem) {
    setEditingId(g.id);
    setForm({
      titleEn: g.titleEn,
      titleAr: g.titleAr,
      album: g.album,
      category: g.category,
      mediaUrl: g.mediaUrl,
      visualKey: g.visualKey,
      altText: g.altText,
      published: g.published,
    });
    setModalOpen(true);
  }

  async function handleUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await apiFetch<{ url: string }>('/api/admin/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, dataUrl }),
      });
      setForm((prev) => ({ ...prev, mediaUrl: res.url }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await apiFetch(`/api/admin/gallery/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch('/api/admin/gallery', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      await reloadAdmin();
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await apiFetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    await reloadAdmin();
  }

  const gallery = data?.gallery || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {pick('Gallery Management', 'إدارة معرض الصور')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {pick('Upload factory photos, exhibition captures, and album items.', 'رفع وإدارة صور المصنع والمعارض.')}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 whitespace-nowrap cursor-pointer"
        >
          <Plus size={15} />
          <span>{pick('Add Media Item', 'إضافة صورة')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((g) => (
          <div key={g.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <MediaFrame imageUrl={g.mediaUrl} visualKey={g.visualKey} alt={g.altText} aspectClass="aspect-[4/3]" />
            <div className="p-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {g.category} · {g.album}
                </span>
                <span>{g.published ? pick('Published', 'منشور') : pick('Draft', 'مسودة')}</span>
              </div>
              <div className="mt-1.5 font-display text-sm font-bold text-slate-900">
                {pick(g.titleEn, g.titleAr)}
              </div>
              <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3 text-xs">
                <button
                  type="button"
                  onClick={() => openEdit(g)}
                  className="rounded border border-slate-300 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {pick('Edit', 'تعديل')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(g.id)}
                  className="rounded p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {editingId ? pick('Edit Gallery Item', 'تعديل الصورة') : pick('Add Gallery Item', 'إضافة صورة جديدة')}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded p-1 text-slate-500 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">{pick('Title (English) *', 'العنوان بالإنجليزية *')}</label>
                <input
                  type="text"
                  required
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700">{pick('Title (Arabic)', 'العنوان بالعربية')}</label>
                <input
                  type="text"
                  dir="rtl"
                  value={form.titleAr}
                  onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Category', 'التصنيف')}</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as GalleryCategory })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                  >
                    {CATS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Album', 'الألبوم')}</label>
                  <input
                    type="text"
                    value={form.album}
                    onChange={(e) => setForm({ ...form, album: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700">{pick('Upload Image', 'رفع صورة')}</label>
                <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-slate-600">
                  <Upload size={14} />
                  <span>{uploading ? pick('Uploading...', 'جاري الرفع...') : pick('Select file from device', 'اختر ملف صورة')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="accent-amber-700"
                />
                <span>{pick('Published', 'منشور')}</span>
              </label>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 cursor-pointer"
                >
                  {pick('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-amber-800 px-5 py-2 font-semibold text-white hover:bg-amber-700 cursor-pointer"
                >
                  {saving ? pick('Saving...', 'جاري الحفظ...') : pick('Save Item', 'حفظ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
