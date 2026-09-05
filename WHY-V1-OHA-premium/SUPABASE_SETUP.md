# WHY — Cloud Sync Kurulumu (Supabase)

Bu adımları tamamlamadan uygulama sorunsuz çalışmaya devam eder — sadece cihaz bazlı (local) modda kalır. Cloud sync opsiyoneldir.

## 1. Supabase projesi oluştur

1. https://supabase.com adresine git, ücretsiz hesap aç.
2. "New Project" ile bir proje oluştur (isim, şifre, region seç — region olarak Frankfurt/eu-central-1 Türkiye'ye en yakını).
3. Proje oluşunca sol menüden **Settings → API** sayfasına git.
4. **Project URL** ve **anon public** key değerlerini kopyala.

## 2. Ortam değişkenlerini ayarla

Proje klasöründe `.env.example` dosyasını `.env.local` olarak kopyala:

```
cp .env.example .env.local
```

İçini kendi değerlerinle doldur:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## 3. Veritabanı tablolarını oluştur

Supabase Dashboard → **SQL Editor** → **New query**, aşağıdaki SQL'i yapıştırıp çalıştır. Eğer daha önce sadece `decisions` tablosunu oluşturduysan, sadece `setups`, `checklists`, `profiles` bloklarını (aşağıda ayrı ayrı ayrılmış) çalıştırman yeterli — `decisions` zaten var olduğu için o kısmı tekrar çalıştırma.

```sql
create table decisions (
  id uuid primary key,
  user_id uuid references auth.users not null,
  created_at timestamptz not null default now(),
  pair text not null,
  direction text not null,
  score integer not null,
  decision text not null,
  answers jsonb not null default '{}'::jsonb,
  reasoning text default '',
  invalidation text default '',
  sentence text default '',
  result text not null default 'pending',
  rr numeric
);

alter table decisions enable row level security;

create policy "Users can view their own decisions"
  on decisions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own decisions"
  on decisions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own decisions"
  on decisions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own decisions"
  on decisions for delete
  using (auth.uid() = user_id);

-- ---------- Setup Library ----------
create table setups (
  id uuid primary key,
  user_id uuid references auth.users not null,
  created_at timestamptz not null default now(),
  name text not null,
  pair text not null,
  prefill jsonb not null default '{}'::jsonb
);

alter table setups enable row level security;

create policy "Users can view their own setups"
  on setups for select
  using (auth.uid() = user_id);

create policy "Users can insert their own setups"
  on setups for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own setups"
  on setups for delete
  using (auth.uid() = user_id);

-- ---------- Pre-Trade Checklist (tek satır, kullanıcı başına) ----------
create table checklists (
  user_id uuid primary key references auth.users,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table checklists enable row level security;

create policy "Users can view their own checklist"
  on checklists for select
  using (auth.uid() = user_id);

create policy "Users can upsert their own checklist"
  on checklists for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own checklist"
  on checklists for update
  using (auth.uid() = user_id);

-- ---------- Profile (tema/dil/accent, tek satır kullanıcı başına) ----------
create table profiles (
  user_id uuid primary key references auth.users,
  username text not null default 'Trader',
  member_since timestamptz not null default now(),
  theme text not null default 'light',
  accent text not null default 'amber',
  lang text not null default 'en',
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = user_id);

create policy "Users can upsert their own profile"
  on profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = user_id);
```

Bu, Row Level Security (RLS) ile her kullanıcının SADECE kendi verilerini görebilmesini/değiştirebilmesini garanti eder. Dört tablo da aynı mantıkla çalışır: `user_id = auth.uid()` olmayan satırlara hiç kimse erişemez.

## 4. Email onayını kapat (opsiyonel, hızlı test için)

Varsayılan olarak Supabase, kayıt olduktan sonra email onayı ister. Test ederken bunu atlamak istersen:

Dashboard → **Authentication → Providers → Email** → "Confirm email" seçeneğini kapat.

Prod'a çıkarken tekrar açman önerilir (spam hesap açılmasını engeller).

## 5. Kur ve çalıştır

```
npm install
npm run dev
```

Artık uygulama açılışta bir giriş ekranı gösterecek. "Hesapsız devam et" ile eski local modda kalabilir, ya da kayıt olup cloud sync'i aktif edebilirsin.

## Şu an neler senkronize oluyor, neler olmuyor

- ✅ **Decisions / Journal** — Supabase'e kaydediliyor, giriş yaptığın her cihazda görünür.
- ✅ **Setup Library** — kaydettiğin setup'lar artık cloud'da, her cihazda aynı liste.
- ✅ **Pre-Trade Checklist** — check durumların ve eklediğin maddeler cloud'da senkronize.
- ✅ **Profile ayarları (tema/accent/dil/username)** — giriş yaptığın her cihazda aynı görünür.
- ✅ **Streaks & Achievements** — zaten Decisions verisinden türetiliyor, o senkronize olunca bunlar da otomatik doğru çıkar; ayrı bir tabloya gerek yok.

İlk kez giriş yaptığında (yani cloud'da henüz o kullanıcı için satır yoksa) checklist ve profile, o ana kadar cihazında biriken local veriyle otomatik "seed" edilir — hiçbir şey kaybolmaz.

## Sorun giderme

- Giriş ekranı hiç çıkmıyorsa: `.env.local` dosyasının doğru okunduğundan emin ol, dev server'ı yeniden başlat (`npm run dev`).
- "Cloud sync not configured" hatası: env değişkenleri eksik/yanlış demektir.
- Kayıt olduktan sonra giriş yapamıyorsan: email onayını kontrol et (adım 4).
