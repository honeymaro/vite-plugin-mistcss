import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "./lib/vite-plugin-mistcss.ts",
      name: "vite-plugin-mistcss",
    },
    rollupOptions: {
      external: ["child_process"],
    },
  },
  plugins: [dts()],
});
