# 🚀 دليل النشر - Deployment Guide

## خيارات النشر المتاحة

### 1️⃣ Render (موصى به)

#### الخطوات:
1. سجل في [Render.com](https://render.com)
2. اختر "New Static Site"
3. اربط مستودع GitHub الخاص بك
4. ضع الإعدادات التالية:

```
Build Command: npm install && npm run build
Publish Directory: dist
```

5. أضف المتغيرات البيئية في Dashboard:
```
VITE_GEMINI_API_KEY=your_key
VITE_DEEPSEEK_API_KEY=your_key
VITE_OPENROUTER_API_KEY=your_key
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

6. انقر على "Create Static Site"

✅ **مميزات Render**:
- نشر تلقائي عند كل push
- SSL مجاني
- CDN عالمي
- دعم مجاني للمشاريع الصغيرة

---

### 2️⃣ Vercel

#### الخطوات:
1. سجل في [Vercel.com](https://vercel.com)
2. استورد المشروع من GitHub
3. Vercel سيكتشف إعدادات Vite تلقائياً
4. أضف المتغيرات البيئية
5. انقر على "Deploy"

✅ **مميزات Vercel**:
- نشر أسرع
- Preview deployments لكل PR
- تحليلات مدمجة
- Edge Functions

---

### 3️⃣ Netlify

#### الخطوات:
1. سجل في [Netlify.com](https://netlify.com)
2. اختر "New site from Git"
3. اربط المستودع
4. الإعدادات:
```
Build command: npm run build
Publish directory: dist
```
5. أضف المتغيرات البيئية
6. انقر على "Deploy site"

✅ **مميزات Netlify**:
- Forms مدمجة
- Functions بدون خادم
- Split testing
- واجهة سهلة

---

### 4️⃣ GitHub Pages

#### الخطوات:

1. ثبت gh-pages:
```bash
npm install -D gh-pages
```

2. أضف في `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://username.github.io/repository-name"
}
```

3. عدّل `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/repository-name/',
  // ... بقية الإعدادات
})
```

4. نفذ:
```bash
npm run deploy
```

⚠️ **تنبيه**: لا يدعم المتغيرات البيئية مباشرة. استخدم GitHub Actions.

---

### 5️⃣ Cloudflare Pages

#### الخطوات:
1. سجل في [Cloudflare Pages](https://pages.cloudflare.com/)
2. اربط GitHub repo
3. الإعدادات:
```
Build command: npm run build
Build output directory: dist
```
4. أضف المتغيرات البيئية
5. Deploy

✅ **مميزات Cloudflare**:
- أسرع CDN في العالم
- Workers للوظائف بدون خادم
- مجاني بدون حدود bandwidth
- DDoS protection

---

## ⚙️ إعدادات مشتركة

### المتغيرات البيئية المطلوبة:
```bash
VITE_GEMINI_API_KEY=
VITE_DEEPSEEK_API_KEY=
VITE_OPENROUTER_API_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Headers الموصى بها (ملف `_headers`):
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://aistudiocdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.deepseek.com https://openrouter.ai https://*.supabase.co https://generativelanguage.googleapis.com
```

---

## 🔒 أمان النشر

### ✅ قبل النشر:

1. **تحقق من .gitignore**
```bash
# تأكد من أن .env.local مُستبعد
cat .gitignore | grep .env.local
```

2. **احذف .env.local من Git**
```bash
git rm --cached .env.local
```

3. **استخدم متغيرات البيئة من Platform**
- لا تضع API keys في الكود مباشرة
- استخدم dashboard المنصة لإضافة المتغيرات

4. **فعّل HTTPS فقط**
- معظم المنصات توفر هذا تلقائياً

### ⚠️ تحذيرات:

- ❌ لا تدفع ملفات `.env` إلى Git
- ❌ لا تشارك API keys علناً
- ❌ لا تستخدم مفاتيح production في development
- ✅ استخدم مفاتيح منفصلة لكل بيئة

---

## 🧪 اختبار النشر

بعد النشر:

1. **افتح الموقع** وتحقق من تحميل الواجهة
2. **جرب تسجيل الدخول** كمستكشف
3. **ارفع صورة** واختبر التحليل
4. **افتح Developer Console** للتحقق من عدم وجود أخطاء
5. **اختبر على أجهزة مختلفة** (Desktop, Mobile, Tablet)

---

## 📊 المراقبة والصيانة

### أدوات موصى بها:

1. **Sentry** - لتتبع الأخطاء
2. **Google Analytics** - لتحليل الزوار
3. **Uptime Robot** - لمراقبة availability
4. **Lighthouse** - لفحص الأداء

### صيانة دورية:

```bash
# تحديث التبعيات شهرياً
npm update

# فحص الثغرات
npm audit

# إصلاح الثغرات البسيطة
npm audit fix
```

---

## 🆘 حل المشاكل الشائعة

### المشكلة: API Keys لا تعمل
**الحل**:
- تحقق من أن الأسماء صحيحة (VITE_ prefix)
- أعد build المشروع بعد تغيير المتغيرات
- تأكد من عدم وجود مسافات في القيم

### المشكلة: البناء يفشل
**الحل**:
```bash
# امسح node_modules وأعد التثبيت
rm -rf node_modules package-lock.json
npm install
npm run build
```

### المشكلة: Supabase connection error
**الحل**:
- تحقق من RLS policies
- تأكد من صحة URL و Anon Key
- افحص CORS settings في Supabase

---

## 📞 الدعم

إذا واجهت مشاكل في النشر:
- 📧 Email: support@faheem.ai
- 💬 GitHub Issues: [اضغط هنا](https://github.com/mwr0855-rgb/4uecvw/issues)

---

**نصيحة نهائية**: ابدأ بـ Render أو Vercel للنشر الأول، فهما الأسهل والأكثر موثوقية.

✨ حظاً موفقاً في نشر منصتك!
