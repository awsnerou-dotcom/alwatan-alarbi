import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Eye, EyeOff, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useI18n } from '../../context/I18nContext';
import { useSite } from '../../context/SiteContext';
import { apiFetch } from '../../lib/api';
import { DEFAULT_REQUEST_FORM_CONFIG, normalizeRequestFormConfig } from '../../shared/requestRequirements';
import type {
  CustomRequestFormConfig,
  CustomRequestSection,
  CustomRequirementField,
  CustomRequirementFieldType,
} from '../../shared/types';

export function AdminRequestRequirements() {
  const { data, reloadAdmin } = useAdminData();
  const { refreshData } = useSite();
  const { pick } = useI18n();

  const [config, setConfig] = useState<CustomRequestFormConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.settings && !config) {
      setConfig(normalizeRequestFormConfig(data.settings.requestFormConfig));
    }
  }, [data, config]);

  if (!config || !data) {
    return <div className="p-6 text-sm text-slate-600">{pick('Loading requirements...', 'جاري التحميل...')}</div>;
  }

  const categories = data.categories || [];
  const sortedSections = [...config.sections].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setError(null);
    try {
      const normalized = {
        ...config,
        sections: sortedSections.map((sec, idx) => ({ ...sec, sortOrder: idx + 1 })),
      };
      await apiFetch('/api/admin/request-requirements', {
        method: 'PUT',
        body: JSON.stringify(normalized),
      });
      setConfig(normalized);
      await Promise.all([reloadAdmin(), refreshData()]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save requirements');
    } finally {
      setSaving(false);
    }
  }

  function updateSection(id: string, patch: Partial<CustomRequestSection>) {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
          }
        : prev,
    );
  }

  function moveSection(index: number, dir: -1 | 1) {
    const targetIdx = index + dir;
    if (targetIdx < 0 || targetIdx >= sortedSections.length) return;
    const next = [...sortedSections];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            sections: next.map((s, i) => ({ ...s, sortOrder: i + 1 })),
          }
        : prev,
    );
  }

  function addCustomSection() {
    const nextOrder = sortedSections.length + 1;
    const newSec: CustomRequestSection = {
      id: `sec-custom-${Date.now()}`,
      stepKey: 'custom',
      titleAr: 'سكشن متطلبات إضافي',
      titleEn: 'Additional Requirements',
      descriptionAr: 'تعبئة المواصفات الخاصة بهذا الجزء حسب احتياج المشروع.',
      descriptionEn: 'Fill out the specific requirements for this section.',
      enabled: true,
      sortOrder: nextOrder,
      appliesToCategories: [],
      builtInFields: [],
      customFields: [
        {
          id: `fld-${Date.now()}`,
          labelAr: 'تفاصيل إضافية مطلوبة',
          labelEn: 'Additional Specification',
          type: 'text',
          placeholderAr: 'اكتب التفاصيل هنا...',
          placeholderEn: 'Enter details...',
          required: false,
          enabled: true,
        },
      ],
    };
    setConfig((prev) => (prev ? { ...prev, sections: [...prev.sections, newSec] } : prev));
  }

  function deleteSection(id: string) {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.filter((s) => s.id !== id),
          }
        : prev,
    );
  }

  function addFieldToSection(sectionId: string) {
    const newField: CustomRequirementField = {
      id: `fld-${Date.now()}`,
      labelAr: 'متطلب جديد',
      labelEn: 'New Requirement',
      type: 'text',
      optionsAr: [],
      optionsEn: [],
      placeholderAr: '',
      placeholderEn: '',
      required: false,
      enabled: true,
    };
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === sectionId ? { ...s, customFields: [...(s.customFields || []), newField] } : s,
            ),
          }
        : prev,
    );
  }

  function updateFieldInSection(sectionId: string, fieldId: string, patch: Partial<CustomRequirementField>) {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    customFields: (s.customFields || []).map((f) => (f.id === fieldId ? { ...f, ...patch } : f)),
                  }
                : s,
            ),
          }
        : prev,
    );
  }

  function removeFieldFromSection(sectionId: string, fieldId: string) {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === sectionId
                ? { ...s, customFields: (s.customFields || []).filter((f) => f.id !== fieldId) }
                : s,
            ),
          }
        : prev,
    );
  }

  function toggleCategoryScope(section: CustomRequestSection, slug: string) {
    const current = section.appliesToCategories || [];
    const next = current.includes(slug) ? current.filter((c) => c !== slug) : [...current, slug];
    updateSection(section.id, { appliesToCategories: next });
  }

  function addEquipmentOption() {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            equipmentOptions: [
              ...prev.equipmentOptions,
              {
                key: `eq_${Date.now()}`,
                labelAr: 'تجهيز إضافي جديد',
                labelEn: 'New Equipment Item',
                enabled: true,
              },
            ],
          }
        : prev,
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {pick('Custom Design Request Requirements', 'متطلبات طلب التصميم')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {pick(
              'Configure the sections and fields customers fill out when requesting a custom build.',
              'أنشئ وعدّل السكشنات والحقول التي تظهر للعميل لتعبئتها في استمارة طلب التصميم المخصص.',
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setConfig(structuredClone(DEFAULT_REQUEST_FORM_CONFIG))}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>{pick('Reset Default', 'استعادة الافتراضي')}</span>
          </button>
          <button
            type="button"
            onClick={addCustomSection}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-900 bg-white px-4 text-xs font-semibold text-slate-900 hover:bg-slate-100 cursor-pointer"
          >
            <Plus size={14} />
            <span>{pick('Add New Section', 'إضافة سكشن جديد')}</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-amber-800 px-5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            <span>
              {saving
                ? pick('Saving...', 'جاري الحفظ...')
                : saved
                  ? pick('Saved Live', 'تم الحفظ وتحديث الموقع')
                  : pick('Save Requirements', 'حفظ وتطبيق على الموقع')}
            </span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>
      ) : null}

      {/* Sections List */}
      <div className="space-y-5">
        {sortedSections.map((sec, idx) => (
          <div
            key={sec.id}
            className={`rounded-xl border bg-white p-6 transition-opacity ${
              sec.enabled ? 'border-slate-200' : 'border-slate-200/70 bg-slate-50/60 opacity-80'
            }`}
          >
            {/* Section Header Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono-tabular flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
                  {idx + 1}
                </span>
                <div>
                  <span className="text-sm font-bold text-slate-900">{pick(sec.titleEn, sec.titleAr)}</span>
                  <span className="ms-2 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {sec.stepKey === 'custom'
                      ? pick('Custom Section', 'سكشن مخصص')
                      : pick('Core Section', 'سكشن أساسي')}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveSection(idx, -1)}
                  disabled={idx === 0}
                  title={pick('Move up', 'تحريك للأعلى')}
                  className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(idx, 1)}
                  disabled={idx === sortedSections.length - 1}
                  title={pick('Move down', 'تحريك للأسفل')}
                  className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => updateSection(sec.id, { enabled: !sec.enabled })}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                    sec.enabled
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-slate-300 bg-white text-slate-500'
                  }`}
                >
                  {sec.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
                  <span>{sec.enabled ? pick('Visible to Client', 'يظهر للعميل') : pick('Hidden', 'مخفي')}</span>
                </button>
                {sec.stepKey === 'custom' ? (
                  <button
                    type="button"
                    onClick={() => deleteSection(sec.id)}
                    className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50 cursor-pointer"
                    title={pick('Delete section', 'حذف السكشن')}
                  >
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Section Titles & Description */}
            <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
              <div>
                <label className="block font-semibold text-slate-700">{pick('Section Title (AR)', 'اسم السكشن بالعربية')}</label>
                <input
                  type="text"
                  dir="rtl"
                  value={sec.titleAr}
                  onChange={(e) => updateSection(sec.id, { titleAr: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700">{pick('Section Title (EN)', 'اسم السكشن بالإنجليزية')}</label>
                <input
                  type="text"
                  value={sec.titleEn}
                  onChange={(e) => updateSection(sec.id, { titleEn: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700">{pick('Client Helper Text (AR)', 'وصف مختصر للعميل')}</label>
                <input
                  type="text"
                  dir="rtl"
                  value={sec.descriptionAr || ''}
                  onChange={(e) => updateSection(sec.id, { descriptionAr: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Category Visibility Scope */}
            {sec.stepKey !== 'division_vehicle' && sec.stepKey !== 'contact_delivery' ? (
              <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-slate-700">
                    {pick('Show this section for:', 'إظهار هذا السكشن عند اختيار:')}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateSection(sec.id, { appliesToCategories: [] })}
                    className={`rounded px-2.5 py-1 font-semibold cursor-pointer ${
                      !sec.appliesToCategories || sec.appliesToCategories.length === 0
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-300'
                    }`}
                  >
                    {pick('All Categories', 'جميع الأقسام (افتراضي)')}
                  </button>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {categories.map((cat) => {
                    const active = (sec.appliesToCategories || []).includes(cat.slug);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategoryScope(sec, cat.slug)}
                        className={`rounded border px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${
                          active
                            ? 'border-amber-800 bg-amber-800 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                        }`}
                      >
                        {pick(cat.nameEn, cat.nameAr)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Built-in Fields Toggle */}
            {sec.builtInFields && sec.builtInFields.length > 0 ? (
              <div className="mt-4">
                <div className="text-xs font-bold text-slate-700">
                  {pick('Standard Fields in this Section', 'الحقول الأساسية داخل هذا السكشن')}
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {sec.builtInFields.map((bf, bfIdx) => (
                    <div
                      key={bf.key}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs"
                    >
                      <input
                        type="text"
                        dir="rtl"
                        value={bf.labelAr}
                        onChange={(e) => {
                          const next = [...(sec.builtInFields || [])];
                          next[bfIdx] = { ...bf, labelAr: e.target.value };
                          updateSection(sec.id, { builtInFields: next });
                        }}
                        className="min-w-0 flex-1 bg-transparent font-medium text-slate-800 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...(sec.builtInFields || [])];
                          next[bfIdx] = { ...bf, enabled: !bf.enabled };
                          updateSection(sec.id, { builtInFields: next });
                        }}
                        className={`shrink-0 rounded px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${
                          bf.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {bf.enabled ? pick('Active', 'مفعّل') : pick('Hidden', 'مخفي')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Custom Fields Builder */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {pick('Custom Requirement Fields', 'حقول المتطلبات المخصصة داخل السكشن')}
                </span>
                <button
                  type="button"
                  onClick={() => addFieldToSection(sec.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Plus size={12} />
                  <span>{pick('Add Field', 'إضافة حقل متطلب')}</span>
                </button>
              </div>

              {(sec.customFields || []).length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">
                  {pick('No custom fields added in this section yet.', 'لا توجد حقول إضافية مخصصة في هذا السكشن حالياً.')}
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {(sec.customFields || []).map((fld) => (
                    <div
                      key={fld.id}
                      className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 text-xs"
                    >
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                        <div className="sm:col-span-4">
                          <label className="block text-[11px] font-semibold text-slate-600">
                            {pick('Field Label (AR)', 'عنوان المتطلب (عربي)')}
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={fld.labelAr}
                            onChange={(e) => updateFieldInSection(sec.id, fld.id, { labelAr: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-600">
                            {pick('Field Label (EN)', 'العنوان (إنجليزي)')}
                          </label>
                          <input
                            type="text"
                            value={fld.labelEn}
                            onChange={(e) => updateFieldInSection(sec.id, fld.id, { labelEn: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-600">
                            {pick('Input Type', 'نوع الحقل')}
                          </label>
                          <select
                            value={fld.type}
                            onChange={(e) =>
                              updateFieldInSection(sec.id, fld.id, {
                                type: e.target.value as CustomRequirementFieldType,
                              })
                            }
                            className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                          >
                            <option value="text">{pick('Short Text', 'نص قصير')}</option>
                            <option value="textarea">{pick('Long Notes', 'نص طويل / تفاصيل')}</option>
                            <option value="number">{pick('Number / Measurement', 'رقم / مقاس')}</option>
                            <option value="select">{pick('Dropdown List', 'قائمة اختيار')}</option>
                            <option value="checkbox_group">{pick('Multiple Checkboxes', 'اختيارات متعددة')}</option>
                          </select>
                        </div>
                        <div className="flex items-end justify-end gap-2 sm:col-span-2">
                          <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={fld.required}
                              onChange={(e) => updateFieldInSection(sec.id, fld.id, { required: e.target.checked })}
                            />
                            <span>{pick('Required', 'إلزامي')}</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => removeFieldFromSection(sec.id, fld.id)}
                            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                            title={pick('Delete field', 'حذف الحقل')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {fld.type === 'select' || fld.type === 'checkbox_group' ? (
                        <div className="mt-2.5">
                          <label className="block text-[11px] font-semibold text-slate-600">
                            {pick('Options (separated by comma , or ،)', 'الخيارات (افصل بينها بفاصلة ، )')}
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={(fld.optionsAr || []).join('، ')}
                            onChange={(e) => {
                              const parsed = e.target.value
                                .split(/[,،]+/)
                                .map((s) => s.trim())
                                .filter(Boolean);
                              updateFieldInSection(sec.id, fld.id, { optionsAr: parsed, optionsEn: parsed });
                            }}
                            placeholder="مثال: خيار 1، خيار 2، خيار 3"
                            className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                          />
                        </div>
                      ) : (
                        <div className="mt-2.5">
                          <label className="block text-[11px] font-semibold text-slate-600">
                            {pick('Placeholder / Hint (AR)', 'نص توضيحي داخل الحقل (اختياري)')}
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={fld.placeholderAr || ''}
                            onChange={(e) =>
                              updateFieldInSection(sec.id, fld.id, {
                                placeholderAr: e.target.value,
                                placeholderEn: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Equipment Checklist Manager */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              {pick('Equipment & Add-ons Checklist', 'قائمة التجهيزات والإضافات السريعة')}
            </h2>
            <p className="text-xs text-slate-500">
              {pick(
                'Manage the quick-select accessories shown inside the Systems & Equipment section.',
                'تحكم في الإضافات التي يختار منها العميل داخل قسم الأنظمة والتجهيزات.',
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={addEquipmentOption}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Plus size={12} />
            <span>{pick('Add Item', 'إضافة تجهيز')}</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {config.equipmentOptions.map((eq, idx) => (
            <div key={eq.key} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5 text-xs">
              <input
                type="text"
                dir="rtl"
                value={eq.labelAr}
                onChange={(e) => {
                  const next = [...config.equipmentOptions];
                  next[idx] = { ...eq, labelAr: e.target.value };
                  setConfig({ ...config, equipmentOptions: next });
                }}
                className="min-w-0 flex-1 rounded border border-slate-200 px-2.5 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  const next = [...config.equipmentOptions];
                  next[idx] = { ...eq, enabled: !eq.enabled };
                  setConfig({ ...config, equipmentOptions: next });
                }}
                className={`shrink-0 rounded px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer ${
                  eq.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {eq.enabled ? pick('Active', 'مفعّل') : pick('Hidden', 'مخفي')}
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    equipmentOptions: config.equipmentOptions.filter((_, i) => i !== idx),
                  })
                }
                className="rounded p-1 text-slate-400 hover:text-red-600 cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
