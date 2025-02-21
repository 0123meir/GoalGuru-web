import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import createImportPlugin from "vite-tsconfig-paths";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),createImportPlugin({
    /* options */
  }),],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});