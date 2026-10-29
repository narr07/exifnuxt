<template>
	<div class="relative grid h-full grid-rows-[minmax(0,1fr)] grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)_24rem] xl:grid-cols-[17rem_minmax(0,1fr)_28rem]">
		<PhotoList class="min-h-0" />

		<template v-if="mode === 'batch' && checkedItems.length > 1">
			<div class="flex min-h-0 flex-col overflow-y-auto lg:contents">
				<ContactSheet class="h-[45vh] shrink-0 lg:h-full" />
				<BatchEditor class="lg:min-h-0 lg:overflow-hidden" />
			</div>
		</template>

		<template v-else-if="selected">
			<!-- Below lg the inspector stacks under the preview inside one scrolling column -->
			<div class="flex min-h-0 flex-col overflow-y-auto lg:contents">
				<PhotoPreview :item="selected" class="h-[45vh] shrink-0 lg:h-full" />
				<ExifInspector :item="selected" :index="selectedIndex" class="lg:min-h-0 lg:overflow-hidden" />
			</div>
		</template>

		<main
			v-else
			class="flex min-h-0 items-center justify-center p-8 lg:col-span-2 cursor-pointer transition-colors"
			:class="dragging ? 'bg-primary/5' : ''"
			@dragover.prevent="dragging = true"
			@dragleave.prevent="dragging = false"
			@drop.prevent="onDrop"
			@click="openDialog"
		>
			<div class="max-w-md text-center">
				<div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
					<UIcon name="i-ph-images-square" class="size-7" />
				</div>
				<h2 class="text-2xl font-semibold tracking-tight">
					Buka foto untuk melihat metadatanya
				</h2>
				<p class="mt-2 text-toned text-sm">
					Seret file ke jendela ini atau pilih dari komputer. ExifNuxt membaca dan menulis EXIF di JPEG, PNG, WebP, TIFF, HEIC, dan JPEG XL.
				</p>
				<div class="mt-6 flex flex-wrap justify-center gap-3">
					<UButton size="lg" icon="i-ph-folder-open" @click.stop="openDialog">
						Pilih foto
					</UButton>
					<UButton
						v-if="!isTauriApp"
						size="lg"
						variant="outline"
						color="neutral"
						icon="i-ph-sparkle"
						@click.stop="loadSamplePhotos"
					>
						Muat contoh foto
					</UButton>
				</div>
				<p class="mt-6 text-xs text-muted">
					Simpan langsung menimpa file asli. Salinan hanya dibuat jika memilih "Simpan sebagai salinan" di menu Lainnya.
				</p>
			</div>
		</main>

		<div
			v-if="dragging"
			class="pointer-events-none absolute inset-3 z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-default/85"
		>
			<div class="text-center">
				<UIcon name="i-ph-tray-arrow-down" class="size-10 text-primary mx-auto mb-2" />
				<p class="text-lg font-medium">
					Lepas untuk membuka foto
				</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import type { UnlistenFn } from "@tauri-apps/api/event";
	import { isTauri } from "@tauri-apps/api/core";
	import { getCurrentWebview } from "@tauri-apps/api/webview";

	const {
		selected,
		selectedIndex,
		mode,
		checkedItems,
		addPaths,
		addWebFiles,
		openDialog,
		saveSelected,
		saveSelectedAs,
		selectNext,
		selectPrev,
		selectAll,
		deselectAll
	} = usePhotoLibrary();

	const isTauriApp = ref(false);
	const dragging = ref(false);
	let unlisten: UnlistenFn | undefined;

	onMounted(async () => {
		isTauriApp.value = isTauri();
		if (isTauri()) {
			try {
				unlisten = await getCurrentWebview().onDragDropEvent((event) => {
					const { type } = event.payload;
					if (type === "enter" || type === "over") {
						dragging.value = true;
					} else if (type === "drop") {
						dragging.value = false;
						addPaths(event.payload.paths);
					} else {
						dragging.value = false;
					}
				});
			} catch (e) {
				console.warn("Webview drag-drop unavailable:", e);
			}
		}
	});

	onUnmounted(() => unlisten?.());

	const onDrop = (event: DragEvent) => {
		dragging.value = false;
		if (event.dataTransfer?.files?.length) {
			addWebFiles(Array.from(event.dataTransfer.files));
		}
	};

	const loadSamplePhotos = () => {
		// Create canvas-generated sample photos so the user can immediately play with the UI
		const samples = [
			{ name: "DSCF0142_Bromo_Sunrise.jpg", color: "#d97706", text: "Bromo Sunrise", time: "2026:05:12 05:42:19", lat: "-7.942494", lon: "112.953011", cam: "Fujifilm X-T5" },
			{ name: "IMG_8820_Kuta_Sunset.jpg", color: "#b45309", text: "Kuta Beach Sunset", time: "2026:06:20 18:14:02", lat: "-8.718500", lon: "115.168600", cam: "Sony A7 IV" },
			{ name: "L1004812_Bandung_Street.png", color: "#44403c", text: "Braga Street Night", time: "2026:07:08 21:05:50", lat: "-6.917464", lon: "107.609489", cam: "Leica Q3" }
		];

		const files: File[] = samples.map((s) => {
			const canvas = document.createElement("canvas");
			canvas.width = 1200;
			canvas.height = 800;
			const ctx = canvas.getContext("2d");
			if (ctx) {
				ctx.fillStyle = "#18181b";
				ctx.fillRect(0, 0, 1200, 800);
				ctx.fillStyle = s.color;
				ctx.fillRect(40, 40, 1120, 720);
				ctx.fillStyle = "#ffffff";
				ctx.font = "bold 44px sans-serif";
				ctx.fillText(s.text, 80, 120);
				ctx.font = "24px monospace";
				ctx.fillStyle = "#e4e4e7";
				ctx.fillText(`${s.cam} · ${s.time} · Lat: ${s.lat}, Lon: ${s.lon}`, 80, 180);
			}
			const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
			const byteString = atob(dataUrl.split(",")[1]);
			const ab = new ArrayBuffer(byteString.length);
			const ia = new Uint8Array(ab);
			for (let i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i);
			}
			return new File([ab], s.name, { type: "image/jpeg" });
		});

		addWebFiles(files);
	};

	defineShortcuts({
		meta_o: () => openDialog(),
		meta_s: {
			usingInput: true,
			handler: () => {
				if (mode.value === "single") saveSelected();
			}
		},
		meta_shift_s: {
			usingInput: true,
			handler: () => {
				if (selected.value && mode.value === "single") saveSelectedAs();
			}
		},
		arrowdown: {
			usingInput: false,
			handler: () => selectNext()
		},
		arrowup: {
			usingInput: false,
			handler: () => selectPrev()
		},
		meta_a: {
			usingInput: false,
			handler: () => selectAll()
		},
		escape: {
			usingInput: false,
			handler: () => deselectAll()
		}
	});
</script>

