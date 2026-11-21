export type Language = 'en' | 'ar';

export type VisualKey =
  | 'hero-caravan'
  | 'aluminum-caravan'
  | 'fiberglass-caravan'
  | 'pickup-canopy'
  | 'water-fuel-tank'
  | 'tent-structure'
  | 'katara-pavilion'
  | 'solar-expedition'
  | 'vip-majlis'
  | 'factory-cnc';

export interface UserRecord {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: 'super_admin' | 'operations_manager' | 'sales_lead' | 'editor';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface StoredUser extends UserRecord {
  passwordHash: string;
  salt: string;
}

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  imageUrl?: string;
  visualKey?: VisualKey;
  sortOrder: number;
  createdAt: string;
}

export interface Project {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  categorySlug: string;
  completionDate: string;
  specs: string[];
  specsAr: string[];
  visualKey: VisualKey;
  images: string[];
  videoUrl?: string;
  sortOrder: number;
  featured: boolean;
  published: boolean;
  leadTimeWeeks: number;
  startingPriceQar: number;
  dimensions: string;
  material: string;
  createdAt: string;
}

export type VisitType = 'visit' | 'achievement' | 'exhibition';

export interface Visit {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  type: VisitType;
  locationEn: string;
  locationAr: string;
  eventDate: string;
  visualKey: VisualKey;
  images: string[];
  isKataraFeatured: boolean;
  published: boolean;
  createdAt: string;
}

export type GalleryCategory = 'Projects' | 'Factory' | 'Exhibitions' | 'VIP Visits' | 'Products';

export interface GalleryItem {
  id: string;
  titleEn: string;
  titleAr: string;
  album: string;
  category: GalleryCategory;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  visualKey: VisualKey;
  altText: string;
  published: boolean;
  createdAt: string;
}

export interface VideoItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  sourceType: 'youtube' | 'upload';
  videoUrl: string;
  visualKey: VisualKey;
  duration: string;
  category: string;
  published: boolean;
  createdAt: string;
}

export type QuoteStatus = 'new' | 'reviewing' | 'quoted' | 'in_production' | 'completed';

export interface CustomAnswerEntry {
  sectionTitle: string;
  label: string;
  value: string;
}

export interface CustomBuildSpecs {
  vehicleMakeModel?: string;
  vehicleYear?: string;
  vehicleStatus?: string;
  roofHeightProfile?: string;
  bodyMaterial?: string;
  widthMeters?: number;
  exteriorColor?: string;
  tankMaterial?: string;
  fuelTankLiters?: number;
  powerSystem?: string;
  acSystem?: string;
  selectedFeatures?: string[];
  targetTimeline?: string;
  city?: string;
  customAnswers?: CustomAnswerEntry[];
}

export type CustomRequirementFieldType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox_group';

export interface CustomRequirementField {
  id: string;
  labelAr: string;
  labelEn: string;
  type: CustomRequirementFieldType;
  optionsAr?: string[];
  optionsEn?: string[];
  placeholderAr?: string;
  placeholderEn?: string;
  required: boolean;
  enabled: boolean;
}

export interface BuiltInFieldConfig {
  key: string;
  labelAr: string;
  labelEn: string;
  enabled: boolean;
}

export interface CustomRequestSection {
  id: string;
  stepKey: 'division_vehicle' | 'body_dimensions' | 'systems_gear' | 'contact_delivery' | 'custom';
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  enabled: boolean;
  sortOrder: number;
  appliesToCategories?: string[];
  builtInFields?: BuiltInFieldConfig[];
  customFields: CustomRequirementField[];
}

export interface CustomRequestFormConfig {
  sections: CustomRequestSection[];
  equipmentOptions: Array<{
    key: string;
    labelAr: string;
    labelEn: string;
    enabled: boolean;
  }>;
}

export interface QuoteRequest {
  id: string;
  referenceCode: string;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  categorySlug: string;
  projectTitle: string;
  lengthMeters: number;
  capacityLiters: number;
  insulationTier: 'standard' | 'gcc_thermal' | 'expedition_pro';
  offGridPackage: boolean;
  estimatedPriceQar: number;
  estimatedLeadWeeks: number;
  customSpecs?: CustomBuildSpecs;
  notes: string;
  internalNotes: string;
  status: QuoteStatus;
  createdAt: string;
}

export interface IconRowItem {
  id: string;
  icon: string;
  titleEn: string;
  titleAr: string;
  link: string;
}

export interface SiteSettings {
  stats: {
    projects: number;
    visitors: number;
    years: number;
    exhibitions: number;
  };
  hero: {
    brandNameEn: string;
    brandNameAr: string;
    titleEn: string;
    titleAr: string;
    subtitleEn: string;
    subtitleAr: string;
    imageUrl: string;
    mobileImageUrl: string;
    logoUrl: string;
    visualKey: VisualKey;
  };
  secondBanner: {
    titleEn: string;
    titleAr: string;
    textEn: string;
    textAr: string;
    image: string;
    visualKey: VisualKey;
  };
  iconsRow: IconRowItem[];
  about: {
    morningHours: string;
    eveningHours: string;
    locationEn: string;
    locationAr: string;
    mapUrl: string;
  };
  contact: {
    phone: string;
    phone2: string;
    whatsapp: string;
    email: string;
    email2: string;
    addressEn: string;
    addressAr: string;
  };
  seo: {
    siteTitleEn: string;
    siteTitleAr: string;
    siteDescEn: string;
    siteDescAr: string;
  };
  requestFormConfig?: CustomRequestFormConfig;
}

export interface DatabaseState {
  users: StoredUser[];
  categories: Category[];
  projects: Project[];
  visits: Visit[];
  gallery: GalleryItem[];
  videos: VideoItem[];
  quotes: QuoteRequest[];
  settings: SiteSettings;
}
