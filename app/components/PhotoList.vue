<template>
	<aside class="flex h-full flex-col border-r border-default bg-muted/40">
		<div class="flex items-center justify-between gap-2 px-4 pb-3 pt-4">
			<NuxtLink to="/" class="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
				<ExifLogo class="size-6 shadow-sm" />
				<div>
					<h1 class="text-sm font-semibold tracking-tight leading-none">
						ExifNuxt
					</h1>
					<span class="text-[10px] text-muted font-mono">v1.0.0</span>
				</div>
			</NuxtLink>
			<div class="flex items-center gap-1">
				<UColorModeButton size="sm" />
			</div>
		</div>

		<div class="px-3 pb-3 space-y-2">
			<UButton
				block
				variant="outline"
				color="neutral"
				icon="i-ph-folder-open"
				@click="openDialog"
			>
				Buka foto
				<UKbd value="ctrl" size="sm" class="ml-auto" />
				<UKbd value="O" size="sm" />
			</UButton>
		</div>

		<div v-if="photos.length > 1" class="flex min-h-9 items-center justify-between gap-2 border-y border-default px-4 py-1.5">
			<UCheckbox
				:model-value="allState"
				:label="checkedPaths.length ? `${checkedPaths.length} dipilih` : 'Pilih semua'"
				size="sm"
				@update:model-value="setChecked($event === true ? photos.map((p) => p.path) : [])"
			/>
			<UButton
				v-if="checkedPaths.length > 1 && mode === 'single'"
				size="xs"
				variant="soft"
				@click="setChecked(checkedPaths)"
			>
				Edit massal
			</UButton>
		</div>

		<p v-if="!photos.length" class="px-4 py-4 text-xs text-muted leading-relaxed">
			Foto yang Anda buka akan muncul di sini. Buka foto atau seret langsung ke jendela ini.
		</p>

		<ul v-else class="flex-1 space-y-px overflow-y-auto px-2 py-2" aria-label="Daftar foto">
			<li v-for="(item, index) in photos" :key="item.path" class="group relative">
				<UCheckbox
					v-if="photos.length > 1"
					:model-value="checkedPaths.includes(item.path)"
					:aria-label="`Pilih ${item.name} untuk edit massal`"
					size="sm"
					class="absolute left-2 top-1/2 z-10 -translate-y-1/2"
					@update:model-value="toggleChecked(item.path, $event === true)"
				/>
				<button
					type="button"
					class="flex w-full items-center gap-3 rounded-md py-2 pr-9 text-left outline-none transition-colors hover:bg-elevated focus-visible:ring-2 focus-visible:ring-primary"
					:class="[photos.length > 1 ? 'pl-8' : 'pl-2', isActive(item) ? 'bg-elevated' : '']"
					:aria-current="isActive(item) ? 'true' : undefined"
					:title="item.path"
					@click="selectPhoto(item.path)"
				>
					<span
						class="w-5 shrink-0 font-mono text-xs tabular-nums"
						:class="isActive(item) ? 'text-primary' : 'text-muted'"
					>{{ frameNumber(index) }}</span>

					<span class="relative size-10 shrink-0 overflow-hidden rounded-sm bg-accented">
						<img
							v-if="item.status !== 'error' && !brokenThumbs.has(item.path)"
							:src="previewSrc(item)"
							alt=""
							loading="lazy"
							class="size-full object-cover"
							@error="brokenThumbs.add(item.path)"
						>
						<UIcon v-else name="i-ph-image-broken" class="absolute inset-0 m-auto size-5 text-muted" />
					</span>

					<span class="min-w-0 flex-1">
						<span class="block truncate text-sm">{{ item.name }}</span>
						<span class="block truncate text-xs text-muted">
							<template v-if="item.status === 'loading'">Membaca metadata…</template>
							<template v-else-if="item.status === 'error'"><span class="text-error">Gagal dibaca</span></template>
							<template v-else-if="item.info">
								{{ formatBytes(item.info.size) }} · {{ item.info.entries.length ? `${item.info.entries.length} tag` : "tanpa EXIF" }}
							</template>
						</span>
					</span>

					<span
						v-if="isDirty(item)"
						class="size-2 shrink-0 rounded-full bg-primary"
						role="img"
						aria-label="Belum disimpan"
						title="Belum disimpan"
					/>
				</button>

				<UButton
					icon="i-ph-x"
					size="xs"
					color="neutral"
					variant="ghost"
					:aria-label="`Tutup ${item.name}`"
					class="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
					@click="removePhoto(item)"
				/>
			</li>
		</ul>

		<div v-if="photos.length" class="border-t border-default p-2 flex items-center justify-between text-xs text-muted">
			<span class="font-mono tabular-nums">{{ photos.length }} foto</span>
			<span class="text-[11px] font-mono">↑ / ↓ Navigasi</span>
		</div>
	</aside>
</template>

<script lang="ts" setup>
	const {
		photos,
		selectedPath,
		checkedPaths,
		mode,
		isDirty,
		previewSrc,
		openDialog,
		removePhoto,
		selectPhoto,
		setChecked,
		toggleChecked
	} = usePhotoLibrary();

	const isActive = (item: PhotoItem) => mode.value === "batch"
		? checkedPaths.value.includes(item.path)
		: item.path === selectedPath.value;

	const allState = computed(() => {
		if (!checkedPaths.value.length) return false;
		return checkedPaths.value.length === photos.value.length ? true : "indeterminate";
	});

	const brokenThumbs = reactive(new Set<string>());
</script>
