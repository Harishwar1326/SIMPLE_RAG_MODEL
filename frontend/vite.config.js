import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import backendApp from "./api/backend/index.js";

function mountBackendPlugin() {
  return {
    name: "mount-naive-rag-backend",
    configureServer(server) {
      server.middlewares.use("/api/backend", backendApp);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/backend", backendApp);
    },
  };
}

export default defineConfig({
  plugins: [react(), mountBackendPlugin()],
});
