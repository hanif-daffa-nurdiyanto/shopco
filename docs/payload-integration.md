# Payload CMS Integration Plan

## Tujuan

Dokumen ini menjadi panduan implementasi Payload CMS untuk storefront Shop.co yang saat ini memiliki Homepage, Product Detail, Category, dan Cart.

Target utamanya:

- editor dapat mengelola konten tanpa memahami struktur kode frontend;
- admin panel tersusun berdasarkan fungsi bisnis, bukan berdasarkan detail teknis;
- form panjang dibagi ke dalam tab yang jelas;
- field status, relasi utama, slug, dan informasi publikasi ditempatkan di sidebar;
- data berulang dan dapat dicari disimpan sebagai Collection;
- konfigurasi tunggal serta komposisi halaman disimpan sebagai Global;
- frontend tetap menggunakan Server Components dan Payload Local API;
- cart tetap menjadi state aplikasi, bukan dokumen konten CMS.

## Prinsip Penataan Admin

### Grup navigasi utama

Gunakan `admin.group` agar sidebar utama Payload memiliki susunan berikut:

1. **Content**
   - Products
   - Categories
   - Brands
   - Reviews
2. **Commerce**
   - Orders
   - Promotions
3. **Pages**
   - Homepage
4. **Site Settings**
   - Header
   - Footer
   - Store Settings
5. **System**
   - Media
   - Users

Urutan ini mengikuti alur kerja editor: mengelola katalog, mengelola transaksi, menyusun halaman, lalu mengubah konfigurasi situs.

### Pedoman penggunaan tab

Tab digunakan untuk memisahkan pekerjaan yang memiliki tujuan berbeda, bukan sekadar memecah form berdasarkan jumlah field.

- **Content** berisi data yang terlihat langsung oleh pelanggan.
- **Media** berisi gambar, gallery, dan aset visual.
- **Pricing & Inventory** berisi harga, SKU, variant, dan stok.
- **Merchandising** berisi featured status, urutan, related products, badge, dan placement.
- **SEO** berisi metadata mesin pencari dan social sharing.
- **Moderation** berisi status review atau proses internal.
- **Advanced** hanya digunakan untuk opsi teknis yang jarang disentuh.

Gunakan tab tanpa `name` jika field sebaiknya tetap berada di root dokumen. Gunakan named tab hanya jika struktur data bertingkat memang dibutuhkan oleh frontend/API.

### Pedoman penggunaan sidebar dokumen

Sidebar dokumen hanya berisi field ringkas yang sering dibutuhkan sebelum publish:

- status atau visibility;
- slug;
- relasi utama seperti category atau product;
- featured flag;
- publish date;
- sort/order priority;
- moderation state.

Jangan menaruh rich text, gallery, variant list, atau konfigurasi kompleks di sidebar.

### Pedoman layout field

- Gunakan `row` untuk pasangan field pendek seperti harga dan compare-at price.
- Gunakan `collapsible` dengan `initCollapsed: true` untuk pengaturan lanjutan.
- Tambahkan `admin.description` untuk field yang berdampak ke storefront.
- Gunakan label editor-friendly dan hindari istilah implementasi seperti `heroConfig` atau `renderMode`.
- Batasi array dengan `minRows` dan `maxRows` sesuai kapasitas desain.
- Gunakan conditional fields agar editor hanya melihat field yang relevan.

## Global vs Collection

