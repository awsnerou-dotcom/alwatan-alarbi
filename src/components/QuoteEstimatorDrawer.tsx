import React, { useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, ChevronLeft, ChevronRight, MessageCircle, X } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useSite } from '../context/SiteContext';
import { apiFetch } from '../lib/api';
import { normalizeRequestFormConfig } from '../shared/requestRequirements';
import type { CustomAnswerEntry, CustomRequestSection, CustomRequirementField } from '../shared/types';

const VEHICLE_PRESETS = [
  { value: 'Toyota Land Cruiser GXR', labelEn: 'Toyota Land Cruiser GXR', labelAr: 'تويوتا لاندكروزر GXR' },
  { value: 'GMC Sierra / 2500', labelEn: 'GMC Sierra / 2500', labelAr: 'جمس سييرا / 2500' },
  { value: 'Toyota Hilux', labelEn: 'Toyota Hilux (Single / Double)', labelAr: 'تويوتا هايلكس (غمارة / غمارتين)' },
  { value: 'Nissan Patrol Platinum', labelEn: 'Nissan Patrol Platinum', labelAr: 'نيسان باترول بلاتينيوم' },
  { value: 'Ford F-Series / Stick', labelEn: 'Ford F-Series / Stick', labelAr: 'فورد F-Series / ستيك' },
  { value: 'Suzuki Carry / Van', labelEn: 'Suzuki Carry / Commercial Van', labelAr: 'سوزوكي / فان تجاري' },
  { value: 'Mercedes Sprinter / Chassis', labelEn: 'Mercedes Sprinter / Truck', labelAr: 'مرسيدس سبرنتر / شاصيه' },
  { value: 'Tank 500 / Haval', labelEn: 'Tank 500 / Haval SUV', labelAr: 'تانك 500 / هافال' },
  { value: 'Standalone Towable Caravan', labelEn: 'Standalone Towable Caravan', labelAr: 'كرفان مقطورة سحب مستقلة' },
];

