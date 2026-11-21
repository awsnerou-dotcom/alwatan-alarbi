import { createApp, type Request_ as Req, type Response_ as Res, type Next } from './mini-express.ts';
import crypto from 'node:crypto';
import { env as cfEnv } from 'cloudflare:workers';
import seedDb from '../data/db.json';
import { generateFactoryChatReply, type ChatTurnInput } from '../server/chatService.ts';
import { normalizeRequestFormConfig } from '../src/shared/requestRequirements.ts';
import { hashPassword, verifyLogin, tokenSecret } from './passwords.ts';
import type {
  Category,
  DatabaseState,
  GalleryItem,
  Project,
  QuoteRequest,
  UserRecord,
  VideoItem,
  Visit,
} from '../src/shared/types.ts';

// ---- Storage: D1 (database as one JSON document) + KV (uploaded media) ----
interface Bindings {
  DB: D1Database;
  UPLOADS: KVNamespace;
}
const bindings = () => cfEnv as unknown as Bindings;

let cache: DatabaseState | null = null;
let dirty = false;

async function loadDb(): Promise<DatabaseState> {
  const { DB } = bindings();
  await DB.exec('CREATE TABLE IF NOT EXISTS app_state (k TEXT PRIMARY KEY, v TEXT NOT NULL)');
  const row = await DB.prepare('SELECT v FROM app_state WHERE k = ?').bind('db').first<{ v: string }>();
  if (row?.v) {
    const state = JSON.parse(row.v) as DatabaseState;
    // Keep the main admin's email in sync with the ADMIN_EMAIL secret.
    const want = String((cfEnv as unknown as Record<string, string | undefined>).ADMIN_EMAIL || '').trim().toLowerCase();
    if (want && !state.users.some((u) => u.email.toLowerCase() === want)) {
      const admin = state.users.find((u) => u.role === 'super_admin');
      if (admin) {
        admin.email = want;
        await DB.prepare('INSERT OR REPLACE INTO app_state (k, v) VALUES (?, ?)').bind('db', JSON.stringify(state)).run();
      }
    }
    // One-time fix: replace the placeholder WhatsApp number with the real one.
    const contact = (state as any).settings?.contact;
    if (contact && (contact.whatsapp === '97455123456' || contact.phone === '+974 55 123 456')) {
      contact.whatsapp = '97455598944';
      contact.phone = '+974 5559 8944';
      contact.phone2 = '';
      contact.email = '';
      contact.email2 = '';
      await DB.prepare('INSERT OR REPLACE INTO app_state (k, v) VALUES (?, ?)').bind('db', JSON.stringify(state)).run();
    }
    return state;
  }
  const initial = seedDb as unknown as DatabaseState;
  await DB.prepare('INSERT OR REPLACE INTO app_state (k, v) VALUES (?, ?)').bind('db', JSON.stringify(initial)).run();
  return JSON.parse(JSON.stringify(initial)) as DatabaseState;
}

async function persistDb(): Promise<void> {
  if (!dirty || !cache) return;
  dirty = false;
  await bindings().DB.prepare('INSERT OR REPLACE INTO app_state (k, v) VALUES (?, ?)').bind('db', JSON.stringify(cache)).run();
}

function readDb(): DatabaseState {
  if (!cache) throw new Error('Database not loaded');
  return cache;
}

function writeDb(db: DatabaseState): void {
  cache = db;
  dirty = true;
}

function sanitizeUser(u: DatabaseState['users'][number]): UserRecord {
  return {
    id: u.id,
    name: u.name,
    nameAr: u.nameAr,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
  };
}

interface TokenPayload {
  uid: string;
  email: string;
  role: string;
  exp: number;
}

