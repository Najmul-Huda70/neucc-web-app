# NEUCC — Build, Test, Run & Deploy Guide

## 0. প্রথমেই উত্তর: কার account লাগবে, আর "super admin" দরকার কিনা

**কোনো আলাদা "super admin" role সিস্টেমে নেই, আর লাগবেও না।** এর বদলে একটা
**one-time bootstrap** ধাপ আছে, যেটা website দিয়ে না, সরাসরি terminal/CLI
থেকে করতে হয়:

1. **একবারই**, `npm run prisma:onboard-admin` script চালিয়ে **President**-এর
   account সরাসরি database-এ তৈরি করা হয় (কোনো web UI ছাড়াই — কারণ website-এর
   কোনো account-তৈরির route (`POST /api/panel/users`) নিজেই President-only,
   আর প্রথম President না থাকলে সেটা কেউ কল করতে পারবে না — এই circular
   সমস্যা এড়াতেই এই CLI script আছে)।
2. এরপর সেই President **সাইটে normally login করে**, dashboard থেকে:
   - Election Committee তৈরি করে (`/dashboard/committees`)
   - তার সদস্যদের account তৈরি করে, যার মধ্যে **Chief Election
     Commissioner**-ও থাকবে (`/dashboard/members`-এর মতো ধাঁচেই, তবে এটা
     এখনো UI নাই — নিচে "Users UI নাই" নোট দেখুন)
   - CEC-কে "election access" grant করে (`/dashboard` → grant-access action)
3. এরপর থেকে **প্রতি বছর এটা নিজে থেকেই চলবে**: CEC পুরনো Executive
   Committee dissolve করবে → election হবে → ফলাফল publish করলেই পরের বছরের
   পুরো Executive Committee-র account **automatically** তৈরি হয়ে যাবে
   (email-এ password পাঠানো হবে) — কাউকে ম্যানুয়ালি আর account বানাতে হবে
   না।

**সংক্ষেপে:** হ্যাঁ, একজনকে root/bootstrap হিসেবে লাগবে — কিন্তু সেটা কোনো
স্থায়ী "super admin" role না, এটা শুধু **প্রথম President-কে জন্ম দেওয়ার
জন্য একবারের CLI কমান্ড**। এরপর সিস্টেম নিজের নিয়মেই (President → Election
Committee → CEC → পরের President) স্বয়ংক্রিয়ভাবে চলতে থাকে।

⚠️ **এখনো user তৈরির কোনো UI পেজ নাই** (শুধু backend API আছে,
`POST /api/panel/users` — Step 2)। মানে President-কে প্রথম কয়েকজন committee
member (বিশেষ করে CEC) যোগ করতে হলে আপাতত `curl`/Postman দিয়ে API call
করতে হবে, অথবা UI বানিয়ে নিতে হবে। এটা roadmap-এ নেই এখনো — চাইলে এটা
পরের একটা ছোট step হতে পারে।

---

## 1. আগে থেকে যেসব account লাগবে

| # | Account | কী জন্য | লিংক |
|---|---------|---------|------|
| 1 | **GitHub** | কোড হোস্ট করা, Vercel-এর সাথে connect করা | github.com |
| 2 | **Neon** | PostgreSQL database (serverless) | neon.tech |
| 3 | **Vercel** | Hosting/deployment | vercel.com |
| 4 | **Anthropic** (API key) | AI Notice drafting (Step 8) — না থাকলে ওই ফিচার শুধু বন্ধ থাকবে, বাকি সব চলবে | console.anthropic.com |
| 5 | **SMTP provider** (Gmail App Password / SendGrid / Mailgun ইত্যাদি) | Email notification (Step 9) — না থাকলে email পাঠানো skip হবে, credential আগের মতোই on-screen দেখাবে | — |

**GitHub আর Neon আর Vercel — এই তিনটা ছাড়া deploy করাই যাবে না। বাকি দুটো (৪ ও ৫) optional — কোড graceful-ই থাকে সেগুলো ছাড়া।**

---

## 2. Local Setup & Build

```bash
# ১. রিপো ক্লোন/এক্সট্র্যাক্ট করে ঢুকুন
cd neucc-real

# ২. dependency install
npm install

# ৩. .env ফাইল বানান
cp .env.example .env
```