export function QuoteEstimatorDrawer() {
  const { pick, isRtl } = useI18n();
  const { categories, settings, quoteDrawerOpen, quotePreset, closeQuoteDrawer } = useSite();

  const formConfig = useMemo(
    () => normalizeRequestFormConfig(settings?.requestFormConfig),
    [settings?.requestFormConfig],
  );

  const [stepIndex, setStepIndex] = useState(0);

  // Built-in Vehicle & Division state
  const [categorySlug, setCategorySlug] = useState('caravan-projects');
  const [projectTitle, setProjectTitle] = useState('');
  const [vehiclePreset, setVehiclePreset] = useState('GMC Sierra / 2500');
  const [customVehicleName, setCustomVehicleName] = useState('');
  const [vehicleYear, setVehicleYear] = useState('2026');
  const [vehicleStatus, setVehicleStatus] = useState('client_provides_vehicle');

  // Built-in Structure, Dimensions & Finish
  const [roofHeightProfile, setRoofHeightProfile] = useState('raised_20');
  const [bodyMaterial, setBodyMaterial] = useState('5083_marine_aluminum');
  const [lengthMeters, setLengthMeters] = useState(5.2);
  const [widthMeters, setWidthMeters] = useState(2.1);
  const [insulationTier, setInsulationTier] = useState<'standard' | 'gcc_thermal' | 'expedition_pro'>('gcc_thermal');
  const [exteriorColor, setExteriorColor] = useState('factory_match');

  // Built-in Tanks, Power, AC & Equipment
  const [capacityLiters, setCapacityLiters] = useState(300);
  const [tankMaterial, setTankMaterial] = useState('stainless_304');
  const [fuelTankLiters, setFuelTankLiters] = useState(90);
  const [powerSystem, setPowerSystem] = useState('solar_lifepo4');
  const [acSystem, setAcSystem] = useState('rooftop_12v_24v');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['heavy_drawers', 'led_package']);

  // Built-in Client & Delivery
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Qatar');
  const [city, setCity] = useState('الدوحة');
  const [targetTimeline, setTargetTimeline] = useState('flexible');
  const [notes, setNotes] = useState('');

  // Dynamic Custom Fields Answers (keyed by field.id)
  const [customAnswersState, setCustomAnswersState] = useState<Record<string, string | string[]>>({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  const activeSections = useMemo(() => {
    return formConfig.sections.filter((sec) => {
      if (!sec.enabled) return false;
      if (sec.appliesToCategories && sec.appliesToCategories.length > 0) {
        return sec.appliesToCategories.includes(categorySlug);
      }
      return true;
    });
  }, [formConfig.sections, categorySlug]);

  useEffect(() => {
    if (stepIndex >= activeSections.length && activeSections.length > 0) {
      setStepIndex(activeSections.length - 1);
    }
  }, [activeSections.length, stepIndex]);

  useEffect(() => {
    if (quoteDrawerOpen) {
      setStepIndex(0);
      setReferenceCode(null);
      setError(null);
      if (quotePreset) {
        if (quotePreset.categorySlug) setCategorySlug(quotePreset.categorySlug);
        if (quotePreset.projectTitle) setProjectTitle(quotePreset.projectTitle);
        if (quotePreset.lengthMeters) setLengthMeters(quotePreset.lengthMeters);
        if (quotePreset.capacityLiters) setCapacityLiters(quotePreset.capacityLiters);
      } else if (categories.length > 0 && !categories.some((c) => c.slug === categorySlug)) {
        setCategorySlug(categories[0].slug);
      }
    }
  }, [quotePreset, quoteDrawerOpen, categories]);

  const effectiveVehicle =
    vehiclePreset === 'other' ? customVehicleName || pick('Custom Chassis', 'مركبة مخصصة') : vehiclePreset;

  const offGridPackage = powerSystem === 'solar_lifepo4' || powerSystem === 'silent_generator';
  const enabledEquipment = formConfig.equipmentOptions.filter((eq) => eq.enabled);

  if (!quoteDrawerOpen) return null;

  const selectedCat = categories.find((c) => c.slug === categorySlug);
  const currentSection = activeSections[stepIndex] || activeSections[0];
  const isLastStep = stepIndex >= activeSections.length - 1;

  function isFieldEnabled(sec: CustomRequestSection, key: string): boolean {
    if (!sec.builtInFields || sec.builtInFields.length === 0) return true;
    const found = sec.builtInFields.find((f) => f.key === key);
    return found ? found.enabled : true;
  }

  function getFieldLabel(sec: CustomRequestSection, key: string, fallbackEn: string, fallbackAr: string): string {
    const found = sec.builtInFields?.find((f) => f.key === key);
    if (!found) return pick(fallbackEn, fallbackAr);
    return pick(found.labelEn || fallbackEn, found.labelAr || fallbackAr);
  }

  function toggleFeature(key: string) {
    setSelectedFeatures((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  }

  function toggleCheckboxOption(fieldId: string, optionLabel: string) {
    setCustomAnswersState((prev) => {
      const current = Array.isArray(prev[fieldId]) ? (prev[fieldId] as string[]) : [];
      const next = current.includes(optionLabel)
        ? current.filter((item) => item !== optionLabel)
        : [...current, optionLabel];
      return { ...prev, [fieldId]: next };
    });
  }

  function collectFormattedCustomAnswers(): CustomAnswerEntry[] {
    const entries: CustomAnswerEntry[] = [];
    for (const sec of activeSections) {
      for (const fld of sec.customFields || []) {
        if (!fld.enabled) continue;
        const raw = customAnswersState[fld.id];
        const valueStr = Array.isArray(raw) ? raw.join('، ') : String(raw || '').trim();
        if (valueStr) {
          entries.push({
            sectionTitle: pick(sec.titleEn, sec.titleAr),
            label: pick(fld.labelEn || fld.labelAr, fld.labelAr),
            value: valueStr,
          });
        }
      }
    }
    return entries;
  }

  function validateSectionRequired(sec: CustomRequestSection): string | null {
    for (const fld of sec.customFields || []) {
      if (!fld.enabled || !fld.required) continue;
      const raw = customAnswersState[fld.id];
      const empty = Array.isArray(raw) ? raw.length === 0 : !String(raw || '').trim();
      if (empty) {
        return pick(
          `Please complete the required field: ${fld.labelEn || fld.labelAr}`,
          `يرجى تعبئة الحقل الإلزامي: ${fld.labelAr}`,
        );
      }
    }
    return null;
  }

  function buildWhatsappSummary(refCode: string) {
    const featureNames = selectedFeatures
      .map((k) => {
        const found = formConfig.equipmentOptions.find((o) => o.key === k);
        return found ? pick(found.labelEn, found.labelAr) : k;
      })
      .join('، ');

    const lines = [
      pick(`Al Watan Al Arabi — Custom Design Request (${refCode})`, `مصنع الوطن العربي — طلب تصميم مخصص (${refCode})`),
      `${pick('Division', 'القسم')}: ${selectedCat ? pick(selectedCat.nameEn, selectedCat.nameAr) : categorySlug}`,
      `${pick('Model / Reference', 'الموديل المرجعي')}: ${projectTitle || '-'}`,
      `${pick('Vehicle', 'المركبة')}: ${effectiveVehicle} (${vehicleYear})`,
      `${pick('Roof / Profile', 'مستوى السقف')}: ${roofHeightProfile}`,
      `${pick('Dimensions', 'الأبعاد')}: ${lengthMeters.toFixed(1)}m × ${widthMeters.toFixed(1)}m`,
      `${pick('Water / Fuel Tanks', 'الخزانات')}: ${capacityLiters}L ${pick('Water', 'ماء')} + ${fuelTankLiters}L ${pick('Fuel', 'وقود')}`,
      `${pick('Power & AC', 'الطاقة والتكييف')}: ${powerSystem} / ${acSystem}`,
      `${pick('Equipment', 'التجهيزات')}: ${featureNames || '-'}`,
    ];

    const customEntries = collectFormattedCustomAnswers();
    for (const item of customEntries) {
      lines.push(`${item.label}: ${item.value}`);
    }

    lines.push(`${pick('Client', 'العميل')}: ${customerName} (${phone})`);
    return `https://wa.me/${settings?.contact.whatsapp || '97455123456'}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    for (const sec of activeSections) {
      const msg = validateSectionRequired(sec);
      if (msg) {
        setError(msg);
        return;
      }
    }

    if (!customerName.trim() || (!phone.trim() && !email.trim())) {
      setError(
        pick(
          'Please enter your full name and phone number or email address.',
          'يرجى إدخال الاسم الكامل ورقم الهاتف أو البريد الإلكتروني.',
        ),
      );
      return;
    }

    setSubmitting(true);
    try {
      const featureLabels = selectedFeatures.map((k) => {
        const f = formConfig.equipmentOptions.find((o) => o.key === k);
        return f ? f.labelAr : k;
      });
      const customAnswers = collectFormattedCustomAnswers();

      const res = await apiFetch<{ quote: { referenceCode: string } }>('/api/quotes', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          companyName,
          email,
          phone,
          country,
          categorySlug,
          projectTitle:
            projectTitle ||
            `${selectedCat ? selectedCat.nameAr : categorySlug} — ${effectiveVehicle}`,
          lengthMeters,
          capacityLiters,
          insulationTier,
          offGridPackage,
          estimatedPriceQar: 0,
          estimatedLeadWeeks: 0,
          customSpecs: {
            vehicleMakeModel: effectiveVehicle,
            vehicleYear,
            vehicleStatus,
            roofHeightProfile,
            bodyMaterial,
            widthMeters,
            exteriorColor,
            tankMaterial,
            fuelTankLiters,
            powerSystem,
            acSystem,
            selectedFeatures: featureLabels,
            targetTimeline,
            city,
            customAnswers,
          },
          notes,
        }),
      });
      setReferenceCode(res.quote.referenceCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  function renderCustomFields(fields: CustomRequirementField[]) {
    const visibleFields = fields.filter((f) => f.enabled);
    if (visibleFields.length === 0) return null;

    return (
      <div className="space-y-4 border-t border-zinc-200 pt-4">
        {visibleFields.map((fld) => {
          const val = customAnswersState[fld.id];
          const labelText = `${pick(fld.labelEn || fld.labelAr, fld.labelAr)}${fld.required ? ' *' : ''}`;
          const options = isRtl
            ? fld.optionsAr || fld.optionsEn || []
            : fld.optionsEn || fld.optionsAr || [];

          if (fld.type === 'textarea') {
            return (
              <div key={fld.id}>
                <label className="block text-xs font-semibold text-zinc-700">{labelText}</label>
                <textarea
                  rows={3}
                  required={fld.required}
                  value={typeof val === 'string' ? val : ''}
                  onChange={(e) => setCustomAnswersState((p) => ({ ...p, [fld.id]: e.target.value }))}
                  placeholder={pick(fld.placeholderEn || '', fld.placeholderAr || '')}
                  className="mt-1.5 w-full rounded-[3px] border border-zinc-300 px-3.5 py-2 text-sm focus:border-[#09090B] focus:outline-none"
                />
              </div>
            );
          }

          if (fld.type === 'number') {
            return (
              <div key={fld.id}>
                <label className="block text-xs font-semibold text-zinc-700">{labelText}</label>
                <input
                  type="number"
                  required={fld.required}
                  value={typeof val === 'string' ? val : ''}
                  onChange={(e) => setCustomAnswersState((p) => ({ ...p, [fld.id]: e.target.value }))}
                  placeholder={pick(fld.placeholderEn || '', fld.placeholderAr || '')}
                  className="font-mono-tabular mt-1.5 w-full rounded-[3px] border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-[#09090B] focus:outline-none"
                />
              </div>
            );
          }

          if (fld.type === 'select') {
            return (
              <div key={fld.id}>
                <label className="block text-xs font-semibold text-zinc-700">{labelText}</label>
                <select
                  required={fld.required}
                  value={typeof val === 'string' ? val : ''}
                  onChange={(e) => setCustomAnswersState((p) => ({ ...p, [fld.id]: e.target.value }))}
                  className="mt-1.5 w-full rounded-[3px] border border-zinc-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#09090B] focus:outline-none"
                >
                  <option value="">{pick('Select option...', 'اختر من القائمة...')}</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (fld.type === 'checkbox_group') {
            const selectedArr = Array.isArray(val) ? val : [];
            return (
              <div key={fld.id}>
                <label className="block text-xs font-semibold text-zinc-700">{labelText}</label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {options.map((opt) => {
                    const checked = selectedArr.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleCheckboxOption(fld.id, opt)}
                        className={`flex items-center justify-between rounded-[3px] border px-3 py-2 text-start text-xs font-semibold transition-colors cursor-pointer ${
                          checked
                            ? 'border-[#09090B] bg-zinc-900 text-white'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                        }`}
                      >
                        <span>{opt}</span>
                        {checked ? <Check size={14} className="shrink-0 text-[#B5945B]" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <div key={fld.id}>
              <label className="block text-xs font-semibold text-zinc-700">{labelText}</label>
              <input
                type="text"
                required={fld.required}
                value={typeof val === 'string' ? val : ''}
                onChange={(e) => setCustomAnswersState((p) => ({ ...p, [fld.id]: e.target.value }))}
                placeholder={pick(fld.placeholderEn || '', fld.placeholderAr || '')}
                className="mt-1.5 w-full rounded-[3px] border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-[#09090B] focus:outline-none"
              />
            </div>
          );
        })}
      </div>
    );
  }

  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-[2px]">
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold text-[#8A6D3B]">
              {pick('Technical Specification Form', 'استمارة المواصفات الفنية والهندسية')}
            </p>
            <h2 className="font-display text-lg font-bold text-[#09090B]">
              {pick('Custom Design Request', 'طلب تصميم مخصص')}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeQuoteDrawer}
            aria-label="Close configurator"
            className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-zinc-200 text-zinc-600 hover:bg-zinc-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Step Navigation */}
        {!referenceCode ? (
          <div className="border-b border-zinc-200 bg-zinc-50 px-6 pt-3">
            <p className="pb-2.5 text-xs text-zinc-500">
              {pick(
                'Pricing and production timeline are determined after our engineers review your specifications.',
                'يتم تحديد التكلفة المالية وفترة التنفيذ بعد مراجعة المواصفات مع الفريق الهندسي.',
              )}
            </p>
            <div className="-mb-px flex gap-4 overflow-x-auto border-t border-zinc-200 pt-1">
              {activeSections.map((sec, idx) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStepIndex(idx);
                  }}
                  className={`border-b-2 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    stepIndex === idx
                      ? 'border-[#09090B] text-[#09090B]'
                      : 'border-transparent text-zinc-500 hover:text-[#09090B]'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}. {pick(sec.titleEn, sec.titleAr)}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {referenceCode ? (
            <div className="space-y-6">
              <div className="rounded-[3px] border border-emerald-200 bg-emerald-50/70 p-6">
                <div className="flex items-center gap-3 text-emerald-800">
                  <CheckCircle2 size={24} />
                  <h3 className="font-display text-lg font-bold">
                    {pick('Specification Request Received', 'تم تسجيل طلب التصميم بنجاح')}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-zinc-700">
                  {pick(
                    'Our Doha fabrication engineers have received your complete build configuration and will contact you with the official quotation and schedule.',
                    'وصلت مواصفات التصميم الكاملة إلى فريق الهندسة والتصنيع في مصنع الوطن العربي بالدوحة، وسيتم التواصل معك لتحديد التكلفة وفترة التنفيذ المعتمدة.',
                  )}
                </p>
                <div className="mt-4 rounded-[3px] border border-emerald-200 bg-white p-4">
                  <div className="text-xs text-zinc-500">{pick('Reference Code', 'رقم المرجع الهندسي')}</div>
                  <div className="font-mono-tabular mt-1 text-lg font-bold text-[#09090B]">{referenceCode}</div>
                  <div className="mt-2 text-xs text-zinc-600 tabular-nums">
                    {effectiveVehicle} · {lengthMeters.toFixed(1)}m × {widthMeters.toFixed(1)}m
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={buildWhatsappSummary(referenceCode)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[3px] bg-[#128C7E] px-5 text-sm font-semibold text-white hover:bg-[#0E7468]"
                >
                  <MessageCircle size={16} />
                  <span>{pick('Send Spec Sheet via WhatsApp', 'إرسال ملخص المواصفات عبر واتساب')}</span>
                </a>
                <button
                  type="button"
                  onClick={closeQuoteDrawer}
                  className="h-11 rounded-[3px] border border-zinc-300 bg-white px-5 text-sm font-semibold text-[#09090B] hover:border-[#09090B] cursor-pointer"
                >
                  {pick('Close', 'إغلاق')}
                </button>
              </div>
            </div>
          ) : currentSection ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentSection.descriptionAr || currentSection.descriptionEn ? (
                <div className="rounded-[3px] border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs text-zinc-600">
                  {pick(currentSection.descriptionEn || '', currentSection.descriptionAr || '')}
                </div>
              ) : null}

              {/* SECTION TYPE 1: Division & Vehicle */}
              {currentSection.stepKey === 'division_vehicle' ? (
                <div className="space-y-5">
                  {isFieldEnabled(currentSection, 'category') ? (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">
                        {getFieldLabel(currentSection, 'category', 'Manufacturing Division *', 'القسم الهندسي المطلوب *')}
                      </label>
                      <select
                        value={categorySlug}
                        onChange={(e) => setCategorySlug(e.target.value)}
                        className="mt-1.5 w-full rounded-[3px] border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-[#09090B] focus:border-[#09090B] focus:outline-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.slug}>
                            {pick(cat.nameEn, cat.nameAr)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {isFieldEnabled(currentSection, 'modelRef') ? (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">
                        {getFieldLabel(currentSection, 'modelRef', 'Reference Model / Project Name', 'الموديل المرجعي أو عنوان الطلب')}
                      </label>
                      <input
                        type="text"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder={pick('e.g. GMC Raised Roof +45cm or Custom Coffee Van', 'مثال: شد جمس فوق مستوى العمارة 45 أو كرفان خاص')}
                        className="mt-1.5 w-full rounded-[3px] border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-[#09090B] focus:outline-none"
                      />
                    </div>
                  ) : null}

                  {isFieldEnabled(currentSection, 'vehicleInfo') ? (
                    <>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-zinc-700">
                            {getFieldLabel(currentSection, 'vehicleInfo', 'Base Vehicle / Chassis *', 'نوع المركبة / الشاصيه *')}
                          </label>
                          <select
                            value={vehiclePreset}
                            onChange={(e) => setVehiclePreset(e.target.value)}
                            className="mt-1.5 w-full rounded-[3px] border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-[#09090B] focus:outline-none"
                          >
                            {VEHICLE_PRESETS.map((v) => (
                              <option key={v.value} value={v.value}>
                                {pick(v.labelEn, v.labelAr)}
                              </option>
                            ))}
                            <option value="other">{pick('Other Vehicle (Specify)', 'مركبة أخرى (تحديد يدوي)')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700">
                            {pick('Model Year', 'سنة الصنع')}
                          </label>
                          <select
                            value={vehicleYear}
                            onChange={(e) => setVehicleYear(e.target.value)}
                            className="font-mono-tabular mt-1.5 w-full rounded-[3px] border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-[#09090B] focus:outline-none"
                          >
                            {['2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', 'أخرى'].map((yr) => (
                              <option key={yr} value={yr}>
                                {yr}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {vehiclePreset === 'other' ? (
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700">
                            {pick('Specify Vehicle Brand & Model *', 'اكتب نوع وموديل المركبة *')}
                          </label>
                          <input
                            type="text"
                            required
                            value={customVehicleName}
                            onChange={(e) => setCustomVehicleName(e.target.value)}
                            placeholder={pick('e.g. RAM 2500 Power Wagon', 'مثال: دودج رام 2500 غمارتين')}
                            className="mt-1.5 w-full rounded-[3px] border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-[#09090B] focus:outline-none"
                          />
                        </div>
                      ) : null}
                    </>
                  ) : null}

                  {isFieldEnabled(currentSection, 'vehicleStatus') ? (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">
                        {getFieldLabel(currentSection, 'vehicleStatus', 'Vehicle Supply Status', 'حالة توفير المركبة')}
                      </label>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {[
                          { key: 'client_provides_vehicle', label: pick('Client Supplies Vehicle', 'المركبة متوفرة لدي') },
                          { key: 'factory_sources_vehicle', label: pick('Factory Sources + Builds', 'توفير المركبة والتجهيز') },
                          { key: 'upgrade_existing', label: pick('Upgrade Existing Build', 'تعديل على تجهيز قائم') },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setVehicleStatus(opt.key)}
                            className={`rounded-[3px] border px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                              vehicleStatus === opt.key
                                ? 'border-[#09090B] bg-[#09090B] text-white'
                                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* SECTION TYPE 2: Body & Dimensions */}
              {currentSection.stepKey === 'body_dimensions' ? (
                <div className="space-y-5">
                  {isFieldEnabled(currentSection, 'roofHeight') ? (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">
                        {getFieldLabel(currentSection, 'roofHeight', 'Roof Height / Canopy Profile', 'ارتفاع السقف ومستوى الشد')}
                      </label>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {[
                          { key: 'standard_level', label: pick('Standard Cabin Level', 'على مستوى العمارة / الغمارة') },
                          { key: 'raised_20', label: pick('Raised +20 cm', 'فوق مستوى العمارة (+20 سم)') },
                          { key: 'raised_45', label: pick('High Roof +45 cm', 'فوق مستوى العمارة (+45 سم)') },
                          { key: 'single_monoblock', label: pick('Single Cabin Monoblock', 'كتلة واحدة متصلة') },
                          { key: 'balcony_caravan', label: pick('Caravan / Rear Balcony', 'تصميم كرفان مع بلكونة خلفية') },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setRoofHeightProfile(opt.key)}
                            className={`rounded-[3px] border px-3 py-2.5 text-start text-xs font-semibold transition-colors cursor-pointer ${
                              roofHeightProfile === opt.key
                                ? 'border-[#09090B] bg-[#09090B] text-white'
                                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {isFieldEnabled(currentSection, 'dimensions') ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                          <span>{pick('Body Length (Meters)', 'الطول المطلوب (متر)')}</span>
                          <span className="font-mono-tabular text-[#09090B]">{lengthMeters.toFixed(1)} m</span>
                        </label>
                        <input
                          type="range"
                          min="1.5"
                          max="9.0"
                          step="0.1"
                          value={lengthMeters}
                          onChange={(e) => setLengthMeters(Number(e.target.value))}
                          className="mt-2 w-full accent-[#09090B]"
                        />
                      </div>
                      <div>
                        <label className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                          <span>{pick('Body Width (Meters)', 'العرض المطلوب (متر)')}</span>
                          <span className="font-mono-tabular text-[#09090B]">{widthMeters.toFixed(1)} m</span>
                        </label>
                        <input
                          type="range"
                          min="1.4"
                          max="2.6"
                          step="0.1"
                          value={widthMeters}
                          onChange={(e) => setWidthMeters(Number(e.target.value))}
                          className="mt-2 w-full accent-[#09090B]"
                        />
                      </div>
                    </div>
                  ) : null}

                  {isFieldEnabled(currentSection, 'materialAndPaint') ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700">
                          {pick('Primary Structural Material', 'مادة تصنيع الهيكل')}
                        </label>
                        <select
                          value={bodyMaterial}
                          onChange={(e) => setBodyMaterial(e.target.value)}
                          className="mt-1.5 w-full rounded-[3px] border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-[#09090B] focus:outline-none"
                        >
                          <option value="5083_marine_aluminum">
                            {pick('5083 Marine-Grade Aluminum', 'ألمنيوم بحري 5083 مقاوم للصدأ')}
                          </option>
                          <option value="fiberglass_composite">
                            {pick('Insulated Fiberglass Shell', 'فايبر جلاس معزول حرارياً')}
                          </option>
                          <option value="stainless_304">
                            {pick('304 Food-Grade Stainless Steel', 'ستانلس ستيل 304 للمطابخ والكوفي')}
                          </option>
                          <option value="galvanized_hybrid">
                            {pick('Galvanized Steel Frame + Aluminum', 'شاصيه حديد مجلفن + ألواح ألمنيوم')}
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700">
                          {pick('Exterior Paint & Finish', 'الدهان والتشطيب الخارجي')}
                        </label>
                        <select
                          value={exteriorColor}
                          onChange={(e) => setExteriorColor(e.target.value)}
                          className="mt-1.5 w-full rounded-[3px] border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-[#09090B] focus:outline-none"
                        >
                          <option value="factory_match">{pick('Match OEM Vehicle Color', 'مطابق للون الوكالة')}</option>
                          <option value="factory_white">{pick('Factory Gloss White', 'أبيض مصنعي لامع')}</option>
                          <option value="desert_sand">{pick('Desert Sand Matte', 'رملي صحراوي مطفي')}</option>
                          <option value="raptor_black">{pick('Raptor Textured Black', 'أسود رابتر مقاوم للخدش')}</option>
                          <option value="custom_two_tone">{pick('Custom Two-Tone Paint', 'تخصيص لونين حسب الطلب')}</option>
                        </select>
                      </div>
                    </div>
                  ) : null}

                  {isFieldEnabled(currentSection, 'insulation') ? (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">
                        {getFieldLabel(currentSection, 'insulation', 'Thermal Insulation Specification', 'مستوى العزل الحراري ومقاومة الغبار')}
                      </label>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {[
                          { key: 'standard', label: pick('Standard', 'عزل قياسي') },
                          { key: 'gcc_thermal', label: pick('GCC Thermal', 'عزل خليجي مضاعف') },
                          { key: 'expedition_pro', label: pick('Expedition Pro', 'عزل صحراوي متقدم') },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setInsulationTier(opt.key as typeof insulationTier)}
                            className={`rounded-[3px] border px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                              insulationTier === opt.key
                                ? 'border-[#09090B] bg-[#09090B] text-white'
                                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* SECTION TYPE 3: Systems & Gear */}
              {currentSection.stepKey === 'systems_gear' ? (
                <div className="space-y-5">
                  {isFieldEnabled(currentSection, 'waterTank') ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                          <span>{pick('Water Tank Capacity', 'سعة خزان الماء')}</span>
                          <span className="font-mono-tabular text-[#09090B]">{capacityLiters} L</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          step="25"
                          value={capacityLiters}
                          onChange={(e) => setCapacityLiters(Number(e.target.value))}
                          className="mt-2 w-full accent-[#09090B]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700">
                          {pick('Tank Material', 'مادة الخزان')}
                        </label>
                        <select
                          value={tankMaterial}
                          onChange={(e) => setTankMaterial(e.target.value)}
                          className="mt-1.5 w-full rounded-[3px] border border-zinc-300 bg-white px-2.5 py-2 text-xs focus:border-[#09090B] focus:outline-none"
                        >
                          <option value="stainless_304">{pick('Stainless 304', 'ستانلس 304')}</option>
                          <option value="aluminum">{pick('Aluminum', 'ألمنيوم')}</option>
                          <option value="fiberglass">{pick('Fiberglass', 'فايبر جلاس')}</option>
                        </select>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {isFieldEnabled(currentSection, 'fuelTank') ? (
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700">
                          {pick('Auxiliary Fuel / Diesel Tank', 'خزان وقود / ديزل إضافي')}
                        </label>
                        <select
                          value={fuelTankLiters}
                          onChange={(e) => setFuelTankLiters(Number(e.target.value))}
                          className="mt-1.5 w-full rounded-[3px] border border-zinc-300 bg-white px-3 py-2 text-xs focus:border-[#09090B] focus:outline-none"
                        >
                          <option value={0}>{pick('None', 'بدون')}</option>
                          <option value={90}>90 {pick('Liters', 'لتر')}</option>
                          <option value={140}>140 {pick('Liters', 'لتر')}</option>
                          <option value={220}>220 {pick('Liters', 'لتر')}</option>
                        </select>
                      </div>
                    ) : null}

                    {isFieldEnabled(currentSection, 'powerSystem') ? (
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700">
                          {pick('Electrical & Solar Power', 'منظومة الكهرباء والطاقة')}
                        </label>
                        <select
                          value={powerSystem}
                          onChange={(e) => setPowerSystem(e.target.value)}
                          className="mt-1.5 w-full rounded-[3px] border border-zinc-300 bg-white px-3 py-2 text-xs focus:border-[#09090B] focus:outline-none"
                        >
                          <option value="basic_12v">{pick('Basic 12V Wiring', 'تمديد 12V أساسي')}</option>
                          <option value="dual_battery_inverter">{pick('Dual Battery + 2000W Inverter', 'بطارية إضافية + محول 2000W')}</option>
                          <option value="solar_lifepo4">{pick('1200W Solar + LiFePO4 Lithium', 'طاقة شمسية + ليثيوم LiFePO4')}</option>
                          <option value="silent_generator">{pick('Silent Generator + Shore Power', 'مولد صامت لمشاريع الكوفي')}</option>
                        </select>
                      </div>
                    ) : null}

                    {isFieldEnabled(currentSection, 'acSystem') ? (
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700">
                          {pick('Cooling & Ventilation', 'التكييف والتهوية')}
                        </label>
                        <select
                          value={acSystem}
                          onChange={(e) => setAcSystem(e.target.value)}
                          className="mt-1.5 w-full rounded-[3px] border border-zinc-300 bg-white px-3 py-2 text-xs focus:border-[#09090B] focus:outline-none"
                        >
                          <option value="none">{pick('None', 'بدون تكييف')}</option>
                          <option value="rooftop_12v_24v">{pick('12V/24V Rooftop AC', 'مكيف سقفي للرحلات')}</option>
                          <option value="split_insulated">{pick('Split AC Unit', 'وحدة سبليت معزولة')}</option>
                          <option value="industrial_vent">{pick('Exhaust & Ventilation Fans', 'شفاطات وتهوية للخيل/الكوفي')}</option>
                        </select>
                      </div>
                    ) : null}
                  </div>

                  {isFieldEnabled(currentSection, 'equipmentChecklist') && enabledEquipment.length > 0 ? (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">
                        {getFieldLabel(
                          currentSection,
                          'equipmentChecklist',
                          'Custom Interior & Exterior Equipment',
                          'التجهيزات والإضافات الهندسية المخصصة',
                        )}
                      </label>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {enabledEquipment.map((feat) => {
                          const checked = selectedFeatures.includes(feat.key);
                          return (
                            <button
                              key={feat.key}
                              type="button"
                              onClick={() => toggleFeature(feat.key)}
                              className={`flex items-center justify-between rounded-[3px] border px-3 py-2.5 text-start text-xs font-semibold transition-colors cursor-pointer ${
                                checked
                                  ? 'border-[#09090B] bg-zinc-900 text-white'
                                  : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                              }`}
                            >
                              <span>{pick(feat.labelEn, feat.labelAr)}</span>
                              {checked ? <Check size={14} className="shrink-0 text-[#B5945B]" /> : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* SECTION TYPE 4: Contact & Delivery */}
              {currentSection.stepKey === 'contact_delivery' ? (
                <div className="space-y-5">
                  {isFieldEnabled(currentSection, 'summaryBox') ? (
                    <div className="rounded-[3px] border border-zinc-200 bg-zinc-50 p-4 text-xs">
                      <div className="font-semibold text-[#09090B]">
                        {pick('Technical Configuration Summary', 'ملخص المواصفات المختارة')}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-y-1.5 text-zinc-600">
                        <span>{pick('Division:', 'القسم:')} {selectedCat ? pick(selectedCat.nameEn, selectedCat.nameAr) : categorySlug}</span>
                        <span>{pick('Vehicle:', 'المركبة:')} {effectiveVehicle} ({vehicleYear})</span>
                        <span>{pick('Dimensions:', 'الأبعاد:')} {lengthMeters.toFixed(1)}m × {widthMeters.toFixed(1)}m</span>
                        <span>{pick('Tanks:', 'الخزانات:')} {capacityLiters}L + {fuelTankLiters}L</span>
                      </div>
                      {selectedFeatures.length > 0 ? (
                        <div className="mt-2 border-t border-zinc-200 pt-2 text-zinc-600">
                          {pick('Selected Gear:', 'التجهيزات:')} {selectedFeatures.length} {pick('items', 'إضافات')}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">
                        {pick('Full Name *', 'الاسم الكامل *')}
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={pick('e.g. Abdullah Al-Marri', 'مثال: عبد الله المري')}
                        className="mt-1 w-full rounded-[3px] border border-zinc-300 px-3 py-2 text-sm focus:border-[#09090B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">
                        {pick('Company / Private', 'الشركة / الجهة')}
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder={pick('Optional', 'اختياري')}
                        className="mt-1 w-full rounded-[3px] border border-zinc-300 px-3 py-2 text-sm focus:border-[#09090B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">
                        {pick('Phone / WhatsApp *', 'رقم الهاتف / واتساب *')}
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+974 5500 0000"
                        className="mt-1 w-full rounded-[3px] border border-zinc-300 px-3 py-2 text-sm focus:border-[#09090B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">
                        {pick('Email Address *', 'البريد الإلكتروني *')}
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.qa"
                        className="mt-1 w-full rounded-[3px] border border-zinc-300 px-3 py-2 text-sm focus:border-[#09090B] focus:outline-none"
                      />
                    </div>
                  </div>

                  {isFieldEnabled(currentSection, 'locationPriority') ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700">
                          {pick('Country', 'الدولة')}
                        </label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="mt-1 w-full rounded-[3px] border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-[#09090B] focus:outline-none"
                        >
                          <option value="Qatar">قطر / Qatar</option>
                          <option value="Saudi Arabia">السعودية / KSA</option>
                          <option value="Kuwait">الكويت / Kuwait</option>
                          <option value="UAE">الإمارات / UAE</option>
                          <option value="Oman">عُمان / Oman</option>
                          <option value="Bahrain">البحرين / Bahrain</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700">
                          {pick('City', 'المدينة')}
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="mt-1 w-full rounded-[3px] border border-zinc-300 px-3 py-2 text-sm focus:border-[#09090B] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700">
                          {pick('Execution Priority', 'أولوية التنفيذ المطلوبة')}
                        </label>
                        <select
                          value={targetTimeline}
                          onChange={(e) => setTargetTimeline(e.target.value)}
                          className="mt-1 w-full rounded-[3px] border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-[#09090B] focus:outline-none"
                        >
                          <option value="asap">{pick('As soon as possible', 'في أقرب وقت ممكن')}</option>
                          <option value="flexible">{pick('Per factory schedule', 'حسب جدول التصنيع بالمصنع')}</option>
                          <option value="exhibition_season">{pick('Season / Exhibition Ready', 'تجهيز للموسم والمعارض')}</option>
                          <option value="specific_date">{pick('Specific target date (in notes)', 'موعد محدد (يُذكر في الملاحظات)')}</option>
                        </select>
                      </div>
                    </div>
                  ) : null}

                  {isFieldEnabled(currentSection, 'notes') ? (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">
                        {pick('Engineering Notes & Custom Layout Instructions', 'ملاحظات هندسية أو تفاصيل تقسيم داخلي خاصة')}
                      </label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={pick(
                          'Describe door positions, bed/majlis dimensions, equipment placement, or special requests...',
                          'اكتب تفاصيل أماكن الأبواب، توزيع المجلس أو المطبخ، أماكن الأدراج أو أي مواصفات خاصة...',
                        )}
                        className="mt-1 w-full rounded-[3px] border border-zinc-300 px-3 py-2 text-sm focus:border-[#09090B] focus:outline-none"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Dynamic Custom Fields added by Admin inside ANY section (including new custom sections) */}
              {renderCustomFields(currentSection.customFields || [])}

              {error ? (
                <div className="rounded-[3px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              ) : null}

              {/* Step Footer Navigation */}
              <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-4">
                {stepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStepIndex((s) => Math.max(0, s - 1));
                    }}
                    className="inline-flex h-11 items-center gap-1.5 rounded-[3px] border border-zinc-300 bg-white px-4 text-xs font-semibold text-[#09090B] hover:border-[#09090B] cursor-pointer whitespace-nowrap"
                  >
                    <PrevIcon size={15} />
                    <span>{pick('Previous', 'السابق')}</span>
                  </button>
                ) : (
                  <div />
                )}

                {!isLastStep ? (
                  <button
                    type="button"
                    onClick={() => {
                      const err = validateSectionRequired(currentSection);
                      if (err) {
                        setError(err);
                        return;
                      }
                      setError(null);
                      setStepIndex((s) => Math.min(activeSections.length - 1, s + 1));
                    }}
                    className="inline-flex h-11 items-center gap-1.5 rounded-[3px] bg-[#09090B] px-6 text-xs font-semibold text-white hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
                  >
                    <span>{pick('Next Step', 'الخطوة التالية')}</span>
                    <NextIcon size={15} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 flex-1 rounded-[3px] bg-[#09090B] px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {submitting
                      ? pick('Submitting Specification...', 'جاري إرسال المواصفات...')
                      : pick('Submit Custom Design Request', 'اعتماد وإرسال طلب التصميم الرسمي')}
                  </button>
                )}
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
