/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://www.kolzchut.org.il',
        changeOrigin: true,
        secure: false, 
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          (proxy as any).on('proxyReq', (proxyReq: any, req: any, _res: any) => {
            // 1. Explicitly set the Host
            proxyReq.setHeader('Host', 'www.kolzchut.org.il');

            // 2. REMOVE the browser headers instead of spoofing them. 
            // Postman doesn't send these, which is why it bypasses the firewall.
            proxyReq.removeHeader('Origin');
            proxyReq.removeHeader('Referer');
            
            // 3. Strip the CORS/Fetch metadata headers
            proxyReq.removeHeader('sec-fetch-dest');
            proxyReq.removeHeader('sec-fetch-mode');
            proxyReq.removeHeader('sec-fetch-site');
            proxyReq.removeHeader('sec-ch-ua');
            proxyReq.removeHeader('sec-ch-ua-mobile');
            proxyReq.removeHeader('sec-ch-ua-platform');

            // 4. Mimic Postman's User-Agent exactly, since we know their server allows it
            proxyReq.setHeader('User-Agent', 'PostmanRuntime/7.36.1');
            proxyReq.setHeader('Accept', '*/*');
          });
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true
  }
})
