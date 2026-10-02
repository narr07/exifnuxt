<template>
	<!-- Same constant dark surround as PhotoPreview so batch and single mode read as one workspace -->
	<div class="h-full overflow-y-auto bg-neutral-950 p-6">
		<p class="mb-4 text-sm text-neutral-300">
			{{ checkedItems.length }} foto dipilih. Klik salah satu untuk mengeditnya sendiri.
		</p>
		<ul class="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-4">
			<li v-for="item in checkedItems" :key="item.path">
				<button
					type="button"
					class="group block w-full rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-primary"
					:title="item.path"
					@click="selectPhoto(item.path)"
				>
					<span class="relative block aspect-[3/2] overflow-hidden rounded-sm bg-neutral-900">
						<img
							v-if="item.status === 'ready' && !broken.has(item.path)"
							:src="previewSrc(item)"
							alt=""
							loading="lazy"
							class="size-full object-cover transition-opacity group-hover:opacity-80"
							@error="broken.add(item.path)"
						>
						<UIcon v-else name="i-ph-image-broken" class="absolute inset-0 m-auto size-6 text-neutral-500" />
					</span>
					<span class="mt-1.5 flex items-baseline gap-1.5 text-xs">
						<span class="font-mono tabular-nums text-primary">{{ frameNumber(photos.indexOf(item)) }}</span>
						<span class="truncate text-neutral-200">{{ item.name }}</span>
						<span
							v-if="isDirty(item)"
							class="ml-auto size-1.5 shrink-0 self-center rounded-full bg-primary"
							role="img"
							aria-label="Belum disimpan"
						/>
					</span>
				</button>
			</li>
		</ul>
	</div>
</template>

<script lang="ts" setup>
	const { photos, checkedItems, isDirty, previewSrc, selectPhoto } = usePhotoLibrary();

	const broken = reactive(new Set<string>());
</script>
