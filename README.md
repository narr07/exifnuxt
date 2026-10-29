# ExifNuxt

<p align="center">
  <img src="public/logo.svg" alt="ExifNuxt Logo" width="128" height="128" />
</p>

<p align="center">
  <strong>Editor metadata EXIF foto presisi untuk desktop dan web.</strong><br>
  Dibangun dengan Tauri 2 + Nuxt 4 + Nuxt UI 4 dari template <a href="https://github.com/NicolaSpadari/nuxtor">Nuxtor</a>.
</p>

<p align="center">
  <a href="https://narr07.github.io/exifnuxt/">Website & Web Demo</a> ·
  <a href="https://github.com/narr07/exifnuxt/releases">Unduh Rilis</a> ·
  <a href="#fitur">Fitur</a> ·
  <a href="#menjalankan">Menjalankan</a>
</p>

---

Dibuat oleh [Dinar Permadi Yusup](https://permadi.dev) ([GitHub](https://github.com/narr07)). Kode sumber: [narr07/exifnuxt](https://github.com/narr07/exifnuxt).

## Fitur Utama

- **Buka & Seret Foto**: Buka foto lewat dialog (`Ctrl+O`) atau seret langsung ke jendela. Format: JPEG, PNG, WebP, TIFF, HEIC/HEIF, JPEG XL.
- **Edit Per File**: Kamera, lensa, pengaturan pemotretan (aperture, shutter speed, ISO, focal length), waktu, fotografer, hak cipta, deskripsi, lokasi GPS.
- **Edit Massal (Batch)**: Centang beberapa foto, ubah field yang ingin disamakan (misalnya merek bodi kamera atau lensa). Field yang tidak disentuh tetap seperti semula di tiap foto.
- **Salin Grup Field**: Salin kelompok field tertentu (misalnya Lokasi atau Pengaturan Kamera) atau seluruh field, lalu tempel ke foto lain. Teksnya juga otomatis masuk ke clipboard sistem.
- **Tempel Koordinat Pintar**: Mendukung tempel langsung koordinat desimal `Lat, Long` dari clipboard (Google Maps / OpenStreetMap).
- **Hapus EXIF (Privasi)**: Hapus seluruh metadata secara permanen atau buat salinan baru tanpa EXIF sebelum membagikan foto ke publik.
- **Tab Semua Tag**: Melihat dan menyalin seluruh tag EXIF mentah, lengkap dengan fungsi pencarian instan.
- **Navigasi Cepat**: Pintasan keyboard `↑` dan `↓` untuk beralih antar foto, `Ctrl+A` untuk pilih semua, dan `Ctrl+S` untuk simpan.

Hanya field yang benar-benar diubah yang ditulis ke file, sehingga nilai asli dari kamera tidak ikut berubah.

## Pintasan Papan Ketik (Shortcuts)

| Shortcut | Aksi |
|---|---|
| `Ctrl + O` | Buka dialog pemilihan foto |
| `Ctrl + S` | Simpan perubahan (menimpa file asli) |
| `Ctrl + Shift + S` | Simpan sebagai salinan baru |
| `↑` / `↓` | Navigasi ke foto sebelumnya / berikutnya |
| `Ctrl + A` | Pilih semua foto untuk mode massal |
| `Esc` | Batalkan pilihan massal |

## Menjalankan & Membangun

Membutuhkan [Bun](https://bun.sh), Rust, dan [prasyarat Tauri 2](https://v2.tauri.app/start/prerequisites/).

```bash
# Pasang dependensi
bun install

# Jalankan dalam mode pengembangan desktop
bun run tauri:dev

# Bangun website statis (untuk GitHub Pages / Web)
bun run generate

# Bangun paket installer desktop (Windows / macOS / Linux)
bun run tauri:build
```

## Alur Rilis & Deployment

- **GitHub Pages**: Workflow `.github/workflows/deploy-pages.yml` akan otomatis meng-generate dan mempublikasikan website ke GitHub Pages pada branch `main`.
- **Rilis Multiplatform Desktop**: Workflow `.github/workflows/release.yml` otomatis membangun installer Windows (`.exe`), macOS (`.dmg` Apple Silicon & Intel), dan Linux (`.deb`, `.AppImage`) saat push ke branch `release`, tag `v*`, atau via pemicu manual `workflow_dispatch`.

## Struktur Direktori

- `src-tauri/src/exif.rs`: Command Rust `read_exif`, `write_exif`, `strip_exif` berbasis `kamadak-exif` dan `little_exif`.
- `app/composables/usePhotoLibrary.ts`: State management foto, batch edit, salin/tempel, pembacaan file web/desktop.
- `app/components/`: `PhotoList`, `PhotoPreview`, `ExifInspector`, `ExifField`, `BatchEditor`, `ContactSheet`, `PhotoEditorWorkspace`, `ExifLogo`.
- `app/pages/`: `index.vue` (Landing page / website + deteksi desktop) dan `app.vue` (Editor workspace).
- `public/`: Asset statis, logo SVG, dan icon.
- `DESIGN.md`: Dokumentasi arah estetika desain kamar gelap (*Darkroom Safelight*).
