<template>
	<section class="flex h-full min-h-0 flex-col border-l border-default" aria-label="Edit massal">
		<header class="border-b border-default px-5 pb-3 pt-4">
			<p class="text-sm font-medium">
				Edit massal
			</p>
			<p class="mt-1 text-xs text-muted">
				{{ checkedItems.length }} foto · hanya field yang Anda ubah yang diterapkan
			</p>
		</header>

		<div class="flex-1 overflow-y-auto px-5 pb-6">
			<p class="mt-4 rounded-md bg-elevated px-3 py-2 text-sm text-toned">
				Field yang tidak disentuh tetap seperti semula di tiap foto. Jadi Anda bisa menyamakan kamera di sini, lalu mengatur lokasi dan waktu per foto.
			</p>

			<fieldset v-for="group in fieldGroups" :key="group.id" class="mt-4">
				<div class="mb-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
					<legend class="text-sm font-semibold">
						{{ group.title }}
					</legend>
					<UButton
						v-if="group.id === 'location'"
						size="xs"
						color="error"
						variant="ghost"
						@click="clearLocation"
					>
						Hapus lokasi dari semua
					</UButton>
				</div>

				<div class="grid gap-x-3 gap-y-4 sm:grid-cols-2">
					<ExifField
						v-for="field in group.fields"
						:key="field.key"
						:model-value="valueOf(field.key)"
						:field="field"
						:original="common(field.key).value"
						:mixed="common(field.key).mixed"
						:touched="field.key in edits"
						@update:model-value="edits[field.key] = $event"
					/>
				</div>
			</fieldset>
		</div>

		<footer class="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-default bg-default px-5 py-3">
			<UButton
				icon="i-ph-floppy-disk-back"
				:disabled="!editCount"
				:loading="busy === 'saveAll'"
				@click="apply(true)"
			>
				Terapkan & simpan ke {{ checkedItems.length }} foto
			</UButton>
			<UButton
				color="neutral"
				variant="outline"
				:disabled="!editCount"
				@click="apply(false)"
			>
				Terapkan saja
			</UButton>
			<UButton
				v-if="editCount"
				class="ml-auto"
				color="neutral"
				variant="ghost"
				icon="i-ph-arrow-counter-clockwise"
				@click="reset"
			>
				Reset
			</UButton>
		</footer>
	</section>
</template>

<script lang="ts" setup>
	const { busy, checkedItems, applyBatch } = usePhotoLibrary();

	// Keys present here are the fields the user touched; an empty string means "remove from all"
	const edits = reactive<Partial<EditableExif>>({});

	const editCount = computed(() => Object.keys(edits).length);

	const common = (key: ExifKey) => {
		const values = new Set(checkedItems.value.map((p) => p.draft?.[key] ?? ""));
		return values.size === 1
			? { value: [...values][0]!, mixed: false }
			: { value: "", mixed: true };
	};

	const valueOf = (key: ExifKey) => edits[key] ?? common(key).value;

	const reset = () => {
		for (const key of Object.keys(edits) as ExifKey[]) delete edits[key];
	};

	const clearLocation = () => {
		edits.gpsLatitude = "";
		edits.gpsLongitude = "";
		edits.gpsAltitude = "";
	};

	const apply = async (saveNow: boolean) => {
		await applyBatch({ ...edits }, saveNow);
		reset();
	};
</script>