function signToken(payload: TokenPayload): string {
  const TOKEN_SECRET = tokenSecret();
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const TOKEN_SECRET = tokenSecret();
    const [encoded, sig] = token.split('.');
    if (!encoded || !sig) return null;
    const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
    if (sig !== expectedSig) return null;
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as TokenPayload;
    if (Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function requireAuth(
  req: Req,
  res: Res,
  next: Next,
): void {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const db = readDb();
  const user = db.users.find((u) => u.id === decoded.uid && u.status === 'active');
  if (!user) {
    res.status(401).json({ error: 'Session invalid or user inactive' });
    return;
  }
  req.authUser = sanitizeUser(user);
  next();
}

export function buildApp() {
  const app = createApp();

  // Load the database before each request and persist it before the response ends.
  app.use(['/api'], async (_req, res, next) => {
    try {
      cache = await loadDb();
      dirty = false;
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database unavailable' });
      return;
    }
    next();
  });
  app.afterResponse(persistDb);

  // Uploaded media (stored in KV)
  app.get('/uploads/:name', async (req: Req, res: Res) => {
    const { value, metadata } = await bindings().UPLOADS.getWithMetadata<{ mime?: string }>(req.params.name, 'arrayBuffer');
    if (!value) {
      res.status(404).end('Not found');
      return;
    }
    res.setHeader('Content-Type', metadata?.mime || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.end(new Uint8Array(value as ArrayBuffer));
  });

  // Health
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.post('/api/auth/login', (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) {
      res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' });
      return;
    }
    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user || !verifyLogin(user, password)) {
      res.status(401).json({ error: 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.' });
      return;
    }
    if (user.status !== 'active') {
      res.status(403).json({ error: 'الحساب غير مفعل. يرجى التواصل مع مدير النظام.' });
      return;
    }
    const token = signToken({
      uid: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ token, user: sanitizeUser(user) });
  });

  app.post('/api/auth/signup', (_req, res) => {
    res.status(403).json({ error: 'إنشاء الحسابات متاح عبر إدارة الفريق من داخل لوحة التحكم فقط.' });
  });

  app.get('/api/auth/me', requireAuth, (req: Req, res: Res) => {
    res.json({ user: req.authUser });
  });

  // Public bootstrap
  app.get('/api/bootstrap', (_req, res) => {
    const db = readDb();
    res.json({
      categories: [...db.categories].sort((a, b) => a.sortOrder - b.sortOrder),
      projects: [...db.projects].filter((p) => p.published).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
      visits: db.visits.filter((v) => v.published),
      gallery: db.gallery.filter((g) => g.published),
      videos: db.videos.filter((v) => v.published),
      settings: {
        ...db.settings,
        requestFormConfig: normalizeRequestFormConfig(db.settings.requestFormConfig),
      },
    });
  });

  app.get('/api/projects/:slug', (req, res) => {
    const db = readDb();
    const project = db.projects.find((p) => p.slug === req.params.slug && p.published);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json({ project });
  });

  // Public Factory Chatbot (grounded in live platform data via server-side Gemini SDK)
  app.post('/api/chat', async (req, res) => {
    const message = String(req.body?.message || '').trim();
    if (!message) {
      res.status(400).json({ error: 'يرجى كتابة استفسارك أولاً.' });
      return;
    }
    if (message.length > 2000) {
      res.status(400).json({ error: 'الرسالة طويلة جداً، يرجى اختصار الاستفسار.' });
      return;
    }
    const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
    const history: ChatTurnInput[] = rawHistory
      .filter(
        (item: unknown): item is ChatTurnInput =>
          Boolean(item) &&
          typeof item === 'object' &&
          ((item as ChatTurnInput).role === 'user' || (item as ChatTurnInput).role === 'model') &&
          typeof (item as ChatTurnInput).text === 'string',
      )
      .slice(-12);

    try {
      const db = readDb();
      const reply = await generateFactoryChatReply(db, history, message);
      res.json({ reply });
    } catch (err) {
      const statusCode = (err as { statusCode?: number })?.statusCode || 500;
      const errMessage =
        err instanceof Error ? err.message : 'تعذر معالجة الاستفسار حالياً. يرجى المحاولة لاحقاً.';
      res.status(statusCode).json({ error: errMessage });
    }
  });

  // Public RFQ / Contact submission
  app.post('/api/quotes', (req, res) => {
    const body = req.body || {};
    const customerName = String(body.customerName || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    if (!customerName || (!email && !phone)) {
      res.status(400).json({ error: 'Please provide your name and at least an email or phone number.' });
      return;
    }
    const db = readDb();
    const nextNum = db.quotes.length + 41;
    const rawSpecs = body.customSpecs && typeof body.customSpecs === 'object' ? body.customSpecs : undefined;
    const customSpecs = rawSpecs
      ? {
          vehicleMakeModel: String(rawSpecs.vehicleMakeModel || '').trim(),
          vehicleYear: String(rawSpecs.vehicleYear || '').trim(),
          vehicleStatus: String(rawSpecs.vehicleStatus || '').trim(),
          roofHeightProfile: String(rawSpecs.roofHeightProfile || '').trim(),
          bodyMaterial: String(rawSpecs.bodyMaterial || '').trim(),
          widthMeters: Number(rawSpecs.widthMeters) || undefined,
          exteriorColor: String(rawSpecs.exteriorColor || '').trim(),
          tankMaterial: String(rawSpecs.tankMaterial || '').trim(),
          fuelTankLiters: Number(rawSpecs.fuelTankLiters) || 0,
          powerSystem: String(rawSpecs.powerSystem || '').trim(),
          acSystem: String(rawSpecs.acSystem || '').trim(),
          selectedFeatures: Array.isArray(rawSpecs.selectedFeatures)
            ? rawSpecs.selectedFeatures.map((x: unknown) => String(x)).filter(Boolean)
            : [],
          targetTimeline: String(rawSpecs.targetTimeline || '').trim(),
          city: String(rawSpecs.city || '').trim(),
          customAnswers: Array.isArray(rawSpecs.customAnswers)
            ? rawSpecs.customAnswers
                .filter((a: unknown) => a && typeof a === 'object')
                .map((a: Record<string, unknown>) => ({
                  sectionTitle: String(a.sectionTitle || '').trim(),
                  label: String(a.label || '').trim(),
                  value: String(a.value || '').trim(),
                }))
                .filter((a: { label: string; value: string }) => a.label && a.value)
            : [],
        }
      : undefined;

    const quote: QuoteRequest = {
      id: `qt-${Date.now()}`,
      referenceCode: `RFQ-2026-${String(nextNum).padStart(3, '0')}`,
      customerName,
      companyName: String(body.companyName || 'Private Client').trim(),
      email,
      phone,
      country: String(body.country || 'Qatar').trim(),
      categorySlug: String(body.categorySlug || 'caravan-projects'),
      projectTitle: String(body.projectTitle || 'Custom Fabrication Inquiry').trim(),
      lengthMeters: Number(body.lengthMeters) || 5.0,
      capacityLiters: Number(body.capacityLiters) || 250,
      insulationTier:
        body.insulationTier === 'expedition_pro' || body.insulationTier === 'gcc_thermal'
          ? body.insulationTier
          : 'standard',
      offGridPackage: Boolean(body.offGridPackage),
      estimatedPriceQar: Number(body.estimatedPriceQar) || 0,
      estimatedLeadWeeks: Number(body.estimatedLeadWeeks) || 0,
      customSpecs,
      notes: String(body.notes || '').trim(),
      internalNotes: '',
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    db.quotes.unshift(quote);
    writeDb(db);
    res.status(201).json({ quote });
  });

  // Admin overview & full datasets
  app.get('/api/admin/overview', requireAuth, (_req, res) => {
    const db = readDb();
    const quotesByStatus = {
      new: db.quotes.filter((q) => q.status === 'new').length,
      reviewing: db.quotes.filter((q) => q.status === 'reviewing').length,
      quoted: db.quotes.filter((q) => q.status === 'quoted').length,
      in_production: db.quotes.filter((q) => q.status === 'in_production').length,
      completed: db.quotes.filter((q) => q.status === 'completed').length,
    };
    const sortedCats = [...db.categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const categoryBreakdown = sortedCats.map((c) => ({
      slug: c.slug,
      nameEn: c.nameEn,
      nameAr: c.nameAr,
      projectsCount: db.projects.filter((p) => p.categorySlug === c.slug).length,
      quotesCount: db.quotes.filter((q) => q.categorySlug === c.slug).length,
    }));
    const pipelineValueQar = db.quotes
      .filter((q) => q.status !== 'completed')
      .reduce((acc, q) => acc + (q.estimatedPriceQar || 0), 0);

    res.json({
      counts: {
        projects: db.projects.length,
        publishedProjects: db.projects.filter((p) => p.published).length,
        visits: db.visits.length,
        gallery: db.gallery.length,
        videos: db.videos.length,
        categories: db.categories.length,
        users: db.users.length,
        quotes: db.quotes.length,
        openQuotes: db.quotes.filter((q) => q.status !== 'completed').length,
        pipelineValueQar,
      },
      quotesByStatus,
      categoryBreakdown,
      recentQuotes: db.quotes.slice(0, 5),
      projects: [...db.projects].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
      visits: db.visits,
      gallery: db.gallery,
      videos: db.videos,
      categories: sortedCats,
      users: db.users.map(sanitizeUser),
      quotes: db.quotes,
      settings: {
        ...db.settings,
        requestFormConfig: normalizeRequestFormConfig(db.settings.requestFormConfig),
      },
    });
  });

  // Image/media upload endpoint (Base64 Data URL -> saved in data/uploads/)
  app.post('/api/admin/upload', requireAuth, async (req, res) => {
    const { fileName, dataUrl } = req.body || {};
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      res.status(400).json({ error: 'Valid base64 dataUrl is required.' });
      return;
    }
    const match = dataUrl.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({ error: 'Invalid media payload.' });
      return;
    }
    const mime = match[1];
    const ext = mime.includes('png')
      ? 'png'
      : mime.includes('webp')
        ? 'webp'
        : mime.includes('svg')
          ? 'svg'
          : mime.includes('mp4')
            ? 'mp4'
            : mime.includes('webm')
              ? 'webm'
              : 'jpg';
    const baseName = slugify(String(fileName || 'upload').replace(/\.[^.]+$/, '')) || 'asset';
    const finalName = `${baseName}-${Date.now()}.${ext}`;
    const bytes = Uint8Array.from(Buffer.from(match[2], 'base64'));
    await bindings().UPLOADS.put(finalName, bytes, { metadata: { mime } });
    res.json({ url: `/uploads/${finalName}` });
  });

  // Admin Projects CRUD
  app.post('/api/admin/projects', requireAuth, (req, res) => {
    const db = readDb();
    const b = req.body || {};
    const titleEn = String(b.titleEn || b.titleAr || '').trim();
    const titleAr = String(b.titleAr || b.titleEn || '').trim();
    if (!titleEn && !titleAr) {
      res.status(400).json({ error: 'Project title is required.' });
      return;
    }
    const baseSlug = slugify(b.slug || titleEn || `project-${Date.now()}`) || `project-${Date.now()}`;
    const slug = db.projects.some((p) => p.slug === baseSlug) ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    const maxOrder = db.projects.reduce((m, p) => Math.max(m, p.sortOrder ?? 0), 0);
    const project: Project = {
      id: `prj-${Date.now()}`,
      slug,
      titleEn,
      titleAr,
      descriptionEn: String(b.descriptionEn || ''),
      descriptionAr: String(b.descriptionAr || ''),
      categorySlug: String(b.categorySlug || db.categories[0]?.slug || 'caravan-projects'),
      completionDate: String(b.completionDate || new Date().toISOString().slice(0, 10)),
      specs: Array.isArray(b.specs) ? b.specs : [],
      specsAr: Array.isArray(b.specsAr) ? b.specsAr : [],
      visualKey: b.visualKey || 'aluminum-caravan',
      images: Array.isArray(b.images) ? b.images : [],
      videoUrl: String(b.videoUrl || ''),
      sortOrder: b.sortOrder !== undefined ? Number(b.sortOrder) : maxOrder + 1,
      featured: Boolean(b.featured),
      published: b.published !== false,
      leadTimeWeeks: Number(b.leadTimeWeeks) || 4,
      startingPriceQar: Number(b.startingPriceQar) || 95000,
      dimensions: String(b.dimensions || '5.0m × 2.2m'),
      material: String(b.material || '5083 Marine Aluminum'),
      createdAt: new Date().toISOString(),
    };
    db.projects.push(project);
    writeDb(db);
    res.status(201).json({ project });
  });

  app.post('/api/admin/projects/reorder', requireAuth, (req, res) => {
    const orderedIds = Array.isArray(req.body?.orderedIds) ? (req.body.orderedIds as string[]) : [];
    const db = readDb();
    const orderMap = new Map<string, number>();
    orderedIds.forEach((id, index) => orderMap.set(id, index + 1));
    db.projects = db.projects.map((p) =>
      orderMap.has(p.id) ? { ...p, sortOrder: orderMap.get(p.id)! } : p,
    );
    writeDb(db);
    res.json({ ok: true });
  });

  app.put('/api/admin/projects/:id', requireAuth, (req, res) => {
    const db = readDb();
    const idx = db.projects.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const existing = db.projects[idx];
    const b = req.body || {};
    db.projects[idx] = {
      ...existing,
      titleEn: b.titleEn !== undefined ? String(b.titleEn) : existing.titleEn,
      titleAr: b.titleAr !== undefined ? String(b.titleAr) : existing.titleAr,
      descriptionEn: b.descriptionEn !== undefined ? String(b.descriptionEn) : existing.descriptionEn,
      descriptionAr: b.descriptionAr !== undefined ? String(b.descriptionAr) : existing.descriptionAr,
      categorySlug: b.categorySlug !== undefined ? String(b.categorySlug) : existing.categorySlug,
      completionDate: b.completionDate !== undefined ? String(b.completionDate) : existing.completionDate,
      specs: Array.isArray(b.specs) ? b.specs : existing.specs,
      specsAr: Array.isArray(b.specsAr) ? b.specsAr : existing.specsAr,
      visualKey: b.visualKey || existing.visualKey,
      images: Array.isArray(b.images) ? b.images : existing.images,
      videoUrl: b.videoUrl !== undefined ? String(b.videoUrl) : existing.videoUrl,
      sortOrder: b.sortOrder !== undefined ? Number(b.sortOrder) : existing.sortOrder,
      featured: b.featured !== undefined ? Boolean(b.featured) : existing.featured,
      published: b.published !== undefined ? Boolean(b.published) : existing.published,
      leadTimeWeeks: b.leadTimeWeeks !== undefined ? Number(b.leadTimeWeeks) : existing.leadTimeWeeks,
      startingPriceQar: b.startingPriceQar !== undefined ? Number(b.startingPriceQar) : existing.startingPriceQar,
      dimensions: b.dimensions !== undefined ? String(b.dimensions) : existing.dimensions,
      material: b.material !== undefined ? String(b.material) : existing.material,
    };
    writeDb(db);
    res.json({ project: db.projects[idx] });
  });

  app.delete('/api/admin/projects/:id', requireAuth, (req, res) => {
    const db = readDb();
    db.projects = db.projects.filter((p) => p.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Visits CRUD
  app.post('/api/admin/visits', requireAuth, (req, res) => {
    const db = readDb();
    const b = req.body || {};
    const titleEn = String(b.titleEn || '').trim();
    if (!titleEn) {
      res.status(400).json({ error: 'Title (English) is required.' });
      return;
    }
    const baseSlug = slugify(b.slug || titleEn) || `visit-${Date.now()}`;
    const slug = db.visits.some((v) => v.slug === baseSlug) ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    const visit: Visit = {
      id: `vis-${Date.now()}`,
      slug,
      titleEn,
      titleAr: String(b.titleAr || titleEn),
      descriptionEn: String(b.descriptionEn || ''),
      descriptionAr: String(b.descriptionAr || ''),
      type: b.type === 'achievement' || b.type === 'exhibition' ? b.type : 'visit',
      locationEn: String(b.locationEn || 'Doha, Qatar'),
      locationAr: String(b.locationAr || 'الدوحة، قطر'),
      eventDate: String(b.eventDate || new Date().toISOString().slice(0, 10)),
      visualKey: b.visualKey || 'katara-pavilion',
      images: Array.isArray(b.images) ? b.images : [],
      isKataraFeatured: Boolean(b.isKataraFeatured),
      published: b.published !== false,
      createdAt: new Date().toISOString(),
    };
    db.visits.unshift(visit);
    writeDb(db);
    res.status(201).json({ visit });
  });

  app.put('/api/admin/visits/:id', requireAuth, (req, res) => {
    const db = readDb();
    const idx = db.visits.findIndex((v) => v.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Visit not found' });
      return;
    }
    const existing = db.visits[idx];
    const b = req.body || {};
    db.visits[idx] = {
      ...existing,
      titleEn: b.titleEn ?? existing.titleEn,
      titleAr: b.titleAr ?? existing.titleAr,
      descriptionEn: b.descriptionEn ?? existing.descriptionEn,
      descriptionAr: b.descriptionAr ?? existing.descriptionAr,
      type: b.type ?? existing.type,
      locationEn: b.locationEn ?? existing.locationEn,
      locationAr: b.locationAr ?? existing.locationAr,
      eventDate: b.eventDate ?? existing.eventDate,
      visualKey: b.visualKey ?? existing.visualKey,
      images: Array.isArray(b.images) ? b.images : existing.images,
      isKataraFeatured: b.isKataraFeatured !== undefined ? Boolean(b.isKataraFeatured) : existing.isKataraFeatured,
      published: b.published !== undefined ? Boolean(b.published) : existing.published,
    };
    writeDb(db);
    res.json({ visit: db.visits[idx] });
  });

  app.delete('/api/admin/visits/:id', requireAuth, (req, res) => {
    const db = readDb();
    db.visits = db.visits.filter((v) => v.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Gallery CRUD
  app.post('/api/admin/gallery', requireAuth, (req, res) => {
    const db = readDb();
    const b = req.body || {};
    const item: GalleryItem = {
      id: `gal-${Date.now()}`,
      titleEn: String(b.titleEn || 'Untitled Media'),
      titleAr: String(b.titleAr || b.titleEn || 'صورة'),
      album: String(b.album || b.category || 'Projects'),
      category: b.category || 'Projects',
      mediaType: b.mediaType === 'video' ? 'video' : 'image',
      mediaUrl: String(b.mediaUrl || ''),
      visualKey: b.visualKey || 'hero-caravan',
      altText: String(b.altText || b.titleEn || 'Al Watan gallery asset'),
      published: b.published !== false,
      createdAt: new Date().toISOString(),
    };
    db.gallery.unshift(item);
    writeDb(db);
    res.status(201).json({ item });
  });

  app.put('/api/admin/gallery/:id', requireAuth, (req, res) => {
    const db = readDb();
    const idx = db.gallery.findIndex((g) => g.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Gallery item not found' });
      return;
    }
    db.gallery[idx] = { ...db.gallery[idx], ...req.body, id: db.gallery[idx].id };
    writeDb(db);
    res.json({ item: db.gallery[idx] });
  });

  app.delete('/api/admin/gallery/:id', requireAuth, (req, res) => {
    const db = readDb();
    db.gallery = db.gallery.filter((g) => g.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Videos CRUD
  app.post('/api/admin/videos', requireAuth, (req, res) => {
    const db = readDb();
    const b = req.body || {};
    const video: VideoItem = {
      id: `vid-${Date.now()}`,
      titleEn: String(b.titleEn || 'Factory Video'),
      titleAr: String(b.titleAr || b.titleEn || 'فيديو المصنع'),
      descriptionEn: String(b.descriptionEn || ''),
      descriptionAr: String(b.descriptionAr || ''),
      sourceType: b.sourceType === 'upload' ? 'upload' : 'youtube',
      videoUrl: String(b.videoUrl || ''),
      visualKey: b.visualKey || 'factory-cnc',
      duration: String(b.duration || '03:00'),
      category: String(b.category || 'Showcase'),
      published: b.published !== false,
      createdAt: new Date().toISOString(),
    };
    db.videos.unshift(video);
    writeDb(db);
    res.status(201).json({ video });
  });

  app.put('/api/admin/videos/:id', requireAuth, (req, res) => {
    const db = readDb();
    const idx = db.videos.findIndex((v) => v.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }
    db.videos[idx] = { ...db.videos[idx], ...req.body, id: db.videos[idx].id };
    writeDb(db);
    res.json({ video: db.videos[idx] });
  });

  app.delete('/api/admin/videos/:id', requireAuth, (req, res) => {
    const db = readDb();
    db.videos = db.videos.filter((v) => v.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Categories CRUD
  app.post('/api/admin/categories', requireAuth, (req, res) => {
    const db = readDb();
    const b = req.body || {};
    const nameEn = String(b.nameEn || b.nameAr || '').trim();
    const nameAr = String(b.nameAr || b.nameEn || '').trim();
    if (!nameEn && !nameAr) {
      res.status(400).json({ error: 'Category name is required.' });
      return;
    }
    const category: Category = {
      id: `cat-${Date.now()}`,
      slug: slugify(b.slug || nameEn || `cat-${Date.now()}`) || `cat-${Date.now()}`,
      nameEn,
      nameAr,
      descriptionEn: String(b.descriptionEn || ''),
      descriptionAr: String(b.descriptionAr || ''),
      imageUrl: String(b.imageUrl || ''),
      visualKey: b.visualKey || 'aluminum-caravan',
      sortOrder: Number(b.sortOrder) || db.categories.length + 1,
      createdAt: new Date().toISOString(),
    };
    db.categories.push(category);
    writeDb(db);
    res.status(201).json({ category });
  });

  app.put('/api/admin/categories/:id', requireAuth, (req, res) => {
    const db = readDb();
    const idx = db.categories.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    db.categories[idx] = { ...db.categories[idx], ...req.body, id: db.categories[idx].id };
    writeDb(db);
    res.json({ category: db.categories[idx] });
  });

  app.delete('/api/admin/categories/:id', requireAuth, (req, res) => {
    const db = readDb();
    db.categories = db.categories.filter((c) => c.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Users CRUD
  app.post('/api/admin/users', requireAuth, (req, res) => {
    const db = readDb();
    const b = req.body || {};
    const email = String(b.email || '').trim().toLowerCase();
    const name = String(b.name || '').trim();
    const password = String(b.password || 'WatanTemp2026!');
    if (!email || !name) {
      res.status(400).json({ error: 'Name and email are required.' });
      return;
    }
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      res.status(409).json({ error: 'User with this email already exists.' });
      return;
    }
    const { hash, salt } = hashPassword(password);
    const created: DatabaseState['users'][number] = {
      id: `usr-${Date.now()}`,
      name,
      nameAr: String(b.nameAr || name),
      email,
      role: b.role || 'editor',
      status: b.status === 'inactive' ? 'inactive' : 'active',
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      salt,
    };
    db.users.push(created);
    writeDb(db);
    res.status(201).json({ user: sanitizeUser(created) });
  });

  app.put('/api/admin/users/:id', requireAuth, (req, res) => {
    const db = readDb();
    const idx = db.users.findIndex((u) => u.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const existing = db.users[idx];
    const b = req.body || {};
    let passwordHash = existing.passwordHash;
    let salt = existing.salt;
    if (b.password && String(b.password).length >= 6) {
      const hashed = hashPassword(String(b.password));
      passwordHash = hashed.hash;
      salt = hashed.salt;
    }
    db.users[idx] = {
      ...existing,
      name: b.name ?? existing.name,
      nameAr: b.nameAr ?? existing.nameAr,
      role: b.role ?? existing.role,
      status: b.status ?? existing.status,
      passwordHash,
      salt,
    };
    writeDb(db);
    res.json({ user: sanitizeUser(db.users[idx]) });
  });

  app.delete('/api/admin/users/:id', requireAuth, (req: Req, res: Res) => {
    if (req.authUser?.id === req.params.id) {
      res.status(400).json({ error: 'You cannot delete your active session account.' });
      return;
    }
    const db = readDb();
    db.users = db.users.filter((u) => u.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Quotes CRUD
  app.put('/api/admin/quotes/:id', requireAuth, (req, res) => {
    const db = readDb();
    const idx = db.quotes.findIndex((q) => q.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Quote request not found' });
      return;
    }
    db.quotes[idx] = {
      ...db.quotes[idx],
      status: req.body?.status ?? db.quotes[idx].status,
      internalNotes: req.body?.internalNotes ?? db.quotes[idx].internalNotes,
      estimatedPriceQar:
        req.body?.estimatedPriceQar !== undefined
          ? Number(req.body.estimatedPriceQar)
          : db.quotes[idx].estimatedPriceQar,
    };
    writeDb(db);
    res.json({ quote: db.quotes[idx] });
  });

  app.delete('/api/admin/quotes/:id', requireAuth, (req, res) => {
    const db = readDb();
    db.quotes = db.quotes.filter((q) => q.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Settings Update
  app.put('/api/admin/settings', requireAuth, (req, res) => {
    const db = readDb();
    const b = req.body || {};
    db.settings = {
      stats: { ...db.settings.stats, ...(b.stats || {}) },
      hero: { ...db.settings.hero, ...(b.hero || {}) },
      secondBanner: { ...db.settings.secondBanner, ...(b.secondBanner || {}) },
      iconsRow: Array.isArray(b.iconsRow) ? b.iconsRow : db.settings.iconsRow,
      about: { ...db.settings.about, ...(b.about || {}) },
      contact: { ...db.settings.contact, ...(b.contact || {}) },
      seo: { ...db.settings.seo, ...(b.seo || {}) },
      requestFormConfig: b.requestFormConfig
        ? normalizeRequestFormConfig(b.requestFormConfig)
        : normalizeRequestFormConfig(db.settings.requestFormConfig),
    };
    writeDb(db);
    res.json({ settings: db.settings });
  });

  // Admin Custom Design Requirements Configuration
  app.put('/api/admin/request-requirements', requireAuth, (req, res) => {
    const db = readDb();
    const normalized = normalizeRequestFormConfig(req.body);
    db.settings = {
      ...db.settings,
      requestFormConfig: normalized,
    };
    writeDb(db);
    res.json({ requestFormConfig: normalized });
  });

  return app;
}
