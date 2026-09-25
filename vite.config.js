import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { createSeoMetadata, injectSeoMetadata } from './middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseOrigin = env.VITE_SUPABASE_URL ? new URL(env.VITE_SUPABASE_URL).origin : undefined;
  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const localSeoMiddleware = {
    name: 'local-seo-metadata',
    configureServer(server) {
      const handler = async (request, response, next) => {
        const pathname = new URL(request.url, `https://${request.headers.host}`).pathname;
        if (request.method !== 'GET' || pathname.startsWith('/@') || pathname.startsWith('/api/') || /\.[a-z0-9]+$/i.test(pathname)) return next();
        try {
          const url = new URL(request.url, `https://${request.headers.host}`);
          const metadata = await createSeoMetadata(url, env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY);
          const shell = await server.transformIndexHtml(pathname, readFileSync(path.resolve(__dirname, 'index.html'), 'utf8'));
          response.statusCode = 200;
          response.setHeader('content-type', 'text/html; charset=utf-8');
          response.end(injectSeoMetadata(shell, metadata));
        } catch (error) { next(error); }
      };
      return () => server.middlewares.stack.unshift({ route: '', handle: handler });
    },
  };

  return {
    plugins: [
      localSeoMiddleware,
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: false,
        injectRegister: false,
        includeAssets: ['images/favicon.ico', 'images/apple-icon-180x180.png'],
        workbox: {
          runtimeCaching: supabaseOrigin
            ? [{ urlPattern: new RegExp(`^${escapeRegExp(supabaseOrigin)}/`), handler: 'NetworkOnly' }]
            : [],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      allowedHosts: ["underground014.local"],
    },
  };
});
