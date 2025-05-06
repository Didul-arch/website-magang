# Sistem Pendaftaran Internship PT Mada Wikri Tunggal

Sistem pendaftaran internship berbasis Next.js dengan TypeScript dan Firebase untuk PT Mada Wikri Tunggal.

## Fitur

- **Landing Page** – Deskripsi program, profil perusahaan, dan tombol pendaftaran
- **Registrasi & Login** – Form pendaftaran dengan validasi dan autentikasi Firebase
- **Dashboard User** – Progress bar pendaftaran dan navigasi ke tiap tahap
- **Halaman SOP** – Viewer dokumen SOP dengan konfirmasi pembacaan
- **Halaman Tes Online** – Soal multiple-choice dengan bobot penilaian
- **Halaman Hasil** – Tampilan skor dan status kelulusan
- **Admin Panel** – CRUD soal, manajemen peserta, dan export data

## Teknologi

- Next.js 14 (App Router)
- TypeScript
- Firebase (Auth, Firestore)
- Tailwind CSS
- shadcn/ui Components

## Setup Firebase

### 1. Membuat Project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project" dan ikuti langkah-langkah untuk membuat project baru
3. Aktifkan Google Analytics (opsional)

### 2. Mengaktifkan Firebase Authentication

1. Di sidebar Firebase Console, klik "Authentication"
2. Klik "Get started"
3. Aktifkan metode "Email/Password"

### 3. Membuat Firestore Database

1. Di sidebar, klik "Firestore Database"
2. Klik "Create database"
3. Pilih mode "Start in production mode" atau "Start in test mode" (untuk pengembangan)
4. Pilih lokasi server terdekat

### 4. Mendapatkan Firebase Config

1. Di sidebar, klik ikon roda gigi (Project settings)
2. Scroll ke bawah ke "Your apps" dan klik ikon web (</>) untuk menambahkan aplikasi web
3. Beri nama aplikasi dan klik "Register app"
4. Salin konfigurasi Firebase yang muncul, Anda akan memerlukan:
   - apiKey
   - authDomain
   - projectId
   - messagingSenderId
   - appId

### 5. Firestore Rules

Buka "Firestore Database" > "Rules" dan terapkan rules berikut:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own data
    match /users/{userId} {
      allow create;
      allow read, update, delete: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Allow authenticated users to read questions
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
\`\`\`

## Instalasi dan Penggunaan

### Prasyarat

- Node.js 18.x atau lebih baru
- npm atau yarn

### Langkah-langkah Instalasi

1. Clone repository:
   \`\`\`bash
   git clone https://github.com/username/internship-system.git
   cd internship-system
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # atau
   yarn install
   \`\`\`

3. Salin file `.env.local.example` menjadi `.env.local` dan isi dengan konfigurasi Firebase Anda:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

4. Jalankan aplikasi dalam mode development:
   \`\`\`bash
   npm run dev
   # atau
   yarn dev
   \`\`\`

5. Buka [http://localhost:3000](http://localhost:3000) di browser Anda

### Build dan Deploy

1. Build aplikasi:
   \`\`\`bash
   npm run build
   # atau
   yarn build
   \`\`\`

2. Deploy ke Vercel:
   \`\`\`bash
   npm install -g vercel
   vercel
   \`\`\`

   Atau deploy ke Netlify dengan mengikuti instruksi di dashboard Netlify.

## Membuat Admin

Untuk membuat akun admin:

1. Daftar sebagai pengguna biasa melalui halaman registrasi
2. Gunakan Firebase Console untuk mengubah role pengguna:
   - Buka Firestore Database
   - Cari dokumen pengguna di koleksi "users"
   - Edit field "role" menjadi "admin"

## Struktur Folder

\`\`\`
/
├── app/                    # App Router pages
│   ├── admin/              # Admin panel routes
│   ├── dashboard/          # User dashboard routes
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── layout.tsx          # Root layout
├── components/             # Reusable components
├── hooks/                  # Custom hooks
├── lib/                    # Utility functions
│   └── firebase/           # Firebase configuration
├── public/                 # Static assets
├── .env.local.example      # Environment variables example
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies
├── README.md               # Project documentation
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
\`\`\`

## Pengembangan Lebih Lanjut

- Implementasi notifikasi email
- Integrasi dengan sistem HR
- Penambahan fitur upload portofolio
- Dashboard analitik untuk admin
- Sistem penjadwalan wawancara

## Lisensi

[MIT](LICENSE)