| Data                                                   | Jenis      | Alasan                                                                                |
| ------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------- |
| Header dan announcement bar                            | Global     | Hanya satu konfigurasi aktif untuk seluruh situs.                                     |
| Footer, newsletter, link groups, social, payment logos | Global     | Dipakai bersama oleh semua halaman dan hanya memiliki satu versi aktif.               |
| Homepage composition                                   | Global     | Homepage adalah single-instance page dengan section yang sudah ditentukan desain.     |
| Store settings                                         | Global     | Currency, delivery fee, default discount, dan informasi toko berlaku secara global.   |
| Products                                               | Collection | Memiliki banyak entri, perlu search, filter, relasi, status, dan slug unik.           |
| Categories                                             | Collection | Memiliki banyak entri dan dipakai untuk navigasi serta filtering.                     |
| Brands                                                 | Collection | Memiliki banyak entri dan direlasikan ke produk serta brand strip.                    |
| Reviews                                                | Collection | Banyak entri per produk serta membutuhkan moderation.                                 |
| Promotions                                             | Collection | Dapat memiliki banyak kode, periode aktif, aturan, dan batas penggunaan.              |
| Orders                                                 | Collection | Satu dokumen per transaksi dan perlu query berdasarkan status/pelanggan.              |
| Users                                                  | Collection | Collection auth bawaan Payload untuk admin/editor dan pelanggan bila diperlukan.      |
| Media                                                  | Collection | Upload collection untuk gambar produk, logo, dan aset konten.                         |
| Cart aktif                                             | Bukan CMS  | State sementara disimpan di client/session/database commerce, bukan authored content. |

## Collections

### Products

Slug: `products`  
Admin group: `Content`  
Title field: `name`  
Default columns: `name`, `category`, `brand`, `price`, `stockStatus`, `_status`, `updatedAt`

#### Tab: Content

- `name`: text, required, indexed.
- `shortDescription`: textarea, required.
- `description`: rich text.
- `details`: array atau rich text untuk material, care, dan detail produk.

#### Tab: Media

- `featuredImage`: upload ke `media`, required.
- `gallery`: array upload ke `media`, minimal 1 gambar.
- `altOverride`: optional bila alt produk perlu berbeda dari Media.

#### Tab: Pricing & Inventory

- `sku`: text, required, unique, indexed.
- `price`: number, required, minimum 0.
- `compareAtPrice`: number, optional.
- `costPrice`: number, optional dan dibatasi untuk role tertentu.
- `trackInventory`: checkbox.
- `stock`: number dengan conditional field saat inventory dilacak.
- `variants`: array berisi kombinasi warna, ukuran, SKU, harga override, dan stock.
- `stockStatus`: virtual/computed field untuk list view.

#### Tab: Merchandising

- `badge`: select seperti `none`, `new`, `sale`, `bestSeller`.
- `relatedProducts`: relationship `hasMany` ke `products`.
- `isFeatured`: checkbox.
- `featuredSections`: select `hasMany` untuk new arrivals atau top selling bila diperlukan.
- `sortPriority`: number.

#### Tab: SEO

- `meta.title`: text.
- `meta.description`: textarea.
- `meta.image`: upload ke `media`.
- `canonicalUrl`: text, optional.

#### Sidebar

- `slug`: auto-generated, required, unique, indexed.
- `category`: relationship ke `categories`, required, indexed.
- `brand`: relationship ke `brands`.
- `visibility`: select untuk `catalog`, `hidden`, atau `archived`.
- `publishedAt`: date.
- `_status`: otomatis dari drafts.

Aktifkan `versions: { drafts: true }` dan live preview setelah frontend sudah membaca data Payload.

### Categories

Slug: `categories`  
Admin group: `Content`  
Title field: `name`  
Default columns: `name`, `parent`, `productCount`, `sortOrder`, `_status`

#### Tab: Overview

- `name`: text, required.
- `description`: textarea atau rich text.
- `heroImage`: upload ke `media`, optional.

#### Tab: Catalog Presentation

- `featuredProducts`: relationship `hasMany` ke `products`.
- `defaultSort`: select seperti popular, newest, price ascending, price descending.
- `showFilters`: checkbox.
- `availableFilterGroups`: select `hasMany` untuk price, color, size, brand, dan dress style.

#### Tab: SEO

- metadata title, description, image, dan canonical URL.

#### Sidebar

- `slug`: required, unique, indexed.
- `parent`: self relationship, optional.
- `isVisible`: checkbox.
- `sortOrder`: number.
- `_status`: draft/published.

Nilai filter seperti warna dan ukuran sebaiknya berasal dari variant Products, bukan diketik ulang pada Category.

### Brands

Slug: `brands`  
Admin group: `Content`  
Title field: `name`

#### Tab: Content

- `name`: text, required.
- `description`: textarea.
- `website`: text.

#### Tab: Media

- `logo`: upload ke `media`, required.
- `logoLight`: upload optional untuk background gelap.

