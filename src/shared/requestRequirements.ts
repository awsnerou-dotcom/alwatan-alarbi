import type { CustomRequestFormConfig } from './types';

export const DEFAULT_REQUEST_FORM_CONFIG: CustomRequestFormConfig = {
  sections: [
    {
      id: 'sec-division-vehicle',
      stepKey: 'division_vehicle',
      titleAr: 'القسم والمركبة',
      titleEn: 'Division & Vehicle',
      descriptionAr: 'تحديد القسم المطلوب، نوع المركبة الأساسية، سنة الصنع وحالة التوفير.',
      descriptionEn: 'Select the manufacturing division, base vehicle chassis, year, and supply status.',
      enabled: true,
      sortOrder: 1,
      appliesToCategories: [],
      builtInFields: [
        { key: 'category', labelAr: 'القسم الهندسي المطلوب', labelEn: 'Manufacturing Division', enabled: true },
        { key: 'modelRef', labelAr: 'الموديل المرجعي أو عنوان الطلب', labelEn: 'Reference Model / Project Name', enabled: true },
        { key: 'vehicleInfo', labelAr: 'نوع المركبة / الشاصيه وسنة الصنع', labelEn: 'Base Vehicle & Year', enabled: true },
        { key: 'vehicleStatus', labelAr: 'حالة توفير المركبة', labelEn: 'Vehicle Supply Status', enabled: true },
      ],
      customFields: [],
    },
    {
      id: 'sec-body-dimensions',
      stepKey: 'body_dimensions',
      titleAr: 'الهيكل والأبعاد',
      titleEn: 'Body & Dimensions',
      descriptionAr: 'ارتفاع السقف ومستوى الشد، الأبعاد المطلوبة، مادة التصنيع والعزل الحراري.',
      descriptionEn: 'Specify roof height profile, length & width, structural material, paint, and insulation.',
      enabled: true,
      sortOrder: 2,
      appliesToCategories: [],
      builtInFields: [
        { key: 'roofHeight', labelAr: 'ارتفاع السقف ومستوى الشد', labelEn: 'Roof Height / Canopy Profile', enabled: true },
        { key: 'dimensions', labelAr: 'الأبعاد (الطول والعرض بالمتر)', labelEn: 'Body Length & Width (Meters)', enabled: true },
        { key: 'materialAndPaint', labelAr: 'مادة التصنيع والدهان الخارجي', labelEn: 'Structural Material & Exterior Paint', enabled: true },
        { key: 'insulation', labelAr: 'مستوى العزل الحراري ومقاومة الغبار', labelEn: 'Thermal & Dust Insulation Tier', enabled: true },
      ],
      customFields: [],
    },
    {
      id: 'sec-systems-gear',
      stepKey: 'systems_gear',
      titleAr: 'الأنظمة والتجهيزات',
      titleEn: 'Systems & Equipment',
      descriptionAr: 'سعات خزانات المياه والوقود، منظومة الطاقة الكهربائية، التكييف والتجهيزات الخاصة.',
      descriptionEn: 'Configure water/fuel tanks, electrical & solar power, AC, and custom interior/exterior gear.',
      enabled: true,
      sortOrder: 3,
      appliesToCategories: [],
      builtInFields: [
        { key: 'waterTank', labelAr: 'خزان الماء ومادته', labelEn: 'Water Tank Capacity & Material', enabled: true },
        { key: 'fuelTank', labelAr: 'خزان وقود / ديزل إضافي', labelEn: 'Auxiliary Fuel / Diesel Tank', enabled: true },
        { key: 'powerSystem', labelAr: 'منظومة الكهرباء والطاقة', labelEn: 'Electrical & Solar Power', enabled: true },
        { key: 'acSystem', labelAr: 'التكييف والتهوية', labelEn: 'Cooling & Ventilation', enabled: true },
        { key: 'equipmentChecklist', labelAr: 'التجهيزات والإضافات المخصصة', labelEn: 'Custom Equipment Checklist', enabled: true },
      ],
      customFields: [],
    },
    {
      id: 'sec-contact-delivery',
      stepKey: 'contact_delivery',
      titleAr: 'المراجعة وبيانات العميل',
      titleEn: 'Review & Contact Details',
      descriptionAr: 'مراجعة ملخص المواصفات وتعبئة بيانات التواصل والتفاصيل الإضافية.',
      descriptionEn: 'Review selected specifications and provide contact details and layout notes.',
      enabled: true,
      sortOrder: 4,
      appliesToCategories: [],
      builtInFields: [
        { key: 'summaryBox', labelAr: 'ملخص المواصفات المختارة', labelEn: 'Technical Configuration Summary', enabled: true },
        { key: 'contactDetails', labelAr: 'الاسم والهاتف والبريد الإلكتروني', labelEn: 'Client Name, Phone & Email', enabled: true },
        { key: 'locationPriority', labelAr: 'الدولة والمدينة وأولوية التنفيذ', labelEn: 'Country, City & Execution Priority', enabled: true },
        { key: 'notes', labelAr: 'ملاحظات هندسية وتفاصيل إضافية', labelEn: 'Engineering & Custom Layout Notes', enabled: true },
      ],
      customFields: [],
    },
  ],
  equipmentOptions: [
    { key: 'electric_awning', labelEn: 'Electric Side Awning', labelAr: 'مظلة جانبية كهربائية', enabled: true },
    { key: 'heavy_drawers', labelEn: 'Heavy-Duty Drawer System', labelAr: 'أدراج تخزين ثقيلة', enabled: true },
    { key: 'gas_kitchen', labelEn: 'Integrated Gas & Kitchen', labelAr: 'نظام غاز ومطبخ متكامل', enabled: true },
    { key: 'bathroom_unit', labelEn: 'Full Bathroom & Shower', labelAr: 'حمام ودورة مياه متكاملة', enabled: true },
    { key: 'vip_majlis', labelEn: 'Luxury Interior Majlis', labelAr: 'مجلس وجلسة داخلية فاخرة', enabled: true },
    { key: 'horse_stalls', labelEn: 'Horse Stalls & Hydraulic Ramp', labelAr: 'فواصل نقل خيل ومنحدر هيدروليكي', enabled: true },
    { key: 'coffee_counter', labelEn: 'Stainless Coffee Bar Counter', labelAr: 'كاونتر ستانلس لماكينة كوفي', enabled: true },
    { key: 'roof_rack', labelEn: 'Heavy-Duty Roof Rack', labelAr: 'عرشة سقفية وحامل إضافي', enabled: true },
    { key: 'rear_ladder', labelEn: 'Rear Ladder & Reinforced Bumper', labelAr: 'سلم خلفي وصدام تدعيم', enabled: true },
    { key: 'led_package', labelEn: '360° Exterior & Interior LED', labelAr: 'إضاءة LED محيطية وداخلية', enabled: true },
  ],
};

export function normalizeRequestFormConfig(raw?: Partial<CustomRequestFormConfig> | null): CustomRequestFormConfig {
  if (!raw || !Array.isArray(raw.sections) || raw.sections.length === 0) {
    return structuredClone(DEFAULT_REQUEST_FORM_CONFIG);
  }
  return {
    sections: [...raw.sections].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    equipmentOptions:
      Array.isArray(raw.equipmentOptions) && raw.equipmentOptions.length > 0
        ? raw.equipmentOptions
        : structuredClone(DEFAULT_REQUEST_FORM_CONFIG.equipmentOptions),
  };
}
