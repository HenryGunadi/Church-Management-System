// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    // This allows SPA routing (history API) to work
    historyApiFallback: true,
  },
});
