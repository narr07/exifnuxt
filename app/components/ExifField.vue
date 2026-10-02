<template>
	<UFormField
		:label="field.label"
		:hint="changed ? 'diubah' : undefined"
		:help="mixed && !changed ? 'Nilainya berbeda di tiap foto' : field.hint"
		:ui="{ hint: 'text-primary text-xs' }"
		:class="field.half ? '' : 'sm:col-span-2'"
	>
		<USelect
			v-if="field.kind === 'orientation'"
			v-model="orientationModel"
			:items="orientationOptions"
			class="w-full"
		/>

		<UTextarea
			v-else-if="field.kind === 'textarea'"
			v-model="model"
			:placeholder="mixed ? 'Berbeda-beda' : undefined"
			:rows="2"
			autoresize
			:maxrows="6"
		/>

		<div v-else-if="field.kind === 'datetime'" class="flex gap-2">
			<UInput
				v-model="dateModel"
				type="datetime-local"
				step="1"
				class="flex-1"
				:ui="{ base: 'font-mono tabular-nums' }"
			/>
			<UButton
				v-if="model"
				icon="i-ph-x"
				color="neutral"
				variant="ghost"
				:aria-label="`Kosongkan ${field.label}`"
				@click="model = ''"
			/>
		</div>

		<UInput
			v-else
			v-model="model"
			:placeholder="mixed ? 'Berbeda-beda' : field.placeholder"
			:ui="{ base: field.mono ? 'font-mono tabular-nums' : '' }"
		/>
	</UFormField>
</template>

<script lang="ts" setup>
	const props = withDefaults(defineProps<{
		field: FieldDef
		original: string
		// Batch mode: the selected photos disagree on this field
		mixed?: boolean
		// Batch mode decides "changed" itself, since an empty value can be a real edit
		touched?: boolean
	}>(), {
		// Vue casts a missing boolean prop to false; undefined keeps the single-file comparison
		mixed: false,
		touched: undefined
	});

	const model = defineModel<string>({ required: true });

	const changed = computed(() => props.touched ?? model.value !== props.original);

	// USelect can't hold an empty string, so "none" stands in for "tag not set"
	const orientationModel = computed({
		get: () => model.value || "none",
		set: (v: string) => {
			model.value = v === "none" ? "" : v;
		}
	});

	const dateModel = computed({
		get: () => exifToInputDate(model.value),
		set: (v: string) => {
			model.value = inputToExifDate(v);
		}
	});
</script>
