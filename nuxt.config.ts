import process from "node:process";

const host = process.env.TAURI_DEV_HOST;
const baseURL = process.env.NUXT_APP_BASE_URL || "/";

export default defineNuxtConfig({
	modules: [
		"@vueuse/nuxt",
		"@nuxt/ui",
		"nuxt-svgo",
		"reka-ui/nuxt",
		"@nuxt/eslint"
	],
	app: {
		baseURL,
		head: {
			title: "ExifNuxt · Editor Metadata EXIF Foto Desktop",
			charset: "utf-8",
			viewport: "width=device-width, initial-scale=1, maximum-scale=1",
			meta: [
				{ name: "format-detection", content: "no" },
				{ name: "description", content: "Editor metadata EXIF foto untuk desktop dan web: edit per file atau massal, bersihkan EXIF untuk privasi, salin grup lokasi dan kamera." },
				{ name: "theme-color", content: "#141210" }
			],
			link: [
				{ rel: "icon", type: "image/svg+xml", href: `${baseURL}favicon.svg` },
				{ rel: "alternate icon", type: "image/svg+xml", href: `${baseURL}logo.svg` },
				{ rel: "apple-touch-icon", href: `${baseURL}logo.svg` }
			]
		}
	},
	css: [
		"@/assets/css/main.css"
	],
	svgo: {
		autoImportPath: "@/assets/"
	},
	// The desktop app must work offline, so icons are bundled instead of fetched from the Iconify API
	icon: {
		provider: "none",
		clientBundle: {
			scan: {
				globInclude: ["app/**/*.{vue,ts}"]
			}
		}
	},
	colorMode: {
		preference: "dark",
		fallback: "dark"
	},
	ssr: false,
	dir: {
		modules: "app/modules"
	},
	imports: {
		presets: [
			{
				from: "zod",
				imports: [
					"z",
					{
						name: "infer",
						as: "zInfer",
						type: true
					}
				]
			}
		]
	},
	vite: {
		clearScreen: false,
		envPrefix: ["VITE_", "TAURI_"],
		server: {
			strictPort: true,
			hmr: host
				? {
					protocol: "ws",
					host,
					port: 3001
				}
				: undefined,
			watch: {
				ignored: ["**/src-tauri/**"]
			}
		}
	},
	devServer: {
		host: host || "0.0.0.0"
	},
	eslint: {
		config: {
			standalone: false
		}
	},
	devtools: {
		enabled: false
	},
	experimental: {
		typedPages: true
	},
	compatibilityDate: "2026-01-01"
});