`.env` এ minimum যা লাগবে (local dev-এর জন্য):
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/neucc?schema=public"
JWT_ACCESS_SECRET="<openssl rand -base64 48 দিয়ে বানান>"
JWT_REFRESH_SECRET="<আরেকটা আলাদা random string>"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```
বাকিগুলো (`ANTHROPIC_API_KEY`, `SMTP_*`) local-এ ফাঁকা রাখলেও চলবে।

### Local PostgreSQL (Neon-এ যাওয়ার আগে দ্রুত টেস্ট করতে)
```bash
docker run --name neucc-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=neucc -p 5432:5432 -d postgres:16
```

### Schema + Build
```bash
npx prisma generate
npx prisma migrate dev        # সব migration apply করে, dev মোডে
npm run build                 # production build ঠিকমতো হচ্ছে কিনা check
```

---

## 3. Testing

```bash
npm run lint            # ESLint
npm run test             # Vitest — এক দফা রান করে
npm run test:watch       # কোড লেখার সময় live run
npm run test:coverage    # coverage রিপোর্ট
```

সব `git commit`/push করার আগে অন্তত `npm run lint && npm run test && npm run build` — এই তিনটা পাস করা উচিত।

---

## 4. Local Run

এই প্রজেক্টে **কোনো demo/fake data নেই** — `prisma:seed` শুধু structural
reference data বসায় (২০টা constitutional post, আর কয়েকটা fund head
category), এগুলো ছাড়া সিস্টেমই কাজ করবে না। কোনো account, event, contest,
বা gallery item seed হয় না। **একমাত্র account যেটা তৈরি হবে তা হলো
President-এর নিজের account, নিচের কমান্ড দিয়ে:**

```bash
npm run prisma:seed              # শুধু posts + fund heads

ADMIN_NAME="প্রকৃত সভাপতির নাম" \
ADMIN_EMAIL="real.president@example.com" \
ADMIN_PASSWORD="একটা শক্তিশালী ১২+ ক্যারেক্টার পাসওয়ার্ড" \
npm run prisma:onboard-admin

npm run dev
```
এরপর সেই email/password দিয়ে `/login`-এ ঢুকুন। এটাই একমাত্র account —
বাকি সব committee member account President নিজে dashboard থেকে তৈরি
করবেন (Step 2-এর `POST /api/panel/users`, UI বানানো হয়েছে
`/dashboard/users`-এ)।

---

## 5. Neon Database সেটআপ

1. **neon.tech**-এ sign up করুন (GitHub দিয়েই করা যায়)
2. নতুন Project বানান — region কাছাকাছি (যেমন Singapore/Mumbai) বেছে নিন
3. Project খুলে **"Connection string"** কপি করুন — দুই ধরনের URL পাবেন:
   - **Pooled connection** (`-pooler` সহ hostname) → এটাই `DATABASE_URL`
   - **Direct connection** → দরকার নেই এই প্রজেক্টে (`.env.example`-এ শুধু `DATABASE_URL` আছে)
4. `.env`-এ (বা Vercel-এর environment variable-এ) বসান:
   ```env
   DATABASE_URL="postgresql://user:pass@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neucc?sslmode=require"
   ```
5. Migration Neon-এর বিরুদ্ধে চালান:
   ```bash
   npx prisma migrate deploy
   ```
6. এরপর **onboard-admin** চালান Neon-এর বিরুদ্ধে (§4-এর মতো, শুধু
   `DATABASE_URL` Neon-এর দিয়ে)।

---

## 6. Vercel Deployment

### ধাপ ১ — GitHub-এ push
```bash
git init   # যদি আগে থেকে না থাকে
git add .
git commit -m "NEUCC full-stack — ready for deploy"
git remote add origin https://github.com/<your-username>/neucc-web.git
git push -u origin main
```

### ধাপ ২ — Vercel-এ import
1. vercel.com → **Add New → Project**
2. GitHub রিপো select করুন — Vercel নিজেই Next.js detect করে নেবে
3. **Environment Variables** সেকশনে সব `.env` variable বসান (Neon-এর
   `DATABASE_URL` সহ, আর real `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`
   generate করে বসান — local-এর সাথে same না রাখাই ভালো)
4. `NEXT_PUBLIC_SITE_URL` বসান আপনার আসল Vercel domain দিয়ে (যেমন
   `https://neucc.vercel.app`) — deploy হওয়ার পর domain জানলে update করে
   redeploy করুন
