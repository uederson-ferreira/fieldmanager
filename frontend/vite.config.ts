import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
              },
            },
          },
          // CACHE REDUZIDO PARA METAS - 5 minutos apenas
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*metas.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "metas-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 5, // 5 minutos
              },
            },
          },
          // CACHE REDUZIDO PARA PROGRESSO - 2 minutos apenas
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*progresso.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "progresso-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 2, // 2 minutos
              },
            },
          },
          // CACHE PADRÃO PARA OUTRAS APIs
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 dia
              },
            },
          },
        ],
        // Configurações de atualização
        skipWaiting: true,
        clientsClaim: true,
        // Limpar caches antigos automaticamente
        cleanupOutdatedCaches: true,
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "EcoField - Sistema de Gestão Ambiental",
        short_name: "EcoField",
        description:
          "Sistema completo para gestão de atividades ambientais e rotinas de campo",
        theme_color: "#10b981",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable any",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable any",
          },
        ],
        categories: ["productivity", "business", "utilities"],
        lang: "pt-BR",
        dir: "ltr",
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: true, // Para acessar via IP na rede local
  },
  build: {
    target: "esnext",
    sourcemap: false, // Desabilitar sourcemap em produção
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', 'lucide-react'],
          utils: ['uuid', 'zustand']
        }
      }
    }
  },
  preview: {
    port: 3000,
    host: true
  }
});