#### Sidebar

- `slug`: unique dan indexed.
- `isFeatured`: checkbox untuk brand strip.
- `sortOrder`: number.
- `isActive`: checkbox.

### Reviews

Slug: `reviews`  
Admin group: `Content`  
Title field: gunakan custom label yang menggabungkan author dan product  
Default columns: `authorName`, `product`, `rating`, `status`, `createdAt`

#### Tab: Review

- `authorName`: text, required.
- `authorEmail`: email, tidak ditampilkan di frontend.
- `content`: textarea, required.
- `rating`: number, required, minimum 1, maksimum 5.
- `verifiedPurchase`: checkbox.

#### Tab: Moderation

- `moderatorNotes`: textarea.
- `moderatedBy`: relationship ke `users`.
- `moderatedAt`: date.

#### Sidebar

- `product`: relationship ke `products`, required, indexed.
- `status`: select `pending`, `approved`, `rejected`, `spam`.
- `featured`: checkbox.

Public read access hanya mengembalikan review berstatus `approved`. Create access publik harus memakai validasi, rate limit, dan sanitasi input melalui endpoint khusus.

### Promotions

Slug: `promotions`  
Admin group: `Commerce`  
Title field: `code`

#### Tab: Rules

- `code`: text, required, unique, uppercase.
- `type`: select `percentage` atau `fixed`.
- `value`: number, required.
- `minimumSubtotal`: number.
- `maximumDiscount`: number, optional.
- `appliesTo`: relationship ke products/categories atau seluruh order.

#### Tab: Limits

- `startsAt` dan `endsAt`.
- `usageLimit`.
- `usageLimitPerCustomer`.
- `usedCount`: read-only/computed.

#### Sidebar

- `isActive`.
- `priority`.
- status computed: scheduled, active, expired, exhausted.

### Orders

Slug: `orders`  
Admin group: `Commerce`  
Title field: `orderNumber`  
Default columns: `orderNumber`, `customerEmail`, `total`, `paymentStatus`, `fulfillmentStatus`, `createdAt`

#### Tab: Items

- snapshot item array: product ID, name, SKU, selected variant, quantity, unit price, dan line total.
- Data produk disimpan sebagai snapshot agar order lama tidak berubah ketika produk diedit.

#### Tab: Customer & Shipping

- customer identity.
- shipping address.
- billing address.
- delivery method.

#### Tab: Payment

- subtotal, discount, delivery fee, tax, dan total.
- payment provider serta provider reference.
- Jangan menyimpan nomor kartu atau data pembayaran sensitif.

#### Tab: Timeline

- status events sebagai append-only array.
- internal notes.

#### Sidebar

- `orderNumber`: read-only, indexed, unique.
- `paymentStatus`.
- `fulfillmentStatus`.
- `customer`: relationship optional ke `users`.
- `promotion`: relationship optional ke `promotions`.

Orders tidak menggunakan public create access langsung. Checkout harus melalui endpoint/server action terkontrol yang memvalidasi ulang harga, stok, promo, dan total di server.

### Media

Pertahankan sebagai upload Collection dan tambahkan:

- `alt`: required.
- `caption`: optional.
- image sizes untuk thumbnail, product card, product detail, dan social sharing.
- MIME restriction untuk gambar yang didukung.
- admin group `System`.

### Users

Pertahankan sebagai auth Collection dan tambahkan:

- `name`.
- `roles`: `admin`, `editor`, `customer` dengan `saveToJWT: true`.
- field role dan status ditempatkan di sidebar.
- admin group `System`.

## Globals

### Header

Slug: `header`  
Admin group: `Site Settings`

#### Tab: Announcement

- enabled state.
- message.
- link label dan URL.
- optional start/end date.

#### Tab: Navigation

- logo text atau logo media.
- nav item array dengan label, link type, reference/URL, dan optional children.
- batasi jumlah item sesuai kapasitas desain.

#### Tab: Actions

- search placeholder.
- cart label/accessibility label.
- account label/accessibility label.

#### Sidebar

- `isActive`.
- optional preview note/UI field.

### Footer

Slug: `footer`  
Admin group: `Site Settings`

