🖐️ Fingerprint Capture & 10-Print Analysis App

Aplikasi web untuk pengambilan sidik jari 10-print, penggabungan otomatis menggunakan Fingerprint Web SDK.

Dirancang agar mudah dioperasikan oleh operator, minim klik, dan langsung menghasilkan file export siap arsip.

✨ Fitur Utama

✅ Deteksi otomatis fingerprint reader

✅ Auto-start scan setelah reader dipilih

✅ Capture 10 jari (kanan & kiri)

✅ Indikator progres jari (real-time)

✅ Preview fingerprint live

✅ Auto-merge 10 fingerprint ke 1 gambar

✅ Input profil user:

Nama

Tanggal lahir

Golongan darah

✅ Ringkasan pola otomatis di hasil export

✅ Export PNG dengan nama file dinamis

✅ Fully client-side (HTML + JS)

⚠️ Catatan ilmiah:
Analisis ini bersifat klasifikasi visual sederhana, bukan penentuan kepribadian dan tidak untuk identifikasi forensik.

🧩 Struktur Aplikasi
/project-root
│
├── index.html
├── app.js
├── app.css
│
├── /lib
│   ├── jquery.min.js
│   ├── bootstrap.min.js
│
├── /scripts
│   ├── websdk.client.bundle.min.js
│   ├── fingerprint.sdk.min.js
│
└── /images

🚀 Alur Operasional (Operator Friendly)

Hubungkan fingerprint reader

Buka aplikasi di browser (Chrome / Edge)

Pilih Reader

Sistem otomatis:

Mengaktifkan tombol scan

Menampilkan status

Klik Start

Scan jari sesuai indikator:

Kanan → Kiri

Total 10 jari

Setelah jari ke-10:

Scan berhenti otomatis

10-print digabung

Klik Export 10-Print

📦 Format Hasil Export
🖼️ Format File

PNG

🧾 Konten di dalam gambar:

Profil user (satu baris, besar, warna putih)

10 sidik jari (2 baris × 5 kolom)

Label jari

📁 Nama File Otomatis
NAMA_TGLLAHIR_GOLDARAH_FINGERPRINT.png
Contoh:
BUDI_SANTOSO_12031990_O_FINGERPRINT.png

🛠️ Teknologi yang Digunakan

HTML5 + Canvas

JavaScript (Vanilla + jQuery)

Bootstrap

Fingerprint Web SDK

Browser API (Canvas, File Download)

⚠️ Catatan Penting

Aplikasi tidak menyimpan data ke server

Semua proses berjalan di browser

Tidak melakukan:

Pencocokan identitas

Penilaian kepribadian

Verifikasi biometrik forensik

Semoga Bermanfaat
