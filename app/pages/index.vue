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

		<main v-else class="flex min-h-0 items-center justify-center p-8 lg:col-span-2">
			<div class="max-w-md">
				<h2 class="text-2xl font-semibold tracking-tight">
					Buka foto untuk melihat metadatanya
				</h2>
				<p class="mt-2 text-toned">
					Seret file ke jendela ini atau pilih dari komputer. ExifNuxt membaca dan menulis EXIF di JPEG, PNG, WebP, TIFF, HEIC, dan JPEG XL.
				</p>
				<UButton class="mt-6" size="lg" icon="i-ph-folder-open" @click="openDialog">
					Pilih foto
				</UButton>
				<p class="mt-6 text-sm text-muted">
					Simpan langsung menimpa file asli. Salinan hanya dibuat kalau Anda memilih "Simpan sebagai salinan" di menu Lainnya.
				</p>
			</div>
		</main>

		<div
			v-if="dragging"
			class="pointer-events-none absolute inset-3 z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-default/85"
		>
			<p class="text-lg font-medium">
				Lepas untuk membuka foto
			</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import type { UnlistenFn } from "@tauri-apps/api/event";
	import { getCurrentWebview } from "@tauri-apps/api/webview";

	const { selected, selectedIndex, mode, checkedItems, addPaths, openDialog, saveSelected, saveSelectedAs } = usePhotoLibrary();

	const dragging = ref(false);
	let unlisten: UnlistenFn | undefined;

	onMounted(async () => {
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
	});

	onUnmounted(() => unlisten?.());

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
		}
	});
</script>
