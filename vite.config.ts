import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths(),
    tanstackStart({}),
    nitroV2Plugin({
      preset: "vercel",
    }),
    viteReact(),
  ],
});
