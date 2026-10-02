# ExifNuxt

Editor metadata EXIF foto untuk desktop, dibangun dengan Tauri 2 + Nuxt 4 + Nuxt UI 4 dari template [Nuxtor](https://github.com/NicolaSpadari/nuxtor).

Dibuat oleh [Dinar Permadi Yusup](https://permadi.dev) ([GitHub](https://github.com/narr07)). Kode sumber: [narr07/exifnuxt](https://github.com/narr07/exifnuxt).

## Fitur

- Buka foto lewat dialog (`Ctrl+O`) atau seret file ke jendela. Format: JPEG, PNG, WebP, TIFF, HEIC/HEIF, JPEG XL.
- Edit per file: kamera, lensa, pengaturan pemotretan, waktu, fotografer, hak cipta, deskripsi, lokasi GPS.
- Edit massal: centang beberapa foto, ubah field yang ingin disamakan (misalnya merek dan model kamera). Field yang tidak disentuh tetap seperti semula di tiap foto.
- Salin field per grup (misalnya Lokasi) atau semua field, lalu tempel ke foto lain. Teksnya juga masuk ke clipboard sistem.
- Tab "Semua tag" untuk melihat dan menyalin seluruh tag EXIF.
- Simpan (`Ctrl+S`) langsung menimpa file asli. Salinan hanya dibuat kalau memilih "Simpan sebagai salinan" (`Ctrl+Shift+S`). Bisa juga hapus semua EXIF.

Hanya field yang benar-benar diubah yang ditulis ke file, jadi nilai asli dari kamera tidak ikut berubah.

## Menjalankan

Butuh [Bun](https://bun.sh), Rust, dan [prasyarat Tauri](https://v2.tauri.app/start/prerequisites/).

```bash
bun install
bun run tauri:dev     # mode pengembangan
bun run tauri:build   # build installer
```

## Struktur

- `src-tauri/src/exif.rs`: command Rust `read_exif`, `write_exif`, `strip_exif`. Membaca pakai `kamadak-exif`, menulis pakai `little_exif`.
- `app/composables/usePhotoLibrary.ts`: state daftar foto, simpan, salin/tempel, edit massal.
- `app/components/`: `PhotoList`, `PhotoPreview`, `ExifInspector`, `ExifField`, `BatchEditor`, `ContactSheet`.
- `DESIGN.md`: arah desain UI.

## Catatan

- Di PNG, EXIF ditulis ke chunk zTXt "Raw profile type exif" (konvensi ImageMagick/exiftool).
- Ikon aplikasi dibuat dari `public/logo.png` dengan `bun tauri icon public/logo.png`.
