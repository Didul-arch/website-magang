# Website Magang PT Mada Wikri Tunggal

Platform pendaftaran internship dengan sistem tes online dan rekomendasi AI.

## 🎯 Fitur Utama

**User Flow:**
Landing Page → Pilih Vacancy → Register/Login → Application Form → Baca SOP → Tes Online → Hasil

**Admin Flow:**
Dashboard → Kelola Vacancy & Soal → Lihat Pendaftar → AI Recommendation → Keputusan Akhir

## 🚀 Progress

### ✅ Done

- [x] Database & API setup
- [x] Authentication (Supabase)
- [x] UI Components (shadcn/ui)
- [x] Landing page dengan vacancy list
- [x] Header dengan user info dan dropdown

### 🔄 In Progress

- [ ] Auth pages (login/register)
- [ ] Application form
- [ ] Test system

### 📝 Todo

- [ ] Admin dashboard
- [ ] AI CV analysis (OpenAI)

## 🛠️ Tech Stack

Next.js 15 • TypeScript • Prisma • Supabase • shadcn/ui

## 🚀 Quick Start

```bash
pnpm install
pnpm prisma generate
pnpm dev
```

## 📡 API Endpoints

```
GET  /api/auth/me           # Current user
POST /api/vacancy/list      # Vacancy list with filters
GET  /api/vacancy/[id]      # Vacancy detail
POST /api/internship        # Submit application
```

## 🗂️ Database

User → Application → Vacancy → Question/Answer → Scoring

---

README sebagai progress tracker - update checklist setiap fitur selesai!
