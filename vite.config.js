import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "RAGToolkit",
      fileName: format => `rag-toolkit.${format}.js`
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM"
        }
      }
    }
  },
  plugins: [react()],
  server: {
    open: true,
    port: 3000
  }
});