5. **Deploy** চাপুন

### ধাপ ৩ — Chromium (PDF feature)-এর জন্য বিশেষ নজর
Step 7-এ বানানো PDF জেনারেশন (`puppeteer-core` + `@sparticuz/chromium`)
Vercel-এ কাজ করতে হলে:
- Project Settings → Functions → Memory অন্তত **1024 MB** সেট করুন
  (Chromium এর জন্য ডিফল্ট 128MB যথেষ্ট না)
- `next.config.ts`-এ আগে থেকেই `serverExternalPackages` সেট করা আছে, তাই
  এটা নিয়ে আলাদা কিছু করতে হবে না
- PDF/report route-গুলোতে আগে থেকেই `maxDuration = 30` সেট করা আছে —
  Hobby plan-এও এটা কাজ করে (Hobby-এর সর্বোচ্চ 60s, এটার মধ্যেই পড়ে)

### ধাপ ৪ — First-time migration Vercel থেকে
Vercel নিজে থেকে migration চালায় না ডিফল্টে। দুই অপশন:
- **সহজ:** deploy-এর আগে নিজের মেশিন থেকেই `DATABASE_URL` Neon-এর দিয়ে
  `npx prisma migrate deploy` চালিয়ে নিন (§5-এ যেমন করেছেন)
- **Automated:** `package.json`-এর `build` script-কে
  `"build": "prisma migrate deploy && next build"` করে দিতে পারেন, যাতে
  প্রতি deploy-এ automatic migration চলে (ছোট দল হলে এটাই সুবিধাজনক)

### ধাপ ৫ — Deploy-এর পর bootstrap
Neon-এর বিরুদ্ধে migration হয়ে গেলে, **§4**-এর `onboard-admin` কমান্ডটা আবার
চালান — কিন্তু এবার `DATABASE_URL` আপনার নিজের `.env`-এ Neon-এর pooled URL
বসিয়ে, নিজের লোকাল মেশিন থেকেই:
```bash
DATABASE_URL="<neon pooled url>" \
ADMIN_NAME="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." \
npm run prisma:onboard-admin
```
এরপর সেই email/password দিয়ে আপনার Vercel URL-এ গিয়ে `/login` করুন —
সিস্টেম লাইভ।

---

## 7. Delivery Checklist (ক্লাব/committee-কে হস্তান্তরের আগে)

- [ ] `.env` এর কোনো secret (JWT secrets, DB password, API keys) GitHub-এ
      commit হয়নি — `.gitignore`-এ `.env` আছে কিনা নিশ্চিত করুন
- [ ] Production database-এ শুধু `prisma:seed` (posts/fund heads) আর
      `prisma:onboard-admin` চালানো হয়েছে — এর বাইরে কোনো data নেই
- [ ] President-এর real email/password নিরাপদে (এনক্রিপ্টেড চ্যাট/
      password manager দিয়ে) হস্তান্তর করা হয়েছে, প্লেইন টেক্সটে না
- [ ] `ADMIN_PASSWORD` env var deploy-এর পর মুছে ফেলা হয়েছে (script নিজেই
      শেষে এই reminder দেয়)
- [ ] `docs/` ফোল্ডারের সব `STEP_*_CHANGELOG.md` আর
      `SECURITY_FIX_AUTH_BYPASS.md` committee-র technical contact-কে
      দেওয়া হয়েছে, যাতে তারা জানে কী কী এখনো অসম্পূর্ণ (file storage,
      approval workflow, ইত্যাদি)
- [ ] `ANTHROPIC_API_KEY`/`SMTP_*` সেট করা না থাকলে, President/committee-কে
      জানানো হয়েছে যে AI drafting আর email notification off থাকবে যতক্ষণ
      না এগুলো যোগ করা হয়
