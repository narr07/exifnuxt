// Mirrors the structs in src-tauri/src/exif.rs
export interface EditableExif {
	make: string
	model: string
	lensMake: string
	lensModel: string
	serialNumber: string
	software: string
	artist: string
	ownerName: string
	copyright: string
	description: string
	userComment: string
	dateTimeOriginal: string
	createDate: string
	modifyDate: string
	offsetTimeOriginal: string
	orientation: string
	iso: string
	fNumber: string
	exposureTime: string
	focalLength: string
	gpsLatitude: string
	gpsLongitude: string
	gpsAltitude: string
}

export interface ExifEntry {
	tag: string
	group: string
	value: string
}

export interface PhotoInfo {
	path: string
	fileName: string
	size: number
	editable: EditableExif
	entries: ExifEntry[]
}

export type ExifKey = keyof EditableExif;

export type FieldKind = "text" | "textarea" | "datetime" | "orientation";

export interface FieldDef {
	key: ExifKey
	label: string
	kind?: FieldKind
	placeholder?: string
	hint?: string
	mono?: boolean
	half?: boolean
}

export interface FieldGroup {
	id: string
	title: string
	fields: FieldDef[]
}

export const SUPPORTED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "tif", "tiff", "heic", "heif", "jxl"];

export const fieldGroups: FieldGroup[] = [
	{
		id: "camera",
		title: "Kamera & lensa",
		fields: [
			{ key: "make", label: "Merek kamera", half: true },
			{ key: "model", label: "Model kamera", half: true },
			{ key: "lensMake", label: "Merek lensa", half: true },
			{ key: "lensModel", label: "Model lensa", half: true },
			{ key: "serialNumber", label: "Nomor seri bodi", mono: true, half: true },
			{ key: "software", label: "Software", half: true }
		]
	},
	{
		id: "exposure",
		title: "Pengaturan pemotretan",
		fields: [
			{ key: "fNumber", label: "Aperture (f/)", placeholder: "2.8", mono: true, half: true },
			{ key: "exposureTime", label: "Kecepatan rana (detik)", placeholder: "1/125", mono: true, half: true },
			{ key: "iso", label: "ISO", placeholder: "400", mono: true, half: true },
			{ key: "focalLength", label: "Focal length (mm)", placeholder: "35", mono: true, half: true },
			{ key: "orientation", label: "Orientasi", kind: "orientation" }
		]
	},
	{
		id: "time",
		title: "Waktu",
		fields: [
			{ key: "dateTimeOriginal", label: "Diambil", kind: "datetime" },
			{ key: "createDate", label: "Didigitalkan", kind: "datetime" },
			{ key: "modifyDate", label: "Diubah", kind: "datetime" },
			{ key: "offsetTimeOriginal", label: "Zona waktu", placeholder: "+07:00", hint: "Selisih dari UTC saat foto diambil", mono: true }
		]
	},
	{
		id: "author",
		title: "Pembuat & hak cipta",
		fields: [
			{ key: "artist", label: "Fotografer", half: true },
			{ key: "ownerName", label: "Pemilik kamera", half: true },
			{ key: "copyright", label: "Hak cipta", placeholder: "© 2026 Nama Anda" },
			{ key: "description", label: "Deskripsi", kind: "textarea" },
			{ key: "userComment", label: "Komentar", kind: "textarea" }
		]
	},
	{
		id: "location",
		title: "Lokasi",
		fields: [
			{ key: "gpsLatitude", label: "Latitude", placeholder: "-6.914744", hint: "Negatif = selatan", mono: true, half: true },
			{ key: "gpsLongitude", label: "Longitude", placeholder: "107.609810", hint: "Negatif = barat", mono: true, half: true },
			{ key: "gpsAltitude", label: "Ketinggian (m)", placeholder: "768", mono: true, half: true }
		]
	}
];

export const orientationOptions = [
	{ label: "Tidak diatur", value: "none" },
	{ label: "1: Normal", value: "1" },
	{ label: "2: Dicerminkan horizontal", value: "2" },
	{ label: "3: Diputar 180°", value: "3" },
	{ label: "4: Dicerminkan vertikal", value: "4" },
	{ label: "5: Dicerminkan, diputar 90° berlawanan jarum jam", value: "5" },
	{ label: "6: Diputar 90° searah jarum jam", value: "6" },
	{ label: "7: Dicerminkan, diputar 90° searah jarum jam", value: "7" },
	{ label: "8: Diputar 90° berlawanan jarum jam", value: "8" }
];

export const isSupportedPath = (path: string) => {
	const ext = path.split(".").pop()?.toLowerCase() ?? "";
	return SUPPORTED_EXTENSIONS.includes(ext);
};

export const formatBytes = (bytes: number) => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// EXIF stores "YYYY:MM:DD HH:MM:SS"; <input type="datetime-local"> wants "YYYY-MM-DDTHH:MM:SS"
export const exifToInputDate = (value: string) => {
	const m = value.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
	return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}` : "";
};

export const inputToExifDate = (value: string) => {
	const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
	return m ? `${m[1]}:${m[2]}:${m[3]} ${m[4]}:${m[5]}:${m[6] ?? "00"}` : "";
};

export const frameNumber = (index: number) => String(index + 1).padStart(2, "0");