#### Tab: Brand

- logo text atau image.
- brand description.
- social links array.

#### Tab: Navigation

- link groups array dengan heading dan links.
- batasi jumlah group dan link agar tetap sesuai layout.

#### Tab: Newsletter

- heading.
- email placeholder.
- submit label.
- success/error messages.

#### Tab: Legal & Payments

- copyright text.
- legal links.
- payment method logos dan urutan.

#### Sidebar

- `isActive`.
- `showNewsletter`.

### Homepage

Slug: `homepage`  
Admin group: `Pages`

Homepage tetap berupa schema section yang terarah, bukan page builder bebas, agar editor tidak merusak komposisi desain.

#### Tab: Hero

- heading.
- description.
- CTA label dan link.
- desktop/mobile hero image.
- statistics array, maksimal 3.

#### Tab: Brands

- relationship `hasMany` ke `brands`.
- heading optional.

#### Tab: Product Sections

- new arrivals heading dan selected products.
- top selling heading dan selected products.
- opsi selection mode `manual` atau `automatic`.
- jika automatic, query memakai badge/featured status dari Products.

#### Tab: Dress Styles

- array maksimal 4 berisi label, image, dan relationship ke Category.

#### Tab: Testimonials

- heading.
- relationship `hasMany` ke review approved/featured.

#### Tab: SEO

- meta title, description, image, dan structured data options.

#### Sidebar

- `publishedAt`.
- `_status` bila Global versions/drafts diaktifkan.

### Store Settings

Slug: `store-settings`  
Admin group: `Site Settings`

#### Tab: General

- store name.
- support email.
- currency dan locale.
- default product image fallback.

#### Tab: Commerce

- default delivery fee.
- free shipping threshold.
- tax display settings.
- cart expiration/session settings.

#### Tab: SEO Defaults

- title template.
- default description.
- default share image.

#### Sidebar

- maintenance mode.
- catalog enabled.

## Reusable Field Factories

Simpan factory di `src/fields/` agar schema konsisten:

- `slug-field.ts` untuk slug, generate toggle, unique, dan index.
- `link-field.ts` untuk internal relationship atau external URL.
- `seo-fields.ts` untuk metadata.
- `color-field.ts` untuk label dan nilai hex.
- `money-fields.ts` untuk price/compare-at price dengan validasi.
- `product-selector-field.ts` untuk manual/automatic product selection.

Factory menerima overrides agar tetap fleksibel tanpa menduplikasi konfigurasi.

## Struktur Folder yang Direncanakan

```text
src/
├── access/
│   ├── authenticated.ts
│   ├── editor-or-admin.ts
│   └── published-or-authenticated.ts
├── collections/
│   ├── brands.ts
│   ├── categories.ts
│   ├── media.ts
│   ├── orders.ts
│   ├── products.ts
│   ├── promotions.ts
│   ├── reviews.ts
│   └── users.ts
├── fields/
│   ├── link-field.ts
│   ├── money-fields.ts
│   ├── product-selector-field.ts
│   ├── seo-fields.ts
│   └── slug-field.ts
├── globals/
│   ├── footer.ts
│   ├── header.ts
│   ├── homepage.ts
│   └── store-settings.ts
├── hooks/
│   ├── calculate-order-totals.ts
│   ├── revalidate-storefront.ts
│   └── set-published-at.ts
└── payload.config.ts
```

Nama file mengikuti aturan proyek: `kebab-case`, komponen/factory memakai arrow function, dan named exports berada di bagian bawah file.

## Alur Data Frontend

### Homepage

- Ambil Homepage Global.
- Populate selected Brands, Products, Categories, dan Reviews menggunakan depth terkontrol.
- Gunakan `select` agar hanya field yang dirender dikirim ke frontend.
- Pertahankan fallback data lokal sampai proses migrasi konten selesai.

### Category Page

- Query Category berdasarkan slug.
- Query Products berdasarkan category, variant filters, visibility, dan `_status`.
- Sort dan pagination berasal dari search params.
- Filter values dihitung dari product variants atau agregasi terkontrol.

### Product Detail

