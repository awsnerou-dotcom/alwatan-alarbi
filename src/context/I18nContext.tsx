import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Language } from '../shared/types';

interface I18nContextValue {
  lang: Language;
  isRtl: boolean;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  pick: <T>(enVal: T, arVal: T) => T;
  t: (key: string) => string;
}

const DICT: Record<Language, Record<string, string>> = {
  en: {
    'brand.name': 'Al Watan Al Arabi Factory',
    'brand.short': 'Al Watan Factory',
    'nav.projects': 'Projects',
    'nav.exhibitions': 'Exhibitions',
    'nav.gallery': 'Gallery',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.katara': 'Katara',
    'nav.videos': 'Videos',
    'nav.portfolio': 'Portfolio',
    'nav.admin': 'Dashboard',
    'nav.login': 'Admin Login',
    'nav.configure': 'Configure Build',
    'home.hero.kicker': 'Doha Industrial Area · Street 34 · GCC Fabrication',
    'home.hero.ctaPrimary': 'Configure Custom Build',
    'home.hero.ctaSecondary': 'Explore Projects',
    'home.stats.projects': 'Projects Completed',
    'home.stats.visitors': 'Visitors Hosted',
    'home.stats.years': 'Years of Experience',
    'home.stats.exhibitions': 'Exhibitions Participated',
    'home.capabilities.eyebrow': 'Manufacturing Divisions',
    'home.capabilities.title': 'Precision Engineering Across Seven Divisions',
    'home.capabilities.subtitle':
      'Custom CNC aluminum fabrication, vacuum-infused fiberglass, and expedition fluid systems built for Gulf climate durability.',
    'home.featured.eyebrow': 'Featured Production',
    'home.featured.title': 'Recent Factory Deliveries',
    'home.featured.viewAll': 'View All Projects',
    'home.exhibitions.eyebrow': 'Events & VIP Delegations',
    'home.exhibitions.title': 'Katara & Suhail Exhibitions',
    'home.exhibitions.viewAll': 'View Katara Portfolio',
    'home.why.eyebrow': 'Engineering Standards',
    'home.why.title': 'Why GCC Fleet Owners Choose Al Watan',
    'home.cta.title': 'Ready to Commission Your Custom Vehicle or Structure?',
    'home.cta.subtitle':
      'Configure dimensions, thermal insulation, and off-grid solar specs online or schedule a tour of our Street 34 Doha facility.',
    'home.cta.button': 'Request Custom Quote',
    'home.cta.whatsapp': 'WhatsApp Engineering',
    'about.eyebrow': 'Our Heritage',
    'about.title': 'Al Watan Al Arabi Factory',
    'about.subtitle':
      'For over 16 years, we have crafted expedition aluminum canopies, luxury desert caravans, and industrial fluid systems across Qatar and the GCC.',
    'about.visionTitle': 'Our Vision',
    'about.visionText':
      'To lead GCC precision manufacturing in custom aluminum expedition vehicles, composite caravans, and modular field structures.',
    'about.missionTitle': 'Our Mission',
    'about.missionText':
      'To localize advanced fabrication engineering in Doha that meets extreme desert durability standards with dependable delivery.',
    'projects.eyebrow': 'Catalog & Specifications',
    'projects.title': 'Engineered Projects & Builds',
    'projects.subtitle':
      'Browse production caravans, pickup canopies, water and fuel tanks, and modular camp frames with full technical specifications.',
    'projects.searchPlaceholder': 'Search builds, dimensions, or materials...',
    'projects.allCategories': 'All Divisions',
    'projects.requestSimilar': 'Configure Similar Build',
    'projects.empty': 'No matching builds found for the selected criteria.',
    'visits.eyebrow': 'Events & Milestones',
    'visits.title': 'VIP Visits, Exhibitions & Achievements',
    'visits.subtitle':
      'Official delegations, Suhail & Katara showcases, and production milestones recorded at our Doha facility.',
    'katara.eyebrow': 'Cultural & VIP Showcase',
    'katara.title': 'Katara Cultural Village & Suhail Exhibitions',
    'katara.subtitle':
      'Highlights from our premier exhibition pavilions at Katara, Souq Waqif, and Suhail International Hunting Exhibition.',
    'gallery.eyebrow': 'Media Archive',
    'gallery.title': 'Factory & Exhibition Photo Gallery',
    'gallery.subtitle': 'Inspect shop-floor fabrication, finished caravan exteriors, and VIP showcase moments.',
    'videos.eyebrow': 'Motion & Field Testing',
    'videos.title': 'Factory Walkthroughs & Dune Tests',
    'videos.subtitle': 'Watch CNC production lines, hydrostatic tank testing, and Sealine desert trials.',
    'contact.eyebrow': 'Direct Inquiry',
    'contact.title': 'Contact Engineering & Sales',
    'contact.subtitle':
      'Submit your specifications for a tailored quotation or visit our showroom in Industrial Area Street 34, Doha.',
    'login.eyebrow': 'Operations Portal',
    'login.title': 'Sign in to Factory Admin',
    'login.subtitle': 'Manage projects, Katara exhibitions, gallery media, quote requests, and site settings.',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.submit': 'Sign In to Dashboard',
    'login.fillDemo': 'Fill Demo Admin Credentials',
    'admin.overview': 'Overview',
    'admin.quotes': 'Quote Requests',
    'admin.projects': 'Projects',
    'admin.visits': 'Visits & Katara',
    'admin.gallery': 'Gallery',
    'admin.videos': 'Videos',
    'admin.categories': 'Categories',
    'admin.users': 'Team & Users',
    'admin.settings': 'Site Settings',
    'admin.viewSite': 'View Public Site',
    'admin.logout': 'Sign Out',
  },
  ar: {
    'brand.name': 'مصنع الوطن العربي',
    'brand.short': 'مصنع الوطن العربي',
    'nav.projects': 'المشاريع',
    'nav.exhibitions': 'المعارض',
    'nav.gallery': 'المعرض',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
    'nav.katara': 'كتارا',
    'nav.videos': 'الفيديو',
    'nav.portfolio': 'أعمالنا',
    'nav.admin': 'لوحة التحكم',
    'nav.login': 'دخول الإدارة',
    'nav.configure': 'صمّم مشروعك',
    'home.hero.kicker': 'المنطقة الصناعية بالدوحة · شارع 34 · تصنيع خليجي',
    'home.hero.ctaPrimary': 'صمّم واطلب تسعيرة',
    'home.hero.ctaSecondary': 'تصفح المشاريع',
    'home.stats.projects': 'مشروع منجز',
    'home.stats.visitors': 'زائر للمعارض',
    'home.stats.years': 'عاماً من الخبرة',
    'home.stats.exhibitions': 'معرض ومشاركة',
    'home.capabilities.eyebrow': 'أقسام التصنيع',
    'home.capabilities.title': 'هندسة وتصنيع متكامل عبر سبعة أقسام',
    'home.capabilities.subtitle':
      'قص ألمنيوم بالليزر، قولبة فايبرجلاس معزولة، وخزانات مياه ووقود مصممة لمناخ الخليج.',
    'home.featured.eyebrow': 'أحدث الإنتاج',
    'home.featured.title': 'مشاريع تم تسليمها مؤخراً',
    'home.featured.viewAll': 'عرض جميع المشاريع',
    'home.exhibitions.eyebrow': 'الفعاليات وكبار الشخصيات',
    'home.exhibitions.title': 'معارض كتارا وسهيل',
    'home.exhibitions.viewAll': 'عرض ملف كتارا',
    'home.why.eyebrow': 'معايير الجودة',
    'home.why.title': 'لماذا يختار عملاء الخليج مصنع الوطن العربي',
    'home.cta.title': 'هل أنت جاهز لتنفيذ مركبتك أو مشروعك المخصص؟',
    'home.cta.subtitle':
      'حدد الأبعاد ومستوى العزل الحراري ومنظومة الطاقة الشمسية مباشرة أو تفضل بزيارة مصنعنا بالمنطقة الصناعية.',
    'home.cta.button': 'اطلب عرض سعر',
    'home.cta.whatsapp': 'تواصل عبر واتساب',
    'about.eyebrow': 'تاريخنا',
    'about.title': 'مصنع الوطن العربي',
    'about.subtitle':
      'منذ أكثر من 16 عاماً نصنع صناديق الألمنيوم وكرفانات الفايبرجلاس وخزانات الرحلات بأعلى معايير الجودة في قطر والخليج.',
    'about.visionTitle': 'رؤيتنا',
    'about.visionText':
      'الريادة على مستوى دول مجلس التعاون الخليجي في تصنيع مركبات التخييم والكرفانات وهياكل الألمنيوم المخصصة.',
    'about.missionTitle': 'رسالتنا',
    'about.missionText':
      'تطوير وتوطين حلول تصنيع متقدمة في الدوحة تلبي أقسى ظروف الصحراء مع التزام كامل بمواعيد التسليم.',
    'projects.eyebrow': 'الكتالوج والمواصفات',
    'projects.title': 'المشاريع والتجهيزات المصنعة',
    'projects.subtitle':
      'استعرض الكرفانات، صناديق البيك أب، خزانات المياه والوقود، وهياكل الخيام مع كافة المواصفات الفنية.',
    'projects.searchPlaceholder': 'ابحث باسم المشروع أو الأبعاد أو المادة...',
    'projects.allCategories': 'جميع الأقسام',
    'projects.requestSimilar': 'اطلب مواصفات مماثلة',
    'projects.empty': 'لم يتم العثور على مشاريع مطابقة لبحثك.',
    'visits.eyebrow': 'الفعاليات والإنجازات',
    'visits.title': 'زيارات كبار الشخصيات والمعارض والإنجازات',
    'visits.subtitle': 'توثيق للوفود الرسمية ومعارض سهيل وكتارا وإنجازات خطوط الإنتاج.',
    'katara.eyebrow': 'معرض كتارا وسهيل',
    'katara.title': 'ملف معرض كتارا وكبار الشخصيات',
    'katara.subtitle': 'أبرز مشاركاتنا في الحي الثقافي كتارا وسوق واقف ومعرض سهيل للصيد والصقور.',
    'gallery.eyebrow': 'أرشيف الصور',
    'gallery.title': 'معرض صور المصنع والمعارض',
    'gallery.subtitle': 'لقطات من خطوط التصنيع والتشطيب النهائي والمشاركات الرسمية.',
    'videos.eyebrow': 'الفيديو والاختبارات الميدانية',
    'videos.title': 'جولات المصنع واختبارات الكثبان',
    'videos.subtitle': 'شاهد خطوط القص بالليزر وفحوصات الضغط واختبارات سيلين.',
    'contact.eyebrow': 'تواصل مباشر',
    'contact.title': 'تواصل مع الهندسة والمبيعات',
    'contact.subtitle': 'أرسل متطلباتك للحصول على تسعيرة مخصصة أو قم بزيارة المصنع في شارع 34 بالدوحة.',
    'login.eyebrow': 'بوابة العمليات',
    'login.title': 'تسجيل الدخول للوحة الإدارة',
    'login.subtitle': 'إدارة المشاريع ومعارض كتارا والمعرض وطلبات التسعير وإعدادات الموقع.',
    'login.email': 'البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.submit': 'دخول للوحة التحكم',
    'login.fillDemo': 'تعبئة بيانات الدخول التجريبية',
    'admin.overview': 'نظرة عامة',
    'admin.quotes': 'طلبات التسعير',
    'admin.projects': 'المشاريع',
    'admin.visits': 'الزيارات وكتارا',
    'admin.gallery': 'المعرض',
    'admin.videos': 'الفيديو',
    'admin.categories': 'الأقسام',
    'admin.users': 'المستخدمون',
    'admin.settings': 'إعدادات الموقع',
    'admin.viewSite': 'عرض الموقع',
    'admin.logout': 'تسجيل الخروج',
  },
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang] = useState<Language>('ar');

  useEffect(() => {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    try {
      window.localStorage.setItem('app_language', 'ar');
    } catch {
      // ignore
    }
  }, []);

  const value: I18nContextValue = {
    lang,
    isRtl: true,
    setLang: () => undefined,
    toggleLang: () => undefined,
    pick: (_enVal, arVal) => arVal,
    t: (key) => DICT.ar[key] || DICT.en[key] || key,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
