<template>
	<section class="flex h-full min-h-0 flex-col border-l border-default" :aria-label="`Metadata ${item.name}`">
		<header class="border-b border-default px-5 pb-3 pt-4">
			<p class="flex items-baseline gap-2 text-sm">
				<span class="font-mono text-xs text-primary tabular-nums">{{ frameNumber(index) }}</span>
				<span class="truncate font-medium" :title="item.path">{{ item.name }}</span>
			</p>
			<p v-if="summary" class="mt-1 font-mono text-xs text-muted tabular-nums">
				{{ summary }}
			</p>

			<UTabs
				v-model="tab"
				:items="tabs"
				:content="false"
				variant="link"
				size="sm"
				class="mt-3"
			/>
		</header>

		<div v-if="item.status !== 'ready' || !item.draft || !item.info" class="flex-1 px-5 py-6 text-sm text-muted">
			<template v-if="item.status === 'loading'">
				Membaca metadata…
			</template>
			<template v-else>
				Metadata tidak bisa ditampilkan karena file gagal dibaca.
			</template>
		</div>

		<template v-else-if="tab === 'edit'">
			<div class="flex-1 overflow-y-auto px-5 pb-6">
				<p v-if="!item.info.entries.length" class="mt-4 rounded-md bg-elevated px-3 py-2 text-sm text-toned">
					Foto ini belum punya metadata EXIF. Isi field di bawah lalu simpan untuk menambahkannya.
				</p>

				<div v-if="clipboard" class="mt-4 rounded-md border border-default px-3 py-2.5">
					<p class="flex items-start gap-2 text-sm">
						<UIcon name="i-ph-clipboard-text" class="mt-0.5 size-4 shrink-0 text-primary" />
						<span class="min-w-0 flex-1">
							<span class="font-medium">{{ clipboard.groupTitles.join(", ") }}</span>
							<span class="text-muted"> tersalin dari {{ clipboard.sourceName }}</span>
						</span>
						<UButton
							icon="i-ph-x"
							size="xs"
							color="neutral"
							variant="ghost"
							aria-label="Kosongkan salinan"
							class="-my-1"
							@click="clearClipboard"
						/>
					</p>
					<div class="mt-2 flex flex-wrap gap-2 pl-6">
						<UButton
							size="xs"
							variant="soft"
							:disabled="clipboard.sourcePath === item.path"
							@click="pasteToSelected"
						>
							Tempel ke foto ini
						</UButton>
						<UButton
							v-if="photos.length > 2"
							size="xs"
							color="neutral"
							variant="outline"
							@click="pasteToAll"
						>
							Tempel ke semua foto
						</UButton>
					</div>
				</div>

				<div class="mt-4 flex justify-end">
					<UButton
						size="xs"
						color="neutral"
						variant="ghost"
						icon="i-ph-copy"
						@click="copyGroups(item)"
					>
						Salin semua field
					</UButton>
				</div>

				<fieldset v-for="group in fieldGroups" :key="group.id" class="mt-4 first-of-type:mt-2">
					<div class="mb-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
						<legend class="text-sm font-semibold">
							{{ group.title }}
						</legend>

						<div class="flex flex-wrap gap-1">
							<UButton
								v-if="group.id === 'location' && hasLocation"
								size="xs"
								color="neutral"
								variant="ghost"
								icon="i-ph-map-pin"
								@click="openMap"
							>
								Lihat di peta
							</UButton>
							<UButton
								v-if="group.id === 'location'"
								size="xs"
								color="neutral"
								variant="ghost"
								icon="i-ph-clipboard"
								title="Tempel dari koordinat Lat, Long di clipboard"
								@click="pasteCoordinatesFromClipboard"
							>
								Tempel Lat, Long
							</UButton>
							<UButton
								v-if="group.id === 'location' && hasLocation"
								size="xs"
								color="error"
								variant="ghost"
								@click="clearLocation"
							>
								Hapus lokasi
							</UButton>
							<UButton
								size="xs"
								color="neutral"
								variant="ghost"
								icon="i-ph-copy"
								:disabled="!groupHasValues(group)"
								:aria-label="`Salin ${group.title}`"
								@click="copyGroups(item, [group.id])"
							>
								Salin
							</UButton>
						</div>
					</div>

					<div class="grid gap-x-3 gap-y-4 sm:grid-cols-2">
						<ExifField
							v-for="field in group.fields"
							:key="field.key"
							v-model="draft[field.key]"
							:field="field"
							:original="item.info.editable[field.key]"
						/>
					</div>
				</fieldset>
			</div>

			<!-- Sticky so Save stays reachable when the inspector stacks under the preview on narrow windows -->
			<footer class="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-default bg-default px-5 py-3">
				<UButton
					icon="i-ph-floppy-disk"
					:disabled="!dirty"
					:loading="busy === 'save'"
					@click="saveSelected"
				>
					Simpan perubahan
				</UButton>
				<UButton
					v-if="dirty"
					color="neutral"
					variant="ghost"
					icon="i-ph-arrow-counter-clockwise"
					@click="revert(item)"
				>
					Batalkan
				</UButton>

				<UDropdownMenu :items="moreActions" :content="{ align: 'end', side: 'top' }">
					<UButton
						class="ml-auto"
						color="neutral"
						variant="outline"
						trailing-icon="i-ph-caret-down"
						:loading="busy === 'saveAs' || busy === 'strip' || busy === 'saveAll'"
					>
						Lainnya
					</UButton>
				</UDropdownMenu>
			</footer>
		</template>

		<div v-else class="flex min-h-0 flex-1 flex-col">
			<div class="flex gap-2 px-5 pt-4">
				<UInput
					v-model="query"
					icon="i-ph-magnifying-glass"
					placeholder="Cari tag atau nilai"
					aria-label="Cari tag"
					class="flex-1"
				/>
				<UButton
					color="neutral"
					variant="outline"
					icon="i-ph-copy"
					:disabled="!filteredEntries.length"
					@click="copyEntries"
				>
					{{ query.trim() ? `Salin ${filteredEntries.length} tag` : "Salin semua" }}
				</UButton>
			</div>

			<p v-if="!item.info.entries.length" class="px-5 py-6 text-sm text-muted">
				File ini tidak punya metadata EXIF.
			</p>
			<p v-else-if="!filteredEntries.length" class="px-5 py-6 text-sm text-muted">
				Tidak ada tag yang cocok dengan "{{ query }}".
			</p>

			<div v-else class="mt-3 flex-1 overflow-y-auto px-5 pb-6">
				<table class="w-full text-sm">
					<thead class="sr-only">
						<tr>
							<th>Tag</th>
							<th>Nilai</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(entry, i) in filteredEntries" :key="`${entry.group}-${entry.tag}-${i}`" class="border-b border-default align-top last:border-0">
							<td class="w-2/5 py-2 pr-3">
								<span class="block break-words">{{ entry.tag }}</span>
								<span class="block text-xs text-muted">{{ entry.group }}</span>
							</td>
							<td class="py-2 font-mono text-xs break-all tabular-nums">
								{{ entry.value }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</section>
</template>

<script lang="ts" setup>
	import type { DropdownMenuItem } from "@nuxt/ui";
	import { isTauri } from "@tauri-apps/api/core";
	import { open } from "@tauri-apps/plugin-shell";

	const props = defineProps<{
		item: PhotoItem
		index: number
	}>();

	const {
		photos,
		busy,
		clipboard,
		dirtyCount,
		isDirty,
		revert,
		saveSelected,
		saveSelectedAs,
		saveAll,
		stripSelected,
		copyGroups,
		copyText,
		pasteToSelected,
		pasteToAll,
		clearClipboard
	} = usePhotoLibrary();

	const toast = useToast();
	const tab = ref<"edit" | "all">("edit");
	const query = ref("");

	const tabs = computed(() => [
		{ label: "Edit", value: "edit" },
		{ label: `Semua tag (${props.item.info?.entries.length ?? 0})`, value: "all" }
	]);

	const dirty = computed(() => isDirty(props.item));

	// The draft is owned by usePhotoLibrary's shared state, not by the parent component
	const draft = computed(() => props.item.draft!);

	const summary = computed(() => {
		const e = props.item.info?.editable;
		if (!e) return "";
		const camera = [e.make, e.model].filter(Boolean).join(" ");
		const settings = [
			e.fNumber && `f/${e.fNumber}`,
			e.exposureTime && `${e.exposureTime}s`,
			e.iso && `ISO ${e.iso}`,
			e.focalLength && `${e.focalLength}mm`
		].filter(Boolean).join("  ");
		return [camera, settings].filter(Boolean).join(" · ");
	});

	const filteredEntries = computed(() => {
		const entries = props.item.info?.entries ?? [];
		const q = query.value.trim().toLowerCase();
		if (!q) return entries;
		return entries.filter((e) => `${e.tag} ${e.group} ${e.value}`.toLowerCase().includes(q));
	});

	const groupHasValues = (group: FieldGroup) => group.fields.some((f) => props.item.draft?.[f.key]);

	const copyEntries = () => {
		const text = filteredEntries.value.map((e) => `${e.tag} (${e.group}): ${e.value}`).join("\n");
		copyText(text, `${filteredEntries.value.length} tag`);
	};

	const hasLocation = computed(() => Boolean(props.item.draft?.gpsLatitude && props.item.draft?.gpsLongitude));

	const openMap = async () => {
		const { gpsLatitude: lat, gpsLongitude: lon } = props.item.draft!;
		const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
		if (isTauri()) {
			try {
				await open(url);
				return;
			} catch (e) {
				console.warn("Tauri open map failed:", e);
			}
		}
		window.open(url, "_blank");
	};

	const pasteCoordinatesFromClipboard = async () => {
		try {
			const text = await navigator.clipboard.readText();
			const coords = parseCoordinates(text);
			if (coords) {
				draft.value.gpsLatitude = coords.lat;
				draft.value.gpsLongitude = coords.lon;
				toast.add({ title: "Koordinat Ditempel", description: `Lat: ${coords.lat}, Lon: ${coords.lon}` });
			} else {
				toast.add({ title: "Format tidak sesuai", description: "Contoh format: -6.914744, 107.609810", color: "warning" });
			}
		} catch {
			toast.add({ title: "Gagal membaca clipboard", color: "error" });
		}
	};

	const clearLocation = () => {
		draft.value.gpsLatitude = "";
		draft.value.gpsLongitude = "";
		draft.value.gpsAltitude = "";
	};

	const moreActions = computed<DropdownMenuItem[][]>(() => [
		[
			{ label: "Simpan sebagai salinan…", icon: "i-ph-copy", kbds: ["ctrl", "shift", "S"], onSelect: saveSelectedAs },
			...(dirtyCount.value > 1
				? [{ label: `Simpan semua perubahan (${dirtyCount.value} foto)`, icon: "i-ph-floppy-disk-back", onSelect: saveAll }]
				: [])
		],
		[
			{ label: "Hapus semua EXIF ke salinan baru…", icon: "i-ph-eraser", onSelect: () => stripSelected(true) },
			{ label: "Hapus semua EXIF di file ini", icon: "i-ph-eraser", color: "error", onSelect: () => stripSelected(false) }
		]
	]);

	watch(() => props.item.path, () => {
		query.value = "";
	});
</script>
