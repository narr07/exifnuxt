<template>
	<!-- Raw neutral-950 on purpose: a dark surround in both themes, so the photo is judged against a constant backdrop -->
	<div class="relative flex h-full min-h-64 items-center justify-center bg-neutral-950 p-6">
		<template v-if="item.status === 'ready' && !broken">
			<img
				:key="src"
				:src="src"
				:alt="item.info?.editable.description || item.name"
				class="max-h-full max-w-full object-contain"
				@error="broken = true"
			>
		</template>

		<div v-else-if="item.status === 'loading'" class="flex items-center gap-2 text-sm text-neutral-300">
			<UIcon name="i-ph-circle-notch" class="size-5 animate-spin" />
			Membaca {{ item.name }}…
		</div>

		<div v-else-if="item.status === 'error'" class="max-w-md text-center">
			<p class="font-medium text-neutral-100">
				File ini tidak bisa dibaca
			</p>
			<p class="mt-1 font-mono text-xs text-neutral-300 break-all">
				{{ item.error }}
			</p>
			<UButton class="mt-4" color="neutral" variant="outline" icon="i-ph-arrow-counter-clockwise" @click="reload(item)">
				Coba lagi
			</UButton>
		</div>

		<div v-else class="max-w-sm text-center">
			<UIcon name="i-ph-image-broken" class="size-8 text-neutral-400" />
			<p class="mt-2 text-sm text-neutral-200">
				Pratinjau tidak tersedia untuk format ini.
			</p>
			<p class="mt-1 text-xs text-neutral-400">
				Metadata tetap bisa dibaca dan diedit di panel kanan.
			</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
	const props = defineProps<{
		item: PhotoItem
	}>();

	const { previewSrc, reload } = usePhotoLibrary();

	const src = computed(() => previewSrc(props.item));
	const broken = ref(false);

	watch(src, () => {
		broken.value = false;
	});
</script>
