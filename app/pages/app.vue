<template>
	<div class="h-screen w-screen overflow-hidden flex flex-col bg-background text-foreground font-sans">
		<header v-if="!isTauriApp" class="h-10 border-b border-default bg-elevated/85 backdrop-blur px-4 flex items-center justify-between text-xs">
			<div class="flex items-center gap-2.5">
				<NuxtLink to="/" class="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors font-medium">
					<UIcon name="i-ph-arrow-left" class="size-4" />
					<span>Beranda</span>
				</NuxtLink>
				<span class="text-default">/</span>
				<div class="flex items-center gap-1.5 font-medium text-foreground">
					<ExifLogo class="size-4" />
					<span>ExifNuxt</span>
				</div>
				<UBadge color="primary" variant="subtle" size="xs">Web Preview</UBadge>
			</div>
			<div class="flex items-center gap-3">
				<UColorModeButton size="xs" />
				<NuxtLink
					to="https://github.com/narr07/exifnuxt/releases"
					target="_blank"
					class="text-primary hover:underline flex items-center gap-1 font-medium"
				>
					<span>Unduh Aplikasi Desktop</span>
					<UIcon name="i-ph-arrow-up-right" class="size-3" />
				</NuxtLink>
			</div>
		</header>
		<div class="flex-1 min-h-0">
			<PhotoEditorWorkspace />
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { isTauri } from "@tauri-apps/api/core";

	const isTauriApp = ref(false);

	onMounted(() => {
		isTauriApp.value = isTauri();
	});
</script>
