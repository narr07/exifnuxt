# ExifNuxt: arah desain

Ditulis oleh Claude atas permintaan pemilik project (belum ada brief dari pemilik). Arah buatan AI cenderung generik; ganti bagian mana pun yang tidak cocok.

## Identitas

Alat desktop untuk fotografer yang ingin melihat, membetulkan, atau menghapus metadata EXIF sebelum foto dibagikan. Suasananya meja kerja kamar gelap: tenang, fotonya yang paling terang di layar, dan semua kontrol mengalah ke foto.

Dial: ENERGY 1 / RHYTHM 2 / MOTION 1

## Warna

- Netral: `stone` (abu hangat). Alasan: abu dingin membuat warna kulit di foto terlihat pucat; abu hangat lebih netral untuk menilai foto.
- Aksen tunggal: `amber`, seperti lampu safelight kamar gelap. Hanya dipakai untuk aksi utama (Simpan), foto yang sedang dipilih, dan penanda "belum disimpan".
- Merah (`error`) hanya untuk aksi yang merusak data: hapus semua EXIF.
- Mode gelap jadi default karena foto dinilai lebih akurat di sekitar yang gelap (alasan yang sama dengan aplikasi editing foto). Mode terang tetap tersedia lewat tombol tema.

## Tipografi

- `IBM Plex Sans` untuk antarmuka. Alasan: keluarga huruf ini lahir dari label instrumen teknis, cocok dengan tombol dan pelat nama kamera.
- `IBM Plex Mono` hanya untuk nilai metadata (f/2.8, 1/125, koordinat) dan nomor frame. Alasan: angka sejajar memudahkan membandingkan nilai, bukan sekadar gaya "teknis".

## Motif

Nomor frame ala film negatif (`01`, `02`, ...) di daftar foto, dalam huruf mono. Nomor yang sama muncul di kepala panel inspektor, menghubungkan foto yang dipilih dengan datanya.

## Tata letak

Tiga kolom pada layar lebar: daftar foto (sempit), pratinjau foto (fokus utama), inspektor metadata. Di layar sempit inspektor turun ke bawah pratinjau.

## Gerak

Hanya hover dan focus state. Tidak ada animasi masuk halaman.
