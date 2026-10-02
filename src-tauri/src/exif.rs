use std::fs;
use std::io::BufReader;
use std::path::{Path, PathBuf};

use exif::{In, Reader, Tag, Value};
use little_exif::exif_tag::ExifTag;
use little_exif::metadata::Metadata;
use little_exif::rational::uR64;
use serde::{Deserialize, Serialize};

/// Fields the editor form can change. Everything travels as a string so the
/// frontend can bind inputs directly; an empty string means "remove the tag".
#[derive(Debug, Default, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct EditableExif {
	pub make: String,
	pub model: String,
	pub lens_make: String,
	pub lens_model: String,
	pub serial_number: String,
	pub software: String,
	pub artist: String,
	pub owner_name: String,
	pub copyright: String,
	pub description: String,
	pub user_comment: String,
	pub date_time_original: String,
	pub create_date: String,
	pub modify_date: String,
	pub offset_time_original: String,
	pub orientation: String,
	pub iso: String,
	pub f_number: String,
	pub exposure_time: String,
	pub focal_length: String,
	pub gps_latitude: String,
	pub gps_longitude: String,
	pub gps_altitude: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExifEntry {
	pub tag: String,
	pub group: String,
	pub value: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PhotoInfo {
	pub path: String,
	pub file_name: String,
	pub size: u64,
	pub editable: EditableExif,
	pub entries: Vec<ExifEntry>,
}

fn ascii(exif: &exif::Exif, tag: Tag) -> String {
	match exif.get_field(tag, In::PRIMARY).map(|f| &f.value) {
		Some(Value::Ascii(parts)) => parts
			.iter()
			.map(|p| String::from_utf8_lossy(p).trim_end_matches('\0').trim().to_string())
			.collect::<Vec<_>>()
			.join(" "),
		_ => String::new(),
	}
}

fn uint(exif: &exif::Exif, tag: Tag) -> String {
	exif.get_field(tag, In::PRIMARY)
		.and_then(|f| f.value.get_uint(0))
		.map(|v| v.to_string())
		.unwrap_or_default()
}

fn rational(exif: &exif::Exif, tag: Tag) -> Option<f64> {
	match exif.get_field(tag, In::PRIMARY).map(|f| &f.value) {
		Some(Value::Rational(v)) if !v.is_empty() && v[0].denom != 0 => Some(v[0].to_f64()),
		_ => None,
	}
}

fn fmt_num(v: f64) -> String {
	let s = format!("{v:.6}");
	s.trim_end_matches('0').trim_end_matches('.').to_string()
}

fn exposure(exif: &exif::Exif) -> String {
	match exif.get_field(Tag::ExposureTime, In::PRIMARY).map(|f| &f.value) {
		Some(Value::Rational(v)) if !v.is_empty() && v[0].denom != 0 => {
			let r = v[0];
			if r.num == 0 {
				"0".into()
			} else if r.num < r.denom && r.denom % r.num == 0 {
				// Normalise e.g. 10/1250 to 1/125
				format!("1/{}", r.denom / r.num)
			} else if r.num < r.denom {
				// Keep the exact fraction (e.g. 10/6536) instead of a lossy 1/653.59
				format!("{}/{}", r.num, r.denom)
			} else {
				fmt_num(r.to_f64())
			}
		}
		_ => String::new(),
	}
}

fn gps_coord(exif: &exif::Exif, tag: Tag, ref_tag: Tag, negative_ref: &str) -> String {
	let Some(Value::Rational(v)) = exif.get_field(tag, In::PRIMARY).map(|f| &f.value) else {
		return String::new();
	};
	if v.len() < 3 || v.iter().any(|r| r.denom == 0) {
		return String::new();
	}
	let mut deg = v[0].to_f64() + v[1].to_f64() / 60.0 + v[2].to_f64() / 3600.0;
	if ascii(exif, ref_tag).eq_ignore_ascii_case(negative_ref) {
		deg = -deg;
	}
	fmt_num(deg)
}

fn gps_altitude(exif: &exif::Exif) -> String {
	let Some(alt) = rational(exif, Tag::GPSAltitude) else {
		return String::new();
	};
	let below_sea = uint(exif, Tag::GPSAltitudeRef) == "1";
	fmt_num(if below_sea { -alt } else { alt })
}

fn user_comment(exif: &exif::Exif) -> String {
	let Some(Value::Undefined(bytes, _)) = exif.get_field(Tag::UserComment, In::PRIMARY).map(|f| &f.value) else {
		return String::new();
	};
	if bytes.len() <= 8 {
		return String::new();
	}
	let (charset, text) = bytes.split_at(8);
	if charset.starts_with(b"UNICODE") {
		// UCS-2; byte order follows the file, so guess from where the zero bytes sit
		let big_endian = text.first() == Some(&0);
		let units: Vec<u16> = text
			.chunks_exact(2)
			.map(|c| if big_endian { u16::from_be_bytes([c[0], c[1]]) } else { u16::from_le_bytes([c[0], c[1]]) })
			.collect();
		return String::from_utf16_lossy(&units).trim_end_matches('\0').trim().to_string();
	}
	String::from_utf8_lossy(text).trim_end_matches('\0').trim().to_string()
}

fn editable_from(exif: &exif::Exif) -> EditableExif {
	EditableExif {
		make: ascii(exif, Tag::Make),
		model: ascii(exif, Tag::Model),
		lens_make: ascii(exif, Tag::LensMake),
		lens_model: ascii(exif, Tag::LensModel),
		serial_number: ascii(exif, Tag::BodySerialNumber),
		software: ascii(exif, Tag::Software),
		artist: ascii(exif, Tag::Artist),
		owner_name: ascii(exif, Tag::CameraOwnerName),
		copyright: ascii(exif, Tag::Copyright),
		description: ascii(exif, Tag::ImageDescription),
		user_comment: user_comment(exif),
		date_time_original: ascii(exif, Tag::DateTimeOriginal),
		create_date: ascii(exif, Tag::DateTimeDigitized),
		modify_date: ascii(exif, Tag::DateTime),
		offset_time_original: ascii(exif, Tag::OffsetTimeOriginal),
		orientation: uint(exif, Tag::Orientation),
		iso: uint(exif, Tag::PhotographicSensitivity),
		f_number: rational(exif, Tag::FNumber).map(fmt_num).unwrap_or_default(),
		exposure_time: exposure(exif),
		focal_length: rational(exif, Tag::FocalLength).map(fmt_num).unwrap_or_default(),
		gps_latitude: gps_coord(exif, Tag::GPSLatitude, Tag::GPSLatitudeRef, "S"),
		gps_longitude: gps_coord(exif, Tag::GPSLongitude, Tag::GPSLongitudeRef, "W"),
		gps_altitude: gps_altitude(exif),
	}
}

fn read_photo(path: &Path) -> Result<PhotoInfo, String> {
	let meta = fs::metadata(path).map_err(|e| format!("Gagal membaca file: {e}"))?;
	let file = fs::File::open(path).map_err(|e| format!("Gagal membuka file: {e}"))?;

	let parsed = match Reader::new().read_from_container(&mut BufReader::new(file)) {
		// little_exif stores PNG metadata in a zTXt "Raw profile type exif" chunk that
		// kamadak-exif doesn't look at, so fall back to its raw TIFF block
		Err(exif::Error::NotFound(_)) => match Metadata::new_from_path(path).and_then(|m| m.encode()) {
			Ok(raw) if raw.len() > 8 => Reader::new().read_raw(raw),
			_ => Err(exif::Error::NotFound("no EXIF")),
		},
		other => other,
	};

	let (editable, entries) = match parsed {
		Ok(exif) => {
			let entries = exif
				.fields()
				// Skip the bulky binary blobs nobody wants to read in a table
				.filter(|f| !matches!(f.tag, Tag::MakerNote | Tag::JPEGInterchangeFormat | Tag::JPEGInterchangeFormatLength))
				.map(|f| ExifEntry {
					tag: f.tag.to_string(),
					group: if f.ifd_num == In::THUMBNAIL { "Thumbnail".into() } else { format!("{:?}", f.tag.context()) },
					value: f.display_value().with_unit(&exif).to_string(),
				})
				.collect();
			(editable_from(&exif), entries)
		}
		Err(exif::Error::NotFound(_)) | Err(exif::Error::BlankValue(_)) => (EditableExif::default(), Vec::new()),
		Err(e) => return Err(format!("Gagal membaca EXIF: {e}")),
	};

	Ok(PhotoInfo {
		path: path.to_string_lossy().into_owned(),
		file_name: path.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default(),
		size: meta.len(),
		editable,
		entries,
	})
}

fn parse_f64(field: &str, value: &str) -> Result<f64, String> {
	value.trim().replace(',', ".").parse::<f64>().map_err(|_| format!("{field}: \"{value}\" bukan angka yang valid"))
}

fn parse_exposure(value: &str) -> Result<uR64, String> {
	let v = value.trim().trim_end_matches('s').trim();
	if let Some((n, d)) = v.split_once('/') {
		if let (Ok(n), Ok(d)) = (n.trim().parse::<u32>(), d.trim().parse::<u32>()) {
			if d == 0 {
				return Err("Kecepatan rana: penyebut tidak boleh 0".into());
			}
			return Ok(uR64 { nominator: n, denominator: d });
		}
		// Decimal parts like "1/653.59" fall back to a float approximation
		let n = parse_f64("Kecepatan rana", n)?;
		let d = parse_f64("Kecepatan rana", d)?;
		if d == 0.0 {
			return Err("Kecepatan rana: penyebut tidak boleh 0".into());
		}
		return Ok((n / d).into());
	}
	Ok(parse_f64("Exposure", v)?.into())
}

fn to_dms(value: f64) -> Vec<uR64> {
	let abs = value.abs();
	let deg = abs.trunc();
	let min = ((abs - deg) * 60.0).trunc();
	let sec = (abs - deg - min / 60.0) * 3600.0;
	vec![
		uR64 { nominator: deg as u32, denominator: 1 },
		uR64 { nominator: min as u32, denominator: 1 },
		uR64 { nominator: (sec * 10000.0).round() as u32, denominator: 10000 },
	]
}

fn validate_datetime(field: &str, value: &str) -> Result<String, String> {
	let v = value.trim();
	let bytes = v.as_bytes();
	let ok = bytes.len() == 19
		&& bytes.iter().enumerate().all(|(i, b)| match i {
			4 | 7 => *b == b':',
			10 => *b == b' ',
			13 | 16 => *b == b':',
			_ => b.is_ascii_digit(),
		});
	if ok {
		Ok(v.to_string())
	} else {
		Err(format!("{field}: format harus YYYY:MM:DD HH:MM:SS"))
	}
}

/// Sets `tag` when `value` is non-empty, otherwise removes it. Untouched fields are
/// skipped so the camera's original encoding never gets rewritten through a lossy parse.
fn apply(meta: &mut Metadata, value: &str, current: &str, empty: ExifTag, build: impl FnOnce(&str) -> Result<ExifTag, String>) -> Result<(), String> {
	if value == current {
		return Ok(());
	}
	if value.trim().is_empty() {
		meta.remove_tag(empty);
	} else {
		meta.set_tag(build(value.trim())?);
	}
	Ok(())
}

fn apply_editable(meta: &mut Metadata, d: &EditableExif, cur: &EditableExif) -> Result<(), String> {
	let s = String::new;
	let text = |ctor: fn(String) -> ExifTag| move |v: &str| Ok(ctor(v.to_string()));

	apply(meta, &d.make, &cur.make, ExifTag::Make(s()), text(ExifTag::Make))?;
	apply(meta, &d.model, &cur.model, ExifTag::Model(s()), text(ExifTag::Model))?;
	apply(meta, &d.lens_make, &cur.lens_make, ExifTag::LensMake(s()), text(ExifTag::LensMake))?;
	apply(meta, &d.lens_model, &cur.lens_model, ExifTag::LensModel(s()), text(ExifTag::LensModel))?;
	apply(meta, &d.serial_number, &cur.serial_number, ExifTag::SerialNumber(s()), text(ExifTag::SerialNumber))?;
	apply(meta, &d.software, &cur.software, ExifTag::Software(s()), text(ExifTag::Software))?;
	apply(meta, &d.artist, &cur.artist, ExifTag::Artist(s()), text(ExifTag::Artist))?;
	apply(meta, &d.owner_name, &cur.owner_name, ExifTag::OwnerName(s()), text(ExifTag::OwnerName))?;
	apply(meta, &d.copyright, &cur.copyright, ExifTag::Copyright(s()), text(ExifTag::Copyright))?;
	apply(meta, &d.description, &cur.description, ExifTag::ImageDescription(s()), text(ExifTag::ImageDescription))?;
	apply(meta, &d.offset_time_original, &cur.offset_time_original, ExifTag::OffsetTimeOriginal(s()), text(ExifTag::OffsetTimeOriginal))?;

	apply(meta, &d.user_comment, &cur.user_comment, ExifTag::UserComment(Vec::new()), |v| {
		// 8-byte character code header; UTF-8 text is stored as "undefined"
		let mut bytes = if v.is_ascii() { b"ASCII\0\0\0".to_vec() } else { vec![0u8; 8] };
		bytes.extend_from_slice(v.as_bytes());
		Ok(ExifTag::UserComment(bytes))
	})?;

	apply(meta, &d.date_time_original, &cur.date_time_original, ExifTag::DateTimeOriginal(s()), |v| {
		Ok(ExifTag::DateTimeOriginal(validate_datetime("Tanggal diambil", v)?))
	})?;
	apply(meta, &d.create_date, &cur.create_date, ExifTag::CreateDate(s()), |v| Ok(ExifTag::CreateDate(validate_datetime("Tanggal digitalisasi", v)?)))?;
	apply(meta, &d.modify_date, &cur.modify_date, ExifTag::ModifyDate(s()), |v| Ok(ExifTag::ModifyDate(validate_datetime("Tanggal diubah", v)?)))?;

	apply(meta, &d.orientation, &cur.orientation, ExifTag::Orientation(Vec::new()), |v| {
		let o: u16 = v.parse().map_err(|_| "Orientasi harus 1-8".to_string())?;
		if !(1..=8).contains(&o) {
			return Err("Orientasi harus 1-8".into());
		}
		Ok(ExifTag::Orientation(vec![o]))
	})?;
	apply(meta, &d.iso, &cur.iso, ExifTag::ISO(Vec::new()), |v| {
		let iso: u16 = v.parse().map_err(|_| format!("ISO: \"{v}\" harus bilangan bulat 0-65535"))?;
		Ok(ExifTag::ISO(vec![iso]))
	})?;
	apply(meta, &d.f_number, &cur.f_number, ExifTag::FNumber(Vec::new()), |v| {
		Ok(ExifTag::FNumber(vec![parse_f64("Aperture", v.trim_start_matches(['f', 'F', '/']))?.into()]))
	})?;
	apply(meta, &d.exposure_time, &cur.exposure_time, ExifTag::ExposureTime(Vec::new()), |v| Ok(ExifTag::ExposureTime(vec![parse_exposure(v)?])))?;
	apply(meta, &d.focal_length, &cur.focal_length, ExifTag::FocalLength(Vec::new()), |v| {
		Ok(ExifTag::FocalLength(vec![parse_f64("Focal length", v.trim_end_matches("mm"))?.into()]))
	})?;

	apply_gps(meta, d, cur)
}

fn apply_gps(meta: &mut Metadata, d: &EditableExif, cur: &EditableExif) -> Result<(), String> {
	let lat = d.gps_latitude.trim();
	let lon = d.gps_longitude.trim();

	if lat.is_empty() != lon.is_empty() {
		return Err("Latitude dan longitude harus diisi berdua atau dikosongkan berdua".into());
	}

	let coords_changed = d.gps_latitude != cur.gps_latitude || d.gps_longitude != cur.gps_longitude;
	if !coords_changed {
		// leave the stored coordinates exactly as they are
	} else if lat.is_empty() {
		meta.remove_tag(ExifTag::GPSLatitude(Vec::new()));
		meta.remove_tag(ExifTag::GPSLatitudeRef(String::new()));
		meta.remove_tag(ExifTag::GPSLongitude(Vec::new()));
		meta.remove_tag(ExifTag::GPSLongitudeRef(String::new()));
	} else {
		let lat_v = parse_f64("Latitude", lat)?;
		let lon_v = parse_f64("Longitude", lon)?;
		if !(-90.0..=90.0).contains(&lat_v) {
			return Err("Latitude harus di antara -90 dan 90".into());
		}
		if !(-180.0..=180.0).contains(&lon_v) {
			return Err("Longitude harus di antara -180 dan 180".into());
		}
		meta.set_tag(ExifTag::GPSVersionID(vec![2, 3, 0, 0]));
		meta.set_tag(ExifTag::GPSLatitudeRef(if lat_v < 0.0 { "S" } else { "N" }.into()));
		meta.set_tag(ExifTag::GPSLatitude(to_dms(lat_v)));
		meta.set_tag(ExifTag::GPSLongitudeRef(if lon_v < 0.0 { "W" } else { "E" }.into()));
		meta.set_tag(ExifTag::GPSLongitude(to_dms(lon_v)));
	}

	let alt = d.gps_altitude.trim();
	if d.gps_altitude == cur.gps_altitude {
		// unchanged
	} else if alt.is_empty() {
		meta.remove_tag(ExifTag::GPSAltitude(Vec::new()));
		meta.remove_tag(ExifTag::GPSAltitudeRef(Vec::new()));
	} else {
		let alt_v = parse_f64("Altitude", alt.trim_end_matches('m'))?;
		meta.set_tag(ExifTag::GPSAltitudeRef(vec![u8::from(alt_v < 0.0)]));
		meta.set_tag(ExifTag::GPSAltitude(vec![alt_v.abs().into()]));
	}
	Ok(())
}

/// Copies the source to `output` only when the user picked "save as copy".
fn target_path(path: &str, output: Option<String>) -> Result<PathBuf, String> {
	let source = PathBuf::from(path);
	match output {
		Some(out) if !out.is_empty() && Path::new(&out) != source => {
			fs::copy(&source, &out).map_err(|e| format!("Gagal menyalin file: {e}"))?;
			Ok(PathBuf::from(out))
		}
		_ => Ok(source),
	}
}

#[tauri::command]
pub async fn read_exif(path: String) -> Result<PhotoInfo, String> {
	read_photo(Path::new(&path))
}

#[tauri::command]
pub async fn write_exif(path: String, data: EditableExif, output: Option<String>) -> Result<PhotoInfo, String> {
	let current = read_photo(Path::new(&path))?.editable;
	let mut meta = Metadata::new_from_path(Path::new(&path)).unwrap_or_else(|_| Metadata::new());
	apply_editable(&mut meta, &data, &current)?;

	// Without `output` the original file is replaced in place (the default Save)
	let target = target_path(&path, output)?;
	meta.write_to_file(&target).map_err(|e| format!("Gagal menulis EXIF: {e}"))?;
	read_photo(&target)
}

#[tauri::command]
pub async fn strip_exif(path: String, output: Option<String>) -> Result<PhotoInfo, String> {
	let target = target_path(&path, output)?;
	Metadata::file_clear_metadata(&target).map_err(|e| format!("Gagal menghapus EXIF: {e}"))?;
	read_photo(&target)
}

#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	fn dms_round_trip() {
		let dms = to_dms(-6.914744);
		let back: f64 = dms[0].nominator as f64 + dms[1].nominator as f64 / 60.0 + dms[2].nominator as f64 / dms[2].denominator as f64 / 3600.0;
		assert!((back - 6.914744).abs() < 1e-6);
	}

	#[test]
	fn exposure_parsing() {
		assert_eq!(parse_exposure("1/125").unwrap(), uR64 { nominator: 1, denominator: 125 });
		assert!(parse_exposure("1/0").is_err());
		let approx: f64 = parse_exposure("1/653.594771").unwrap().into();
		assert!((approx - 1.0 / 653.594771).abs() < 1e-6);
	}

	#[test]
	fn datetime_validation() {
		assert!(validate_datetime("x", "2024:05:01 13:45:00").is_ok());
		assert!(validate_datetime("x", "2024-05-01 13:45").is_err());
	}
}
