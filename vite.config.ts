/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';

function loadLocalEnvFiles(rootDir: string) {
  for (const fileName of ['.env.local', '.env']) {
    const filePath = path.join(rootDir, fileName);
    if (!fs.existsSync(filePath)) continue;
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const API_ROUTE_MAP: Record<string, string> = {
  '/api/schemes': '/api/schemes/index.ts',
  '/api/auth/register': '/api/auth/register.ts',
  '/api/auth/login': '/api/auth/login.ts',
  '/api/auth/logout': '/api/auth/logout.ts',
  '/api/auth/me': '/api/auth/me.ts',
  '/api/profile/me': '/api/profile/me.ts',
  '/api/profile/extract': '/api/profile/extract.ts',
  '/api/explain': '/api/explain.ts',
  '/api/applications': '/api/applications/index.ts',
  '/api/notifications': '/api/notifications/index.ts',
  '/api/notifications/send-email': '/api/notifications/send-email.ts',
  '/api/notifications/cron': '/api/notifications/cron.ts',
  '/api/admin/schemes': '/api/admin/schemes.ts',
  '/api/community/proposals': '/api/community/proposals.ts',
  '/api/community/messages': '/api/community/messages.ts',
  '/api/locator/nearby': '/api/locator/nearby.ts',
  '/api/apisetu/pin-lookup': '/api/apisetu/pin-lookup.ts',
  '/api/apisetu/sandbox': '/api/apisetu/sandbox.ts',
};

function claimSaathiLocalApiPlugin(): Plugin {
  return {
    name: 'claimsaathi-local-api',
    configureServer(server) {
      loadLocalEnvFiles(__dirname);

      server.middlewares.use(async (req, res, next) => {
        const reqUrl = req.url || '';
        if (!reqUrl.startsWith('/api/')) return next();

        const parsedUrl = new URL(reqUrl, 'http://127.0.0.1');
        const cleanPath = parsedUrl.pathname.replace(/\/+$/, '');
        const modulePath = API_ROUTE_MAP[cleanPath];
        if (!modulePath) return next();

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          const rawBody = Buffer.concat(chunks).toString('utf8');
          let parsedBody: unknown = undefined;
          if (rawBody) {
            try {
              parsedBody = JSON.parse(rawBody);
            } catch {
              parsedBody = rawBody;
            }
          }

          const query: Record<string, string> = {};
          parsedUrl.searchParams.forEach((v, k) => {
            query[k] = v;
          });

          const mod = await server.ssrLoadModule(modulePath);
          const handler = mod.default;
          if (typeof handler !== 'function') return next();

          const wrappedRes = {
            setHeader: (name: string, value: string) => res.setHeader(name, value),
            status: (code: number) => {
              res.statusCode = code;
              return wrappedRes;
            },
            json: (payload: unknown) => {
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
              }
              res.end(JSON.stringify(payload));
            },
          };

          await handler(
            {
              method: req.method,
              headers: req.headers,
              body: parsedBody,
              query,
              socket: req.socket,
            },
            wrappedRes
          );
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(
            JSON.stringify({
              error: 'local_api_error',
              message: err instanceof Error ? err.message : 'Local API execution error',
            })
          );
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), claimSaathiLocalApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-tabs',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            'lucide-react',
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
});
