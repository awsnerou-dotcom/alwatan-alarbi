import { GoogleGenAI, ThinkingLevel, type Content } from '@google/genai';
import { normalizeRequestFormConfig } from '../src/shared/requestRequirements.ts';
import type { DatabaseState } from '../src/shared/types.ts';

export interface ChatTurnInput {
  role: 'user' | 'model';
  text: string;
}

function buildPlatformKnowledgeBase(db: DatabaseState): string {
  const { settings } = db;
  const reqConfig = normalizeRequestFormConfig(settings.requestFormConfig);
  const categories = [...db.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  const projects = [...db.projects]
    .filter((p) => p.published)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const visits = db.visits.filter((v) => v.published);
  const videos = db.videos.filter((v) => v.published);
  const gallery = db.gallery.filter((g) => g.published);

  const lines: string[] = [];

  lines.push('=== معلومات المصنع الأساسية (Factory Profile & Contact) ===');
  lines.push(`الاسم: ${settings.hero.brandNameAr} (${settings.hero.brandNameEn})`);
  lines.push(`العنوان التعريفي: ${settings.hero.titleAr} | ${settings.hero.subtitleAr}`);
  lines.push(`نبذة: ${settings.secondBanner.titleAr} — ${settings.secondBanner.textAr}`);
  lines.push(
    `الإحصائيات المنشورة: ${settings.stats.projects}+ مشروع منجز | ${settings.stats.years}+ سنة خبرة | ${settings.stats.exhibitions} مشاركات ومعارض | ${settings.stats.visitors}+ زائر`,
  );
  lines.push(`الموقع: ${settings.about.locationAr} (${settings.about.locationEn})`);
  lines.push(`العنوان الكامل: ${settings.contact.addressAr} (${settings.contact.addressEn})`);
  lines.push(`ساعات العمل: الفترة الصباحية ${settings.about.morningHours} | الفترة المسائية ${settings.about.eveningHours}`);
  lines.push(
    `التواصل: هاتف: ${[settings.contact.phone, settings.contact.phone2].filter(Boolean).join(' / ')} | واتساب: +${settings.contact.whatsapp}${settings.contact.email ? ` | البريد: ${settings.contact.email}` : ''}`,
  );
  lines.push('');

  lines.push('=== أقسام التصنيع والتجهيز (Manufacturing Divisions) ===');
  for (const cat of categories) {
    lines.push(
      `- ${cat.nameAr} (${cat.nameEn}) [الرابط: /portfolio/${cat.slug}]: ${cat.descriptionAr}`,
    );
  }
  lines.push('');

  lines.push('=== المشاريع والنماذج المنشورة (Published Projects) ===');
  for (const p of projects) {
    const cat = categories.find((c) => c.slug === p.categorySlug);
    const catLabel = cat ? cat.nameAr : p.categorySlug;
    const specsText = (p.specsAr && p.specsAr.length > 0 ? p.specsAr : p.specs).join(' | ');
    lines.push(
      `- ${p.titleAr} (${p.titleEn}) | القسم: ${catLabel} | الرابط: /projects/${p.slug} | الأبعاد: ${p.dimensions} | المادة: ${p.material} | مميز: ${p.featured ? 'نعم' : 'لا'}`,
    );
    lines.push(`  الوصف: ${p.descriptionAr}`);
    if (specsText) {
      lines.push(`  المواصفات: ${specsText}`);
    }
  }
  lines.push('');

  lines.push('=== معارض كتارا وسهيل والزيارات الرسمية (Exhibitions & Official Visits) ===');
  for (const v of visits) {
    lines.push(
      `- ${v.titleAr} (${v.titleEn}) | النوع: ${v.type} | التاريخ: ${v.eventDate} | المكان: ${v.locationAr}${v.isKataraFeatured ? ' | مميز في كتارا' : ''}`,
    );
    lines.push(`  التفاصيل: ${v.descriptionAr}`);
  }
  lines.push('');

  lines.push('=== مكتبة الفيديو والمعرض (Videos & Gallery Highlights) ===');
  for (const vid of videos) {
    lines.push(`- فيديو: ${vid.titleAr} (${vid.category}، المدة: ${vid.duration}) — ${vid.descriptionAr}`);
  }
  const galleryCategories = Array.from(new Set(gallery.map((g) => g.category)));
  lines.push(`عدد الصور/الوسائط المنشورة في المعرض: ${gallery.length} (التصنيفات: ${galleryCategories.join('، ')})`);
  lines.push('');

  lines.push('=== خيارات نموذج طلب التصميم المخصص المتاحة حالياً (Custom Design Request Options) ===');
  const enabledSections = reqConfig.sections.filter((s) => s.enabled);
  for (const sec of enabledSections) {
    const fieldLabels = [
      ...(sec.builtInFields?.filter((f) => f.enabled).map((f) => f.labelAr) ?? []),
      ...sec.customFields.filter((f) => f.enabled).map((f) => f.labelAr),
    ];
    lines.push(
      `- خطوة: ${sec.titleAr}${sec.descriptionAr ? ` (${sec.descriptionAr})` : ''}${fieldLabels.length ? ` | الحقول: ${fieldLabels.join('، ')}` : ''}`,
    );
  }
  const enabledEquipment = reqConfig.equipmentOptions.filter((e) => e.enabled).map((e) => e.labelAr);
  if (enabledEquipment.length > 0) {
    lines.push(`- التجهيزات والإضافات الاختيارية المتاحة: ${enabledEquipment.join('، ')}`);
  }
  lines.push('');

  lines.push('=== صفحات المنصة (Platform Routes) ===');
  lines.push(
    'الرئيسية (/), من نحن (/about), أعمالنا (/portfolio), جميع المشاريع (/projects), الزيارات (/visits), كتارا (/katara), المعرض (/gallery), الفيديو (/videos), اتصل بنا (/contact), نموذج طلب تصميم مخصص (متاح عبر زر طلب التصميم).',
  );

  return lines.join('\n');
}

function buildSystemInstruction(knowledgeBase: string): string {
  return [
    'أنت "المستشار الهندسي لمصنع الوطن العربي" في الدوحة - قطر.',
    'مهمتك الإجابة باحترافية، ودقة، وأسلوب لبق وواضح عن استفسارات الزوار والعملاء حول كل ما يخص المصنع، الأقسام، المشاريع، التجهيزات، المعارض، الزيارات، وساعات العمل اعتماداً حصرياً على البيانات الحقيقية الموجودة داخل المنصة أدناه.',
    '',
    'القواعد الصارمة التي يجب الالتزام بها دائماً:',
    '1. أجب دائماً باللغة العربية الفصحى الراقية المبسطة فقط، ولا تكتب شروحات باللغة الإنجليزية (باستثناء أسماء المركبات والرموز المتعارف عليها مثل GMC أو GXR عند الحاجة).',
    '2. التزم بالبيانات الموجودة في المنصة فقط. لا تخترع مواصفات، أو مشاريع، أو فروع، أو أرقام هواتف غير مذكورة في البيانات.',
    '3. قاعدة مهمة جداً حول الأسعار والمدد الزمنية: لا تذكر أي أسعار تقديرية بالريال أو غيره ولا تذكر مدداً زمنية ثابتة للتصنيع أو التسليم. إذا سأل العميل عن السعر أو التكلفة أو مدة التنفيذ، وضح له أن التسعير والمدة الزمنية يتم تحديدهما بدقة من الفريق الهندسي بعد مراجعة مواصفات طلبه، ووجّهه إلى فتح "طلب تصميم مخصص" في المنصة أو التواصل مباشرة عبر الواتساب أو الهاتف.',
    '4. عند الإشارة إلى مشروع أو قسم مناسب، اذكر اسمه الدقيق وأبرز مواصفاته المنشورة (الأبعاد، المواد، التجهيزات) وبإمكانك اقتراح اسم الصفحة المناسبة في المنصة.',
    '5. إذا كان السؤال خارج نطاق بيانات المصنع أو لم تتوفر المعلومة داخل المنصة، اعتذر بأسلوب مهني وأخبره أن فريق الهندسة وخدمة العملاء سيفيده مباشرة عبر الهاتف أو الواتساب.',
    '6. اجعل الإجابات منظمة وسهلة القراءة (نقاط موجزة وعناوين قصيرة عند الحاجة) دون إطالة مملة، ولا تذكر أبداً أي معلومات تقنية عن طريقة عمل النظام أو أسماء نماذج ذكاء اصطناعي.',
    '',
    'بيانات المنصة الحالية:',
    knowledgeBase,
  ].join('\n');
}

function extractGeminiError(err: unknown): { status: number; message: string } {
  const rawMessage = err instanceof Error ? err.message : String(err || 'Unknown error');
  const statusMatch = rawMessage.match(/\b(400|401|403|404|429|500|502|503)\b/);
  const parsedStatus = statusMatch ? Number(statusMatch[1]) : 500;

  if (
    rawMessage.includes('API_KEY_INVALID') ||
    rawMessage.includes('PERMISSION_DENIED') ||
    parsedStatus === 403 ||
    parsedStatus === 401
  ) {
    return {
      status: 403,
      message:
        'تعذر التحقق من مفتاح الخدمة (GEMINI_API_KEY). يرجى مراجعة المفتاح في إعدادات الأسرار (Settings > Secrets).',
    };
  }
  if (rawMessage.includes('RESOURCE_EXHAUSTED') || parsedStatus === 429) {
    return {
      status: 429,
      message: 'تم تجاوز الحد المسموح حالياً من الطلبات. يرجى المحاولة بعد لحظات.',
    };
  }
  if (rawMessage.includes('NOT_FOUND') || parsedStatus === 404) {
    return {
      status: 502,
      message: 'تعذر الوصول إلى خدمة الرد الآلي حالياً. يرجى المحاولة لاحقاً.',
    };
  }

  return {
    status: 502,
    message: 'حدث خطأ مؤقت أثناء معالجة استفسارك. يرجى المحاولة مرة أخرى.',
  };
}

export async function generateFactoryChatReply(
  db: DatabaseState,
  history: ChatTurnInput[],
  userMessage: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const error = new Error(
      'مفتاح الخدمة غير مضبوط حالياً (GEMINI_API_KEY). يرجى إضافته من لوحة الإعدادات (Settings > Secrets).',
    ) as Error & { statusCode?: number };
    error.statusCode = 503;
    throw error;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const knowledgeBase = buildPlatformKnowledgeBase(db);
  const systemInstruction = buildSystemInstruction(knowledgeBase);

  const sanitizedHistory: Content[] = history
    .filter((m) => (m.role === 'user' || m.role === 'model') && typeof m.text === 'string' && m.text.trim())
    .slice(-12)
    .map((m) => ({
      role: m.role,
      parts: [{ text: m.text.trim() }],
    }));

  // Try several models in order: if one is overloaded (503/429) or missing (404), fall back to the next.
  const models = ['gemini-4-hydrogen', 'gemini-flash-latest', 'gemini-2.5-flash'];
  let lastError: unknown;
  const trace: string[] = []; // TEMP-DEBUG

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const chat = ai.chats.create({
        model,
        history: sanitizedHistory,
        config: {
          systemInstruction,
          ...(model.startsWith('gemini-4') ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
        },
      });

      const response = await chat.sendMessage({
        message: userMessage.trim(),
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        throw new Error('Empty response received from model');
      }
      return replyText;
    } catch (err) {
      lastError = err;
      trace.push(`${model}: ${(err instanceof Error ? err.message : String(err)).replace(/AIza[0-9A-Za-z_-]+/g, '[key]').replace(/\s+/g, ' ').slice(0, 160)}`); // TEMP-DEBUG
      console.error(`Gemini chat failed on ${model}:`, err instanceof Error ? err.message.slice(0, 300) : String(err));
      const { status } = extractGeminiError(err);
      // A bad/forbidden key will fail on every model, so stop early.
      if (status === 403) break;
    }
  }

  const mapped = extractGeminiError(lastError);
  const finalError = new Error(`${mapped.message} [${trace.join(' || ')}]`) as Error & { statusCode?: number };
  finalError.statusCode = mapped.status;
  throw finalError;
}
