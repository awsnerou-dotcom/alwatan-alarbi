# النشر على Cloudflare (مجاني)

1. ارفع محتويات المشروع إلى مستودع GitHub.
2. Cloudflare ← Workers & Pages ← Create ← Import a repository ← اختر المستودع.
3. Build command: `npm run build` — Deploy command: `npx wrangler deploy` (الافتراضي).
4. بعد أول نشر: Settings ← Variables and Secrets ← أضف (من نوع Secret):
   - `AUTH_SECRET`  نص عشوائي طويل (32 حرفاً أو أكثر)
   - `ADMIN_EMAIL`  admin@alwatan.qa
   - `ADMIN_PASSWORD`  كلمة سر قوية جديدة (بها يدخل الأدمن)
   - `GEMINI_API_KEY`  مفتاح Gemini
5. Settings ← Domains & Routes ← Add ← Custom domain.

قاعدة البيانات (D1) ومخزن الصور (KV) يُنشآن تلقائياً عند أول نشر.
