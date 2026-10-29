import { convertFileSrc, invoke, isTauri } from "@tauri-apps/api/core";
import { ask, open, save } from "@tauri-apps/plugin-dialog";

export interface PhotoItem {
	path: string
	name: string
	status: "loading" | "ready" | "error"
	error?: string
	info?: PhotoInfo
	draft?: EditableExif
	// Bumped after every write so the preview <img> skips the webview cache
	version: number
	blobUrl?: string
}

export interface FieldClipboard {
	sourcePath: string
	sourceName: string
	groupTitles: string[]
	values: Partial<EditableExif>
}

const fileNameOf = (path: string) => path.split(/[\\/]/).pop() ?? path;

export const usePhotoLibrary = createSharedComposable(() => {
	const toast = useToast();

	const photos = ref<PhotoItem[]>([]);
	const selectedPath = ref<string>();
	const busy = ref<"save" | "saveAs" | "strip" | "saveAll">();
	const clipboard = ref<FieldClipboard>();

	// Batch editing: checked photos are edited together, a plain click goes back to one file
	const checkedPaths = ref<string[]>([]);
	const mode = ref<"single" | "batch">("single");
	const checkedItems = computed(() => photos.value.filter((p) => checkedPaths.value.includes(p.path)));

	const selected = computed(() => photos.value.find((p) => p.path === selectedPath.value));
	const selectedIndex = computed(() => photos.value.findIndex((p) => p.path === selectedPath.value));

	const isDirty = (item?: PhotoItem) => {
		if (!item?.info || !item.draft) return false;
		const original = item.info.editable;
		return (Object.keys(original) as ExifKey[]).some((k) => original[k] !== item.draft![k]);
	};

	const previewSrc = (item: PhotoItem) => {
		if (item.blobUrl) return item.blobUrl;
		if (isTauri()) {
			try {
				return `${convertFileSrc(item.path)}?v=${item.version}`;
			} catch {
				return item.path;
			}
		}
		return item.path;
	};

	const applyInfo = (item: PhotoItem, info: PhotoInfo) => {
		item.info = info;
		item.draft = { ...info.editable };
		item.status = "ready";
		item.error = undefined;
		item.version++;
	};

	const load = async (item: PhotoItem) => {
		item.status = "loading";
		if (isTauri()) {
			try {
				applyInfo(item, await invoke<PhotoInfo>("read_exif", { path: item.path }));
			} catch (err) {
				item.status = "error";
				item.error = String(err);
			}
		} else {
			// Web mode: item is already ready with its mock or parsed info
			item.status = "ready";
		}
	};

	const addPaths = async (paths: string[]) => {
		const supported = paths.filter(isSupportedPath);
		const skipped = paths.length - supported.length;
		if (skipped > 0) {
			toast.add({
				title: `${skipped} file dilewati`,
				description: `Format yang didukung: ${SUPPORTED_EXTENSIONS.join(", ")}`,
				color: "warning"
			});
		}

		const added: PhotoItem[] = [];
		for (const path of supported) {
			if (photos.value.some((p) => p.path === path)) continue;
			photos.value.push({ path, name: fileNameOf(path), status: "loading", version: 0 });
			added.push(photos.value.at(-1)!);
		}

		if (supported.length && !selectedPath.value) selectedPath.value = supported[0];
		await Promise.all(added.map(load));
	};

	const addWebFiles = async (files: File[]) => {
		const supported = files.filter((f) => isSupportedPath(f.name));
		const skipped = files.length - supported.length;
		if (skipped > 0) {
			toast.add({
				title: `${skipped} file dilewati`,
				description: `Format yang didukung: ${SUPPORTED_EXTENSIONS.join(", ")}`,
				color: "warning"
			});
		}

		for (const file of supported) {
			const virtualPath = `web://${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
			const blobUrl = URL.createObjectURL(file);

			const sampleEditable: EditableExif = {
				make: "Sony",
				model: "ILCE-7M4",
				lensMake: "Sony",
				lensModel: "FE 24-70mm F2.8 GM II",
				serialNumber: "3892014",
				software: "ExifNuxt 1.0",
				artist: "Dinar Permadi Yusup",
				ownerName: "Dinar Permadi Yusup",
				copyright: "© 2026 Dinar Permadi Yusup",
				description: file.name.replace(/\.[^/.]+$/, ""),
				userComment: "ExifNuxt web preview mode",
				dateTimeOriginal: "2026:03:15 10:24:30",
				createDate: "2026:03:15 10:24:30",
				modifyDate: "2026:03:15 10:24:30",
				offsetTimeOriginal: "+07:00",
				orientation: "1",
				iso: "200",
				fNumber: "2.8",
				exposureTime: "1/500",
				focalLength: "35",
				gpsLatitude: "-6.914744",
				gpsLongitude: "107.609810",
				gpsAltitude: "768"
			};

			const item: PhotoItem = {
				path: virtualPath,
				name: file.name,
				status: "ready",
				blobUrl,
				version: 1,
				info: {
					path: virtualPath,
					fileName: file.name,
					size: file.size,
					editable: { ...sampleEditable },
					entries: [
						{ tag: "Make", group: "IFD0", value: "Sony" },
						{ tag: "Model", group: "IFD0", value: "ILCE-7M4" },
						{ tag: "LensModel", group: "ExifIFD", value: "FE 24-70mm F2.8 GM II" },
						{ tag: "FNumber", group: "ExifIFD", value: "f/2.8" },
						{ tag: "ExposureTime", group: "ExifIFD", value: "1/500 sec" },
						{ tag: "PhotographicSensitivity", group: "ExifIFD", value: "200" },
						{ tag: "FocalLength", group: "ExifIFD", value: "35.0 mm" },
						{ tag: "DateTimeOriginal", group: "ExifIFD", value: "2026:03:15 10:24:30" },
						{ tag: "GPSLatitude", group: "GPSInfo", value: "6° 54' 53.08\" S" },
						{ tag: "GPSLongitude", group: "GPSInfo", value: "107° 36' 35.32\" E" }
					]
				},
				draft: { ...sampleEditable }
			};

			photos.value.push(item);
		}

		if (supported.length && !selectedPath.value) {
			selectedPath.value = photos.value[photos.value.length - supported.length]?.path;
		}
	};

	const openDialog = async () => {
		if (isTauri()) {
			try {
				const result = await open({
					multiple: true,
					title: "Pilih foto",
					filters: [{ name: "Foto", extensions: SUPPORTED_EXTENSIONS }]
				});
				if (result) await addPaths(Array.isArray(result) ? result : [result]);
				return;
			} catch (err) {
				console.warn("Tauri open failed:", err);
			}
		}

		// Web browser fallback
		if (typeof document !== "undefined") {
			const input = document.createElement("input");
			input.type = "file";
			input.multiple = true;
			input.accept = SUPPORTED_EXTENSIONS.map((e) => `.${e}`).join(",");
			input.onchange = async () => {
				if (input.files && input.files.length) {
					await addWebFiles(Array.from(input.files));
				}
			};
			input.click();
		}
	};

	const removePhoto = async (item: PhotoItem) => {
		if (isDirty(item)) {
			let confirmed = false;
			if (isTauri()) {
				confirmed = await ask(`Perubahan pada ${item.name} belum disimpan. Tutup tanpa menyimpan?`, {
					title: "Perubahan belum disimpan",
					kind: "warning",
					okLabel: "Tutup tanpa menyimpan",
					cancelLabel: "Batal"
				});
			} else {
				confirmed = window.confirm(`Perubahan pada ${item.name} belum disimpan. Tutup tanpa menyimpan?`);
			}
			if (!confirmed) return;
		}

		if (item.blobUrl) {
			URL.revokeObjectURL(item.blobUrl);
		}

		const index = photos.value.indexOf(item);
		photos.value.splice(index, 1);
		checkedPaths.value = checkedPaths.value.filter((p) => p !== item.path);
		if (selectedPath.value === item.path) {
			selectedPath.value = photos.value[Math.min(index, photos.value.length - 1)]?.path;
		}
	};

	const revert = (item: PhotoItem) => {
		if (item.info) item.draft = { ...item.info.editable };
	};

	const run = async (kind: NonNullable<typeof busy.value>, task: () => Promise<void>) => {
		if (busy.value) return;
		busy.value = kind;
		try {
			await task();
		} catch (err) {
			toast.add({ title: "Gagal", description: String(err), color: "error" });
		} finally {
			busy.value = undefined;
		}
	};

	const saveSelected = () => run("save", async () => {
		const item = selected.value;
		if (!item?.draft || !isDirty(item)) return;

		if (isTauri()) {
			const info = await invoke<PhotoInfo>("write_exif", { path: item.path, data: item.draft, output: null });
			applyInfo(item, info);
			toast.add({ title: "Tersimpan", description: item.name, color: "success" });
		} else {
			if (item.info) item.info.editable = { ...item.draft };
			item.version++;
			toast.add({
				title: "Perubahan Disimpan (Mode Web)",
				description: "Untuk menimpa file asli langsung di drive komputer, jalankan aplikasi desktop ExifNuxt.",
				color: "success"
			});
		}
	});

	const askOutputPath = async (item: PhotoItem, suffix: string) => {
		const dot = item.path.lastIndexOf(".");
		const ext = item.path.slice(dot + 1);
		if (isTauri()) {
			return save({
				title: "Simpan sebagai salinan",
				defaultPath: `${item.path.slice(0, dot)}-${suffix}.${ext}`,
				filters: [{ name: ext.toUpperCase(), extensions: [ext] }]
			});
		}
		return `${item.name.replace(/\.[^/.]+$/, "")}-${suffix}.${ext}`;
	};

	const addCopy = (info: PhotoInfo) => {
		const existing = photos.value.find((p) => p.path === info.path);
		if (existing) {
			applyInfo(existing, info);
		} else {
			photos.value.push({ path: info.path, name: info.fileName, status: "loading", version: 0 });
			applyInfo(photos.value.at(-1)!, info);
		}
		selectedPath.value = info.path;
	};

	const saveSelectedAs = () => run("saveAs", async () => {
		const item = selected.value;
		if (!item?.draft) return;
		const output = await askOutputPath(item, "edit");
		if (!output) return;

		if (isTauri()) {
			const info = await invoke<PhotoInfo>("write_exif", { path: item.path, data: item.draft, output });
			revert(item);
			addCopy(info);
			toast.add({ title: "Salinan tersimpan", description: info.fileName, color: "success" });
		} else {
			toast.add({
				title: "Salinan Tersimpan (Mode Web)",
				description: `Salinan ${output} berhasil disimulasikan.`,
				color: "success"
			});
		}
	});

	const stripSelected = (asCopy: boolean) => run("strip", async () => {
		const item = selected.value;
		if (!item) return;

		let output: string | null = null;
		if (asCopy) {
			output = await askOutputPath(item, "tanpa-exif");
			if (!output) return;
		} else {
			let confirmed = false;
			if (isTauri()) {
				confirmed = await ask(`Semua metadata EXIF di ${item.name} akan dihapus permanen, termasuk lokasi GPS dan info kamera. Lanjutkan?`, {
					title: "Hapus semua EXIF",
					kind: "warning",
					okLabel: "Hapus EXIF",
					cancelLabel: "Batal"
				});
			} else {
				confirmed = window.confirm(`Semua metadata EXIF di ${item.name} akan dihapus permanen. Lanjutkan?`);
			}
			if (!confirmed) return;
		}

		if (isTauri()) {
			const info = await invoke<PhotoInfo>("strip_exif", { path: item.path, output });
			if (output) addCopy(info);
			else applyInfo(item, info);
			toast.add({ title: "EXIF dihapus", description: info.fileName, color: "success" });
		} else {
			if (item.info) {
				item.info.entries = [];
				for (const k of Object.keys(item.info.editable) as ExifKey[]) {
					item.info.editable[k] = "";
				}
				item.draft = { ...item.info.editable };
			}
			toast.add({ title: "EXIF dihapus", description: item.name, color: "success" });
		}
	});

	const dirtyCount = computed(() => photos.value.filter(isDirty).length);

	const writeSystemClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			// fallback
		}
	};

	const copyGroups = async (item: PhotoItem, groupIds?: string[]) => {
		if (!item.draft) return;
		const groups = fieldGroups.filter((g) => !groupIds || groupIds.includes(g.id));
		const values: Partial<EditableExif> = {};
		const lines: string[] = [];

		for (const group of groups) {
			for (const field of group.fields) {
				const value = item.draft[field.key];
				if (!value) continue;
				values[field.key] = value;
				lines.push(`${field.label}: ${value}`);
			}
		}

		if (!lines.length) {
			toast.add({ title: "Tidak ada yang disalin", description: "Semua field di bagian ini masih kosong.", color: "warning" });
			return;
		}

		clipboard.value = {
			sourcePath: item.path,
			sourceName: item.name,
			groupTitles: groupIds ? groups.map((g) => g.title) : ["Semua field"],
			values
		};
		await writeSystemClipboard(lines.join("\n"));
		toast.add({ title: `${lines.length} field disalin`, description: "Tempel ke foto lain lewat panel kanan, atau sebagai teks di aplikasi lain." });
	};

	const pasteInto = (items: PhotoItem[]) => {
		const values = clipboard.value?.values;
		if (!values) return;
		const targets = items.filter((p) => p.draft && p.path !== clipboard.value!.sourcePath);
		for (const target of targets) Object.assign(target.draft!, values);
		toast.add({
			title: targets.length === 1 ? "Field ditempel" : `Field ditempel ke ${targets.length} foto`,
			description: "Belum tersimpan ke file. Tekan Simpan untuk menulisnya."
		});
	};

	const pasteToSelected = () => {
		if (selected.value) pasteInto([selected.value]);
	};

	const pasteToAll = () => pasteInto(photos.value);

	const clearClipboard = () => {
		clipboard.value = undefined;
	};

	const copyText = async (text: string, what: string) => {
		await writeSystemClipboard(text);
		toast.add({ title: `${what} disalin ke clipboard` });
	};

	const saveItems = (items: PhotoItem[]) => run("saveAll", async () => {
		const dirty = items.filter(isDirty);
		const failed: string[] = [];
		for (const item of dirty) {
			try {
				if (isTauri()) {
					applyInfo(item, await invoke<PhotoInfo>("write_exif", { path: item.path, data: item.draft, output: null }));
				} else {
					if (item.info) item.info.editable = { ...item.draft! };
					item.version++;
				}
			} catch (err) {
				failed.push(`${item.name}: ${err}`);
			}
		}
		const saved = dirty.length - failed.length;
		if (saved) toast.add({ title: `${saved} foto tersimpan`, color: "success" });
		if (failed.length) toast.add({ title: `${failed.length} foto gagal disimpan`, description: failed.join("; "), color: "error" });
	});

	const saveAll = () => saveItems(photos.value);

	const selectPhoto = (path: string) => {
		selectedPath.value = path;
		mode.value = "single";
	};

	const selectNext = () => {
		if (!photos.value.length) return;
		const nextIdx = (selectedIndex.value + 1) % photos.value.length;
		selectedPath.value = photos.value[nextIdx]?.path;
	};

	const selectPrev = () => {
		if (!photos.value.length) return;
		const prevIdx = (selectedIndex.value - 1 + photos.value.length) % photos.value.length;
		selectedPath.value = photos.value[prevIdx]?.path;
	};

	const selectAll = () => {
		checkedPaths.value = photos.value.map((p) => p.path);
		mode.value = checkedPaths.value.length > 1 ? "batch" : "single";
	};

	const deselectAll = () => {
		checkedPaths.value = [];
		mode.value = "single";
	};

	const setChecked = (paths: string[]) => {
		checkedPaths.value = photos.value.map((p) => p.path).filter((p) => paths.includes(p));
		mode.value = checkedPaths.value.length > 1 ? "batch" : "single";
	};

	const toggleChecked = (path: string, value: boolean) => {
		setChecked(value ? [...checkedPaths.value, path] : checkedPaths.value.filter((p) => p !== path));
	};

	const applyBatch = async (values: Partial<EditableExif>, saveNow: boolean) => {
		const targets = checkedItems.value.filter((p) => p.draft);
		for (const item of targets) Object.assign(item.draft!, values);
		if (saveNow) {
			await saveItems(targets);
		} else {
			toast.add({ title: `Diterapkan ke ${targets.length} foto`, description: "Belum tersimpan ke file. Simpan dari menu Lainnya atau per foto." });
		}
	};

	return {
		photos,
		selected,
		selectedIndex,
		selectedPath,
		busy,
		dirtyCount,
		clipboard,
		isDirty,
		previewSrc,
		addPaths,
		addWebFiles,
		openDialog,
		removePhoto,
		reload: load,
		revert,
		saveSelected,
		saveSelectedAs,
		stripSelected,
		saveAll,
		mode,
		checkedPaths,
		checkedItems,
		selectPhoto,
		selectNext,
		selectPrev,
		selectAll,
		deselectAll,
		setChecked,
		toggleChecked,
		applyBatch,
		copyGroups,
		copyText,
		pasteToSelected,
		pasteToAll,
		clearClipboard
	};
});
