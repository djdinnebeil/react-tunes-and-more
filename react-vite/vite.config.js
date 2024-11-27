import { defineConfig } from "vite";
import eslintPlugin from "vite-plugin-eslint";
import react from "@vitejs/plugin-react";
import commonjs from 'vite-plugin-commonjs';


// https://vitejs.dev/config/
export default defineConfig((mode) => ({
  plugins: [
    react(),
    commonjs(),
    eslintPlugin({
      lintOnStart: true,
      failOnError: mode === "production",
    }),
  ],
  server: {
    open: true,
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
  resolve: {
  alias: {
    jsmediatags: 'jsmediatags/dist/jsmediatags.min.js',
  },
},
}));
