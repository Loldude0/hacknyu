import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/coingecko": {
        target: "https://api.coingecko.com/api/v3",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, ""),
        secure: false,
      },
      "/api": {
        target: "http://localhost:5000/",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
