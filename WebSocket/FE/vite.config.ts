import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/"),
      assets: path.resolve(__dirname, "./src/assets"),
      component: path.resolve(__dirname, "./src/Component"),
      page:path.resolve(__dirname, "./src/page"),
      features: path.resolve(__dirname, "./src/features"),
      app: path.resolve(__dirname, "./src/app/"),
    },
  },
});
