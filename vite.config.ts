
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./", // Set base to relative path for shared hosting compatibility
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist", // Explicitly set output directory to dist
    emptyOutDir: true, // Clean the output directory before build
    sourcemap: false, // Disable sourcemaps for production to reduce file size
    chunkSizeWarningLimit: 1000, // Increase warning limit for chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom'
          ],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-dropdown-menu',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
          ]
        }
      }
    }
  }
}));
