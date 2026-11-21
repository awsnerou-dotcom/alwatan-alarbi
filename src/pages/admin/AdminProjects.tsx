import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2, Upload, Video, X } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useI18n } from '../../context/I18nContext';
import { apiFetch, fileToDataUrl } from '../../lib/api';
import { MediaFrame } from '../../components/MediaFrame';
import type { Project, VisualKey } from '../../shared/types';

const VISUAL_KEYS: VisualKey[] = [
  'aluminum-caravan',
  'fiberglass-caravan',
  'pickup-canopy',
  'water-fuel-tank',
  'tent-structure',
  'vip-majlis',
  'hero-caravan',
  'katara-pavilion',
  'factory-cnc',
];

export function AdminProjects() {
  const { data, reloadAdmin } = useAdminData();
  const { pick } = useI18n();
  const [filterCat, setFilterCat] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [form, setForm] = useState({
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    categorySlug: 'alfan-vehicle-conversions',
    completionDate: new Date().toISOString().slice(0, 10),
    specsText: '',
    specsArText: '',
    visualKey: 'aluminum-caravan' as VisualKey,
    images: [] as string[],
    videoUrl: '',
    sortOrder: 1,
    featured: false,
    published: true,
    leadTimeWeeks: 4,
    startingPriceQar: 65000,
    dimensions: '5.5m × 2.3m',
    material: '5083 Marine Aluminum',
  });

  const projects = useMemo(() => {
    const all = [...(data?.projects || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    if (filterCat === 'all') return all;
    return all.filter((p) => p.categorySlug === filterCat);
  }, [data, filterCat]);

  const categories = data?.categories || [];

  function openCreate() {
    setEditingId(null);
    setForm({
      titleEn: '',
      titleAr: '',
      descriptionEn: '',
      descriptionAr: '',
      categorySlug: filterCat !== 'all' ? filterCat : categories[0]?.slug || 'caravan-projects',
      completionDate: new Date().toISOString().slice(0, 10),
      specsText: 'Dimensions: Custom Fitment\nMaterial: Marine-Grade Aluminum',
      specsArText: 'الأبعاد: تفصيل حسب المركبة\nالمادة: ألمنيوم بحري مقاوم للصدأ',
      visualKey: 'aluminum-caravan',
      images: [],
      videoUrl: '',
      sortOrder: (data?.projects.length || 0) + 1,
      featured: false,
      published: true,
      leadTimeWeeks: 4,
      startingPriceQar: 65000,
      dimensions: '5.5m × 2.3m',
      material: '5083 Marine Aluminum',
    });
    setModalOpen(true);
  }

  function openEdit(p: Project) {
    setEditingId(p.id);
    setForm({
      titleEn: p.titleEn,
      titleAr: p.titleAr,
      descriptionEn: p.descriptionEn,
      descriptionAr: p.descriptionAr,
      categorySlug: p.categorySlug,
      completionDate: p.completionDate,
      specsText: p.specs.join('\n'),
      specsArText: p.specsAr.join('\n'),
      visualKey: p.visualKey,
      images: p.images,
      videoUrl: p.videoUrl || '',
      sortOrder: p.sortOrder ?? 1,
      featured: p.featured,
      published: p.published,
      leadTimeWeeks: p.leadTimeWeeks,
      startingPriceQar: p.startingPriceQar,
      dimensions: p.dimensions,
      material: p.material,
    });
    setModalOpen(true);
  }

  async function handleMultipleImagesUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const dataUrl = await fileToDataUrl(file);
        const res = await apiFetch<{ url: string }>('/api/admin/upload', {
          method: 'POST',
          body: JSON.stringify({ fileName: file.name, dataUrl }),
        });
        uploadedUrls.push(res.url);
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    } finally {
      setUploading(false);
    }
  }

  async function handleVideoUpload(file: File | null) {
    if (!file) return;
    setUploadingVideo(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await apiFetch<{ url: string }>('/api/admin/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, dataUrl }),
      });
      setForm((prev) => ({ ...prev, videoUrl: res.url }));
    } finally {
      setUploadingVideo(false);
    }
  }

  async function moveProject(index: number, direction: -1 | 1) {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= projects.length) return;
    const allSorted = [...(data?.projects || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const currentId = projects[index].id;
    const swapId = projects[targetIdx].id;
    const i1 = allSorted.findIndex((p) => p.id === currentId);
    const i2 = allSorted.findIndex((p) => p.id === swapId);
    if (i1 === -1 || i2 === -1) return;
    [allSorted[i1], allSorted[i2]] = [allSorted[i2], allSorted[i1]];
    await apiFetch('/api/admin/projects/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds: allSorted.map((p) => p.id) }),
    });
    await reloadAdmin();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        specs: form.specsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        specsAr: form.specsArText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editingId) {
        await apiFetch(`/api/admin/projects/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/api/admin/projects', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      await reloadAdmin();
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await apiFetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
    await reloadAdmin();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {pick('Projects & Portfolio CMS', 'إدارة المشاريع والترتيب والوسائط')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {pick(
              'Add/edit Arabic titles, upload multiple gallery photos & videos, and reorder projects.',
              'تعديل العناوين والأوصاف العربية، رفع صور متعددة وفيديو لكل مشروع، وتغيير ترتيب العرض.',
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 whitespace-nowrap cursor-pointer"
        >
          <Plus size={15} />
          <span>{pick('New Project', 'إضافة مشروع')}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1.5 rounded-lg bg-slate-200/70 p-1">
        <button
          type="button"
          onClick={() => setFilterCat('all')}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
            filterCat === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          {pick('All Categories', 'جميع الأقسام')} ({data?.projects.length || 0})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilterCat(c.slug)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
              filterCat === c.slug ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            {pick(c.nameEn, c.nameAr)}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">{pick('Order', 'الترتيب')}</th>
                <th className="px-5 py-3 font-semibold">{pick('Project', 'المشروع')}</th>
                <th className="px-5 py-3 font-semibold">{pick('Category', 'القسم')}</th>
                <th className="px-5 py-3 font-semibold">{pick('Media', 'الوسائط')}</th>
                <th className="px-5 py-3 font-semibold">{pick('Status', 'الحالة')}</th>
                <th className="px-5 py-3 font-semibold text-right">{pick('Actions', 'إجراءات')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p, idx) => {
                const cat = categories.find((c) => c.slug === p.categorySlug);
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1">
                        <span className="font-mono-tabular w-6 font-semibold text-slate-700">
                          {p.sortOrder ?? idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => moveProject(idx, -1)}
                          disabled={idx === 0}
                          title={pick('Move Up', 'تحريك لأعلى')}
                          className="rounded border border-slate-200 p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveProject(idx, 1)}
                          disabled={idx === projects.length - 1}
                          title={pick('Move Down', 'تحريك لأسفل')}
                          className="rounded border border-slate-200 p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-16 shrink-0 overflow-hidden rounded border border-slate-200">
                          <MediaFrame imageUrl={p.images[0]} visualKey={p.visualKey} alt={p.titleAr} aspectClass="h-full w-full" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{pick(p.titleEn, p.titleAr)}</div>
                          <div className="text-slate-500">{p.titleAr !== p.titleEn ? (pick(p.titleAr, p.titleEn)) : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {cat ? pick(cat.nameEn, cat.nameAr) : p.categorySlug}
                    </td>
                    <td className="font-mono-tabular px-5 py-3.5 text-slate-600">
                      {p.images.length} {pick('imgs', 'صور')}
                      {p.videoUrl ? ` · ${pick('Video', 'فيديو')}` : ''}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded border px-2 py-0.5 text-[11px] font-semibold ${
                          p.published
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.published ? pick('Published', 'منشور') : pick('Draft', 'مسودة')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="rounded border border-slate-300 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          {pick('Edit', 'تعديل')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          aria-label="Delete project"
                          className="rounded p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {editingId ? pick('Edit Project', 'تعديل المشروع') : pick('Create New Project', 'إنشاء مشروع جديد')}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Arabic Title *', 'العنوان بالعربية *')}</label>
                  <input
                    type="text"
                    dir="rtl"
                    required
                    value={form.titleAr}
                    onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">{pick('English Title', 'العنوان بالإنجليزية')}</label>
                  <input
                    type="text"
                    value={form.titleEn}
                    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Arabic Description', 'الوصف بالعربية')}</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={form.descriptionAr}
                    onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">{pick('English Description', 'الوصف بالإنجليزية')}</label>
                  <textarea
                    rows={3}
                    value={form.descriptionEn}
                    onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700">{pick('Category', 'القسم')}</label>
                  <select
                    value={form.categorySlug}
                    onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {pick(c.nameEn, c.nameAr)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Order', 'الترتيب')}</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="font-mono-tabular mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Price (QAR)', 'السعر')}</label>
                  <input
                    type="number"
                    value={form.startingPriceQar}
                    onChange={(e) => setForm({ ...form, startingPriceQar: Number(e.target.value) })}
                    className="font-mono-tabular mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Multi-image upload */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-semibold text-slate-700">
                    {pick('Project Image Gallery (Upload Multiple Images)', 'معرض صور المشروع (رفع صور متعددة)')}
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-amber-700 bg-amber-50 px-3 py-1.5 text-amber-900 hover:bg-amber-100">
                    <Upload size={14} />
                    <span>{uploading ? pick('Uploading...', 'جاري الرفع...') : pick('Upload Images', 'رفع صور متعددة')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => handleMultipleImagesUpload(e.target.files)}
                    />
                  </label>
                </div>

                {form.images.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.images.map((url, idx) => (
                      <div key={idx} className="relative h-16 w-24 overflow-hidden rounded border border-slate-200">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })}
                          className="absolute right-1 top-1 rounded bg-slate-900/75 p-0.5 text-white cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-slate-400">
                    {pick('No custom images uploaded yet — fallback schematic will be used.', 'لم يتم رفع صور بعد.')}
                  </p>
                )}
              </div>

              {/* Optional Video Upload or URL */}
              <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-semibold text-slate-700">
                    {pick('Optional Video (YouTube URL or MP4 Upload)', 'فيديو اختياري (رابط يوتيوب أو رفع ملف)')}
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-slate-700 hover:border-amber-700">
                    <Video size={14} />
                    <span>{uploadingVideo ? pick('Uploading...', 'جاري الرفع...') : pick('Upload Video', 'رفع فيديو')}</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      disabled={uploadingVideo}
                      onChange={(e) => handleVideoUpload(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/embed/... or /uploads/..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Schematic Fallback', 'النموذج الهندسي الاحتياطي')}</label>
                  <select
                    value={form.visualKey}
                    onChange={(e) => setForm({ ...form, visualKey: e.target.value as VisualKey })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                  >
                    {VISUAL_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-6 pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="accent-amber-700"
                    />
                    <span>{pick('Featured on Home', 'عرض في الرئيسية')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) => setForm({ ...form, published: e.target.checked })}
                      className="accent-amber-700"
                    />
                    <span>{pick('Published', 'منشور')}</span>
                  </label>
                </div>
              </div>

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
                  {saving ? pick('Saving...', 'جاري الحفظ...') : pick('Save Project', 'حفظ المشروع')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
