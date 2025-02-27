import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["mistcss"],
    },
    ssr: true,

    lib: {
      entry: "./lib/vite-plugin-mistcss.ts",
      formats: ["es"],
      name: "vite-plugin-mistcss",
    },
  },
  plugins: [dts()],
});