- Query Product berdasarkan slug.
- Ambil approved reviews dengan pagination terpisah.
- Batasi depth relasi; related products memakai `select` ringkas.
- Generate metadata dari Product SEO dengan fallback Store Settings.

### Cart

- Cart aktif tetap berada di client/session.
- Saat menambahkan item, simpan product ID, variant ID, dan quantity saja.
- Harga dan stok harus divalidasi ulang melalui server sebelum checkout.
- Promo divalidasi terhadap Promotions, bukan dihitung dari input client.

## Access Control dan Keamanan

- Public hanya dapat membaca dokumen published/visible.
- Admin memiliki akses penuh.
- Editor dapat mengelola content tetapi tidak dapat melihat cost price atau mengubah order payment state.
- Customer hanya dapat membaca order miliknya jika auth customer diaktifkan.
- Local API yang berjalan atas nama user wajib menggunakan `overrideAccess: false`.
- Nested operation dalam hooks wajib meneruskan `req` agar tetap dalam transaksi yang sama.
- Gunakan `req.context` untuk mencegah hook revalidation atau update berjalan berulang.
- Review submission dan checkout tidak membuka unrestricted collection create access.

## Draft, Preview, dan Revalidation

- Aktifkan drafts untuk Products, Categories, Homepage, Header, dan Footer.
- Reviews, Promotions, dan Orders memakai status bisnis eksplisit, bukan drafts.
- Tambahkan live preview setelah route frontend sudah membaca Payload.
- `afterChange` dan `afterDelete` melakukan revalidation pada route terkait.
- Revalidation Homepage dijalankan saat featured Product, Brand, Category, atau Review berubah.

## Migrasi dari Data Lokal

- Pertahankan data `src/libs/` sebagai seed source sementara.
- Buat seed idempotent: cari berdasarkan slug/SKU sebelum create.
- Upload aset dari `public/images/figma` ke Media.
- Buat Brands dan Categories sebelum Products.
- Buat Products sebelum Reviews dan Homepage relationships.
- Bandingkan output frontend dengan desain sebelum menghapus fallback lokal.

## Analisis Urutan Implementasi

Checklist harus dikerjakan berdasarkan dependency, bukan berdasarkan urutan halaman storefront. Setiap bagian di bawah adalah satu batch kerja AI yang sebaiknya diselesaikan, diverifikasi, dan dicatat sebelum berpindah ke bagian berikutnya.

| Urutan | Batch                              | Mengapa dikerjakan pada tahap ini                                                                        | Gate sebelum lanjut                                                   |
| ------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1      | Fondasi identity dan schema        | Role, access, Media, dan field factory dipakai oleh hampir semua schema lain.                            | Config valid, admin dapat login, dan helper memiliki unit test dasar. |
| 2      | Katalog inti                       | Brands dan Categories menjadi dependency Products; Reviews bergantung pada Products.                     | Schema dapat dimigrasikan dan CRUD katalog berjalan di admin.         |
| 3      | Commerce schema                    | Promotions dan Orders memerlukan Product/User yang stabil.                                               | Kalkulasi dan access rules lulus integration test.                    |
| 4      | Globals                            | Homepage mereferensikan Brands, Categories, Products, dan Reviews sehingga harus dibuat setelah katalog. | Semua Global dapat disimpan dan relationship valid.                   |
| 5      | Registrasi dan generated artifacts | Types baru akurat setelah seluruh schema tahap awal terdaftar.                                           | Types, import map, lint, dan build berhasil.                          |
| 6      | Seed dan migrasi aset              | Seed membutuhkan schema dan generated types yang sudah stabil.                                           | Seed dapat dijalankan dua kali tanpa duplikasi.                       |
| 7      | Data access dan content storefront | Frontend baru dipindahkan setelah data CMS tersedia dan dapat dibandingkan dengan fallback.              | Homepage, Category, dan Product Detail render dari Payload.           |
| 8      | Cart dan checkout                  | Commerce write-flow dikerjakan setelah product pricing, stock, promo, dan Order schema stabil.           | Harga tidak dipercaya dari client dan pembuatan Order transaksional.  |
| 9      | Editorial workflow dan SEO         | Preview, revalidation, dan metadata bergantung pada query frontend final.                                | Draft preview dan cache invalidation bekerja end-to-end.              |
| 10     | Hardening dan cleanup              | Test menyeluruh dan penghapusan fallback adalah langkah terakhir.                                        | Tidak ada fallback data, regression, atau akses yang terlalu longgar. |

