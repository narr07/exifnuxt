<template>
	<!-- When running inside Tauri desktop app, render the desktop editor directly -->
	<PhotoEditorWorkspace v-if="isTauriApp" class="h-screen w-screen" />

	<!-- When running in web browser (e.g. GitHub Pages), render the marketing & documentation website -->
	<div v-else class="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
		<!-- Header / Navbar -->
		<header class="sticky top-0 z-40 w-full border-b border-default bg-background/85 backdrop-blur-md">
			<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<NuxtLink to="/" class="flex items-center gap-3 group outline-none">
					<ExifLogo class="size-8 transition-transform group-hover:scale-105" />
					<div class="flex flex-col">
						<span class="text-base font-bold tracking-tight">ExifNuxt</span>
						<span class="text-[10px] text-muted font-mono leading-none">Desktop EXIF Editor</span>
					</div>
				</NuxtLink>

				<nav class="hidden md:flex items-center gap-6 text-sm text-muted">
					<a href="#fitur" class="hover:text-foreground transition-colors">Fitur</a>
					<a href="#format" class="hover:text-foreground transition-colors">Format</a>
					<a href="#unduh" class="hover:text-foreground transition-colors">Unduh</a>
					<a href="#shortcut" class="hover:text-foreground transition-colors">Shortcut</a>
				</nav>

				<div class="flex items-center gap-2.5">
					<UColorModeButton size="sm" />
					<UButton
						to="https://github.com/narr07/exifnuxt"
						target="_blank"
						color="neutral"
						variant="ghost"
						icon="i-ph-github-logo"
						aria-label="GitHub Repository"
					/>
					<UButton
						to="/app"
						color="primary"
						variant="solid"
						icon="i-ph-play"
						size="sm"
					>
						Web Demo
					</UButton>
				</div>
			</div>
		</header>

		<!-- Hero Section -->
		<section class="relative overflow-hidden py-16 sm:py-24 border-b border-default">
			<div class="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/10 blur-3xl opacity-70" />

			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
				<!-- Brand Logo Highlight -->
				<div class="mb-6 flex justify-center">
					<ExifLogo class="size-20 sm:size-24 drop-shadow-2xl hover:scale-105 transition-transform" />
				</div>

				<div class="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary mb-6">
					<UIcon name="i-ph-shield-check" class="size-4" />
					<span>Tauri 2 + Nuxt 4 · 100% Offline & Privat</span>
				</div>

				<h1 class="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-3xl mx-auto leading-tight">
					Editor Metadata <span class="text-primary">EXIF Foto</span> Presisi untuk Desktop
				</h1>

				<p class="mt-6 text-lg text-toned max-w-2xl mx-auto leading-relaxed">
					Lihat, sesuaikan, salin grup lokasi, atau bersihkan metadata foto kamera Anda secara massal tanpa upload ke server. Cepat, aman di disk lokal, dan dirancang dengan estetika meja kerja kamar gelap.
				</p>

				<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
					<UButton
						to="#unduh"
						size="xl"
						color="primary"
						icon="i-ph-download-simple"
					>
						Unduh v1.0.0
					</UButton>
					<UButton
						to="/app"
						size="xl"
						color="neutral"
						variant="outline"
						icon="i-ph-browser"
					>
						Coba Web Demo
					</UButton>
					<UButton
						to="https://github.com/narr07/exifnuxt"
						target="_blank"
						size="xl"
						color="neutral"
						variant="ghost"
						icon="i-ph-github-logo"
					>
						Bintang di GitHub
					</UButton>
				</div>

				<!-- App Mockup Preview -->
				<div class="mt-14 rounded-xl border border-default bg-elevated/50 p-2 shadow-2xl max-w-5xl mx-auto overflow-hidden">
					<div class="flex items-center gap-2 px-3 py-2 border-b border-default bg-muted/30 text-xs text-muted">
						<div class="flex gap-1.5">
							<span class="size-3 rounded-full bg-red-500/80 inline-block" />
							<span class="size-3 rounded-full bg-yellow-500/80 inline-block" />
							<span class="size-3 rounded-full bg-green-500/80 inline-block" />
						</div>
						<div class="mx-auto flex items-center gap-1.5 font-mono text-[11px] text-muted">
							<ExifLogo class="size-3.5" />
							<span>ExifNuxt — Antarmuka Meja Kerja Kamar Gelap</span>
						</div>
						<span class="text-[10px] font-mono text-primary">01 / 12</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-12 min-h-[380px] text-left bg-neutral-950 font-sans">
						<!-- Col 1: Photo list strip -->
						<div class="hidden md:block md:col-span-3 border-r border-default/40 p-3 bg-neutral-900/40">
							<div class="text-[11px] font-medium text-neutral-400 mb-2 uppercase tracking-wider font-mono">Daftar Foto</div>
							<div class="space-y-1.5">
								<div class="flex items-center gap-2 p-2 rounded bg-neutral-800/80 border border-primary/40">
									<span class="font-mono text-xs text-primary">01</span>
									<div class="size-8 rounded bg-primary/20 flex items-center justify-center text-primary">
										<UIcon name="i-ph-image" class="size-4" />
									</div>
									<div class="min-w-0 flex-1">
										<div class="text-xs truncate text-neutral-200 font-medium">DSCF0142_Bromo.jpg</div>
										<div class="text-[10px] text-neutral-400">24.2 MB · 48 tag</div>
									</div>
								</div>
								<div class="flex items-center gap-2 p-2 rounded hover:bg-neutral-800/40 opacity-70">
									<span class="font-mono text-xs text-neutral-500">02</span>
									<div class="size-8 rounded bg-neutral-800 flex items-center justify-center text-neutral-400">
										<UIcon name="i-ph-image" class="size-4" />
									</div>
									<div class="min-w-0 flex-1">
										<div class="text-xs truncate text-neutral-300">IMG_8820_Kuta.jpg</div>
										<div class="text-[10px] text-neutral-500">18.4 MB · 32 tag</div>
									</div>
								</div>
								<div class="flex items-center gap-2 p-2 rounded hover:bg-neutral-800/40 opacity-70">
									<span class="font-mono text-xs text-neutral-500">03</span>
									<div class="size-8 rounded bg-neutral-800 flex items-center justify-center text-neutral-400">
										<UIcon name="i-ph-image" class="size-4" />
									</div>
									<div class="min-w-0 flex-1">
										<div class="text-xs truncate text-neutral-300">L1004812_Bandung.png</div>
										<div class="text-[10px] text-neutral-500">42.1 MB · 19 tag</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Col 2: Photo Preview -->
						<div class="col-span-1 md:col-span-5 flex flex-col items-center justify-center p-6 border-r border-default/40 bg-neutral-950">
							<div class="w-full aspect-[4/3] rounded bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center p-4 relative overflow-hidden group">
								<div class="absolute inset-0 bg-gradient-to-tr from-amber-950/40 to-neutral-900" />
								<ExifLogo class="size-20 mb-2 relative z-10 drop-shadow-md" />
								<span class="text-xs font-mono text-neutral-300 relative z-10">DSCF0142_Bromo.jpg</span>
								<div class="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] font-mono text-neutral-400 bg-neutral-950/80 px-2 py-1 rounded">
									<span>f/2.8 · 1/250s · ISO 400</span>
									<span>23mm</span>
								</div>
							</div>
						</div>

						<!-- Col 3: Inspector Panel -->
						<div class="col-span-1 md:col-span-4 p-4 text-xs space-y-3 bg-neutral-900/20">
							<div class="flex items-center justify-between pb-2 border-b border-neutral-800">
								<span class="font-medium text-neutral-200">Kamera & Pengaturan</span>
								<UBadge color="primary" variant="subtle" size="xs">Tersimpan</UBadge>
							</div>
							<div class="space-y-2">
								<div>
									<span class="text-[10px] text-neutral-500 block">Kamera</span>
									<span class="font-medium text-neutral-200">Fujifilm X-T5</span>
								</div>
								<div>
									<span class="text-[10px] text-neutral-500 block">Lensa</span>
									<span class="font-medium text-neutral-200">Fujinon XF 23mm F1.4 R LM WR</span>
								</div>
								<div class="grid grid-cols-2 gap-2">
									<div>
										<span class="text-[10px] text-neutral-500 block">Aperture</span>
										<span class="font-mono text-primary font-medium">f/2.8</span>
									</div>
									<div>
										<span class="text-[10px] text-neutral-500 block">Kecepatan Rana</span>
										<span class="font-mono text-primary font-medium">1/250s</span>
									</div>
								</div>
								<div class="pt-2 border-t border-neutral-800">
									<div class="flex justify-between items-center text-[10px] text-neutral-500 mb-1">
										<span>Lokasi GPS</span>
										<span class="text-primary">OpenStreetMap</span>
									</div>
									<div class="font-mono text-[11px] text-neutral-300">-7.942494, 112.953011</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Features Grid -->
		<section id="fitur" class="py-16 sm:py-24 border-b border-default bg-muted/20">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="text-center max-w-2xl mx-auto mb-16">
					<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
						Dirancang Khusus untuk Alur Kerja Fotografer
					</h2>
					<p class="mt-4 text-toned">
						Setiap fitur dibangun dengan filosofi presisi: hanya ubah yang Anda inginkan, jaga keaslian data selebihnya.
					</p>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<UCard>
						<template #header>
							<div class="flex items-center gap-3">
								<div class="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
									<UIcon name="i-ph-squares-four" class="size-5" />
								</div>
								<h3 class="font-semibold text-base">Edit Massal & Satuan</h3>
							</div>
						</template>
						<p class="text-sm text-toned leading-relaxed">
							Centang beberapa foto sekaligus untuk menyamakan info kamera, lensa, atau hak cipta. Field yang tidak Anda sentuh tetap terjaga apa adanya di masing-masing file.
						</p>
					</UCard>

					<UCard>
						<template #header>
							<div class="flex items-center gap-3">
								<div class="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
									<UIcon name="i-ph-copy" class="size-5" />
								</div>
								<h3 class="font-semibold text-base">Salin Per Grup Field</h3>
							</div>
						</template>
						<p class="text-sm text-toned leading-relaxed">
							Salin hanya grup Lokasi GPS atau Kamera dari foto referensi, lalu tempelkan ke foto-foto lainnya dengan satu klik tanpa menimpa metadata lain.
						</p>
					</UCard>

					<UCard>
						<template #header>
							<div class="flex items-center gap-3">
								<div class="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
									<UIcon name="i-ph-eraser" class="size-5" />
								</div>
								<h3 class="font-semibold text-base">Hapus EXIF & Lindungi Privasi</h3>
							</div>
						</template>
						<p class="text-sm text-toned leading-relaxed">
							Hapus seluruh metadata termasuk koordinat GPS dan nomor seri bodi kamera sebelum membagikan foto ke publik atau klien. Bisa ditimpa langsung atau disimpan sebagai salinan baru.
						</p>
					</UCard>

					<UCard>
						<template #header>
							<div class="flex items-center gap-3">
								<div class="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
									<UIcon name="i-ph-map-pin" class="size-5" />
								</div>
								<h3 class="font-semibold text-base">Geotagging & Integrasi Peta</h3>
							</div>
						</template>
						<p class="text-sm text-toned leading-relaxed">
							Tempel koordinat Latitude dan Longitude langsung dari clipboard (Google Maps / OSM). Klik tombol "Lihat di peta" untuk verifikasi titik lokasi foto secara visual.
						</p>
					</UCard>

					<UCard>
						<template #header>
							<div class="flex items-center gap-3">
								<div class="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
									<UIcon name="i-ph-list-magnifying-glass" class="size-5" />
								</div>
								<h3 class="font-semibold text-base">Inspektor Semua Tag Mentah</h3>
							</div>
						</template>
						<p class="text-sm text-toned leading-relaxed">
							Tab "Semua tag" menyajikan daftar seluruh entri EXIF lengkap dengan grup IFD-nya. Dilengkapi fitur pencarian instan dan salin ke clipboard teks.
						</p>
					</UCard>

					<UCard>
						<template #header>
							<div class="flex items-center gap-3">
								<div class="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
									<UIcon name="i-ph-shield-check" class="size-5" />
								</div>
								<h3 class="font-semibold text-base">100% Offline & Native Rust</h3>
							</div>
						</template>
						<p class="text-sm text-toned leading-relaxed">
							Dibangun dengan Tauri 2 dan mesin Rust (`kamadak-exif` & `little_exif`). Tidak ada upload ke cloud, tidak ada konsumsi kuota, aman dan berkecepatan tinggi.
						</p>
					</UCard>
				</div>
			</div>
		</section>

		<!-- Supported Formats -->
		<section id="format" class="py-16 sm:py-24 border-b border-default">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="text-center max-w-xl mx-auto mb-12">
					<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
						Dukungan Format File Lengkap
					</h2>
					<p class="mt-2 text-toned text-sm">
						Membaca dan menulis metadata pada beragam format gambar modern.
					</p>
				</div>

				<div class="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
					<span v-for="fmt in ['JPEG (.jpg, .jpeg)', 'PNG (.png, zTXt EXIF)', 'WebP (.webp)', 'TIFF (.tif, .tiff)', 'HEIC / HEIF (.heic)', 'JPEG XL (.jxl)']" :key="fmt" class="inline-flex items-center gap-2 rounded-lg border border-default bg-elevated px-4 py-2 text-xs font-mono">
						<UIcon name="i-ph-check-circle" class="size-4 text-primary" />
						<span>{{ fmt }}</span>
					</span>
				</div>
			</div>
		</section>

		<!-- Download Section -->
		<section id="unduh" class="py-16 sm:py-24 border-b border-default bg-muted/30">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
				<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
					Unduh ExifNuxt untuk Komputer Anda
				</h2>
				<p class="mt-3 text-toned max-w-xl mx-auto text-sm">
					Tersedia untuk Windows, macOS, dan Linux. Aplikasi open-source bebas watermark, tanpa iklan, dan gratis selamanya.
				</p>

				<div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
					<!-- Windows -->
					<div class="rounded-xl border border-default bg-elevated p-6 flex flex-col justify-between">
						<div>
							<div class="flex items-center justify-between mb-4">
								<UIcon name="i-ph-windows-logo" class="size-8 text-primary" />
								<UBadge color="primary" variant="subtle" size="xs">Windows 10/11</UBadge>
							</div>
							<h3 class="font-semibold text-lg">Windows</h3>
							<p class="text-xs text-muted mt-1">Installer NSIS (.exe) dan binary portable.</p>
						</div>
						<div class="mt-6 space-y-2">
							<UButton
								to="https://github.com/narr07/exifnuxt/releases"
								target="_blank"
								block
								color="primary"
								icon="i-ph-download-simple"
							>
								Unduh .exe (x64)
							</UButton>
						</div>
					</div>

					<!-- macOS -->
					<div class="rounded-xl border border-default bg-elevated p-6 flex flex-col justify-between">
						<div>
							<div class="flex items-center justify-between mb-4">
								<UIcon name="i-ph-apple-logo" class="size-8 text-primary" />
								<UBadge color="neutral" variant="subtle" size="xs">macOS 11+</UBadge>
							</div>
							<h3 class="font-semibold text-lg">macOS</h3>
							<p class="text-xs text-muted mt-1">Apple Silicon (M1/M2/M3) & Intel x86_64.</p>
						</div>
						<div class="mt-6 space-y-2">
							<UButton
								to="https://github.com/narr07/exifnuxt/releases"
								target="_blank"
								block
								color="neutral"
								variant="outline"
								icon="i-ph-download-simple"
							>
								Unduh .dmg
							</UButton>
						</div>
					</div>

					<!-- Linux -->
					<div class="rounded-xl border border-default bg-elevated p-6 flex flex-col justify-between">
						<div>
							<div class="flex items-center justify-between mb-4">
								<UIcon name="i-ph-linux-logo" class="size-8 text-primary" />
								<UBadge color="neutral" variant="subtle" size="xs">Linux x64</UBadge>
							</div>
							<h3 class="font-semibold text-lg">Linux</h3>
							<p class="text-xs text-muted mt-1">Paket Debian (.deb) dan AppImage.</p>
						</div>
						<div class="mt-6 space-y-2">
							<UButton
								to="https://github.com/narr07/exifnuxt/releases"
								target="_blank"
								block
								color="neutral"
								variant="outline"
								icon="i-ph-download-simple"
							>
								Unduh .deb / AppImage
							</UButton>
						</div>
					</div>
				</div>

				<div class="mt-8">
					<NuxtLink
						to="https://github.com/narr07/exifnuxt/releases"
						target="_blank"
						class="text-xs text-muted hover:text-foreground underline"
					>
						Lihat semua release dan changelog di GitHub Releases →
					</NuxtLink>
				</div>
			</div>
		</section>

		<!-- Shortcuts Cheat Sheet -->
		<section id="shortcut" class="py-16 border-b border-default">
			<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<h2 class="text-2xl font-bold tracking-tight text-center mb-8">
					Pintasan Papan Ketik (Shortcuts)
				</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
					<div class="flex items-center justify-between p-3 rounded-lg border border-default bg-elevated">
						<span class="text-muted">Buka foto dialog</span>
						<div class="flex gap-1">
							<UKbd value="ctrl" size="sm" />
							<UKbd value="O" size="sm" />
						</div>
					</div>
					<div class="flex items-center justify-between p-3 rounded-lg border border-default bg-elevated">
						<span class="text-muted">Simpan langsung (overwrite)</span>
						<div class="flex gap-1">
							<UKbd value="ctrl" size="sm" />
							<UKbd value="S" size="sm" />
						</div>
					</div>
					<div class="flex items-center justify-between p-3 rounded-lg border border-default bg-elevated">
						<span class="text-muted">Simpan sebagai salinan baru</span>
						<div class="flex gap-1">
							<UKbd value="ctrl" size="sm" />
							<UKbd value="shift" size="sm" />
							<UKbd value="S" size="sm" />
						</div>
					</div>
					<div class="flex items-center justify-between p-3 rounded-lg border border-default bg-elevated">
						<span class="text-muted">Navigasi foto berikutnya / sebelumnya</span>
						<div class="flex gap-1">
							<UKbd value="arrowup" size="sm" />
							<UKbd value="arrowdown" size="sm" />
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Footer -->
		<footer class="mt-auto py-12 border-t border-default bg-elevated/40 text-xs text-muted">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
				<div class="flex items-center gap-2">
					<ExifLogo class="size-5" />
					<span>ExifNuxt © 2026</span>
					<span>·</span>
					<span>Dibuat oleh <a href="https://permadi.dev" target="_blank" class="hover:underline font-medium text-foreground">Dinar Permadi Yusup</a></span>
				</div>

				<div class="flex items-center gap-4">
					<NuxtLink to="/app" class="hover:text-foreground transition-colors">Web Demo</NuxtLink>
					<a href="https://github.com/narr07/exifnuxt/blob/main/LICENSE" target="_blank" class="hover:text-foreground transition-colors">Lisensi MIT</a>
					<a href="https://github.com/narr07/exifnuxt" target="_blank" class="hover:text-foreground transition-colors">GitHub</a>
				</div>
			</div>
		</footer>
	</div>
</template>

<script lang="ts" setup>
	import { isTauri } from "@tauri-apps/api/core";

	const isTauriApp = ref(false);

	onMounted(() => {
		isTauriApp.value = isTauri();
	});
</script>
