import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  optimizeDeps: { exclude: ["pyodide"] },
  plugins: [react()],
  worker: {
    format: "es",
  },
});