Langkah pertama yang disarankan adalah **Bagian 1 — Fondasi Identity, Access, dan Shared Schema**. Jangan memulai integrasi halaman atau seed sebelum Bagian 1–5 selesai karena perubahan schema akan terus mengubah generated types dan bentuk query.

## Checklist Implementasi

### Bagian 1 — Fondasi Identity, Access, dan Shared Schema

- [x] Tetapkan konstanta role `admin`, `editor`, dan `customer` beserta matriks izin setiap role.
- [x] Perluas Users dengan name, roles, status, dan `saveToJWT`.
- [x] Buat access helpers untuk admin, editor, customer, dan public published content.
- [x] Perluas Media dengan caption, MIME restrictions, dan image sizes storefront.
- [x] Buat reusable field factories untuk slug, link, SEO, money, color, dan product selector.
- [x] Tambahkan unit test dasar untuk access helpers dan field validation.
- [x] Verifikasi login admin, pembatasan role, upload Media, lint, dan TypeScript sebelum lanjut.

---

### Bagian 2 — Katalog Inti

- [x] Buat Brands Collection dengan tab Content/Media dan field status di sidebar.
- [x] Buat Categories Collection dengan tab Overview/Catalog Presentation/SEO dan field publikasi di sidebar.
- [x] Buat Products Collection dengan tab Content/Media/Pricing & Inventory/Merchandising/SEO.
- [x] Tambahkan variants, SKU, stock validation, pricing validation, dan computed stock status ke Products.
- [x] Buat Reviews Collection dengan tab Review/Moderation dan status moderation di sidebar.
- [x] Aktifkan drafts untuk Brands, Categories, dan Products sesuai kebutuhan editorial.
- [x] Verifikasi CRUD, relationship, unique slug/SKU, draft behavior, dan tampilan tab/sidebar di admin.

---

### Bagian 3 — Commerce Schema

- [x] Buat Promotions Collection dengan rules, validity window, usage limits, dan restrictive access.
- [x] Buat pure calculation helpers untuk subtotal, discount, delivery fee, tax, dan total.
- [x] Buat Orders Collection dengan item snapshot, totals, payment, shipping, timeline, dan restrictive access.
- [x] Pastikan Orders dan Promotions tidak memiliki unrestricted public create/update access.
- [x] Tambahkan integration test untuk promotion rules, immutable item snapshot, dan order total calculation.

---

### Bagian 4 — Globals dan Komposisi Halaman

- [x] Buat Store Settings Global dengan tab General/Commerce/SEO Defaults.
- [x] Buat Header Global dengan tab Announcement/Navigation/Actions.
- [x] Buat Footer Global dengan tab Brand/Navigation/Newsletter/Legal & Payments.
- [x] Buat Homepage Global dengan tab Hero/Brands/Product Sections/Dress Styles/Testimonials/SEO.
- [x] Aktifkan versions/drafts untuk Header, Footer, dan Homepage.
- [x] Verifikasi batas array, conditional fields, relationship filters, dan UX tab/sidebar seluruh Global.

---

### Bagian 5 — Registrasi Schema dan Generated Artifacts

- [x] Daftarkan Collections ke `payload.config.ts` dengan urutan Users, Media, Brands, Categories, Products, Reviews, Promotions, dan Orders.
- [x] Daftarkan Globals ke `payload.config.ts` dengan urutan Store Settings, Header, Footer, dan Homepage.
- [x] Pastikan `admin.group`, labels, default columns, searchable fields, dan default sort konsisten.
- [x] Jalankan migrasi database Payload untuk schema baru.
- [x] Jalankan `pnpm generate:types` setelah seluruh schema terdaftar.
- [x] Jalankan `pnpm generate:importmap` jika ada custom admin component.
- [x] Verifikasi lint, TypeScript, production build, dan admin panel sebelum membuat seed.

---

### Bagian 6 — Seed dan Migrasi Aset

- [x] Buat utility seed idempotent yang mencari record berdasarkan slug, SKU, code, atau key sebelum create/update.
- [x] Migrasikan aset Figma lokal ke Media Collection tanpa menduplikasi upload.
- [x] Seed Brands dan Categories sebelum Products.
- [x] Seed Products beserta variants, pricing, stock, images, dan relationships.
- [x] Seed approved Reviews setelah Products tersedia.
- [x] Seed Promotions dan contoh Orders hanya untuk development/test environment.
- [x] Seed Store Settings, Header, Footer, dan Homepage setelah seluruh relationship target tersedia.
- [x] Jalankan seed dua kali dan verifikasi jumlah record tidak bertambah pada proses kedua.

---

### Bagian 7 — Typed Data Access dan Storefront Content

- [x] Buat data access layer typed untuk Store Settings, Header, Footer, Homepage, Category, Product Detail, dan Reviews.
- [x] Tetapkan `depth`, `select`, pagination, dan cache strategy secara eksplisit pada setiap query.
- [x] Integrasikan Header dan Footer frontend dengan Globals serta fallback aman.
- [x] Integrasikan Homepage dengan Homepage Global dan related Collections.
- [x] Integrasikan Category Page dengan query, filters, sorting, dan pagination berbasis search params.
- [x] Integrasikan Product Detail dengan slug, variants, related products, dan approved reviews.
- [x] Tambahkan not-found dan empty states untuk slug, category, products, dan reviews yang tidak tersedia.
- [x] Bandingkan hasil Payload dengan fallback lokal sebelum melanjutkan ke cart/checkout.

---

### Bagian 8 — Cart, Promotion, dan Checkout

- [x] Implementasikan cart session yang hanya menyimpan product ID, variant ID, dan quantity.
- [x] Buat server-side cart resolver untuk mengambil ulang harga, availability, dan stock dari Payload.
- [x] Implementasikan server-side promotion validation dan kalkulasi ulang cart totals.
- [x] Implementasikan checkout server action/endpoint dengan input validation dan access yang ketat.
- [x] Buat Order secara transaksional serta teruskan `req` ke seluruh nested Payload operation.
- [x] Kurangi atau reservasi stock secara transaksional dan cegah overselling.
- [x] Tambahkan idempotency key agar retry checkout tidak membuat Order ganda.
- [x] Tambahkan integration test untuk cart tampering, invalid promo, insufficient stock, dan duplicate checkout.

---

### Bagian 9 — Editorial Workflow, Revalidation, dan SEO

- [x] Tambahkan hooks revalidation dengan `req` dan context guard untuk mencegah loop.
- [x] Petakan perubahan Product, Category, Brand, Review, dan Global ke route yang harus direvalidate.
- [x] Aktifkan live preview untuk Products, Categories, Homepage, Header, dan Footer.
- [x] Pastikan draft hanya dapat dibaca oleh preview request yang terautentikasi.
- [x] Tambahkan metadata SEO dan fallback dari Store Settings pada seluruh route storefront.
- [x] Tambahkan canonical URL, Open Graph image, dan structured data Product yang tervalidasi.
- [x] Verifikasi publish, unpublish, preview, dan revalidation tanpa restart aplikasi.

---

### Bagian 10 — Hardening, Regression Test, dan Cleanup

- [ ] Tambahkan integration tests untuk access control, product queries, reviews, promotions, orders, dan Globals.
- [ ] Tambahkan end-to-end tests untuk workflow admin editor dan storefront Homepage/Category/Product/Cart.
- [ ] Audit seluruh Local API call yang membawa user agar menggunakan `overrideAccess: false`.
- [ ] Audit hooks agar nested operation meneruskan `req` dan memakai context guard bila dapat memicu loop.
- [ ] Audit query depth, select, indexes, upload limits, dan data sensitif pada API response.
- [ ] Hapus fallback data dari `src/libs/` setelah seluruh halaman stabil menggunakan Payload.
- [ ] Jalankan migration, seed, lint, TypeScript, integration tests, end-to-end tests, dan production build dari database kosong.
- [ ] Lakukan visual QA desktop/mobile setelah seluruh fallback data lokal dihapus.
