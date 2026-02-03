import { defineConfig } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import {
  sallaBuildPlugin,
  sallaDemoPlugin,
  sallaTransformPlugin,
} from '@salla.sa/twilight-bundles/vite-plugins';

// Import map MUST be the first script in <head> (before any module); per HTML spec.
const LIT_IMPORT_MAP =
  '<script type="importmap">\n' +
  '{"imports":{"lit":"https://esm.sh/lit@3?bundle","lit/":"https://esm.sh/lit@3/"}}\n' +
  '</script>';

const FORM_BUILDER_MOCK_REMOTE = 'https://salla.design/api/v1/form-builder-mock';
const FORM_BUILDER_MOCK_LOCAL = '/api/v1/form-builder-mock';

function rewriteFormBuilderMockUrl(html: string): string {
  return html.replace(
    new RegExp(FORM_BUILDER_MOCK_REMOTE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
    FORM_BUILDER_MOCK_LOCAL
  );
}

const UPLOADER_STUB_BODY = JSON.stringify({
  data: { url: 'https://cdn.salla.network/images/themes/default/placeholder.jpg' },
});

function litImportMapPlugin() {
  return {
    name: 'lit-import-map',
    enforce: 'post' as const,
    transformIndexHtml(html: string) {
      if (!html.includes('salla-demo-layout')) return html;
      let out = html;
      if (!out.includes('type="importmap"')) {
        out = out.replace(/<head(\s[^>]*)?>/, '<head$1>\n    ' + LIT_IMPORT_MAP);
      }
      if (out.includes(FORM_BUILDER_MOCK_REMOTE)) out = rewriteFormBuilderMockUrl(out);
      return out;
    },
    configureServer(server: any) {
      const injectLitMap = (req: any, res: any, next: () => void) => {
        const url = req.url?.split('?')[0] || '';
        if (!url.includes('.salla-temp')) return next();
        const tempPath = path.join(process.cwd(), 'node_modules', '.salla-temp', 'index.html');
        if (!fs.existsSync(tempPath)) return next();
        try {
          let html = fs.readFileSync(tempPath, 'utf-8');
          if (html.includes('salla-demo-layout')) {
            if (!html.includes('type="importmap"'))
              html = html.replace(/<head(\s[^>]*)?>/, '<head$1>\n    ' + LIT_IMPORT_MAP);
            if (html.includes(FORM_BUILDER_MOCK_REMOTE)) html = rewriteFormBuilderMockUrl(html);
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
            return;
          }
        } catch (_) {}
        next();
      };
      const uploaderStub = (req: any, res: any, next: () => void) => {
        const url = req.url?.split('?')[0] || '';
        if (req.method === 'POST' && url.includes('/api/v1/form-builder-mock/uploader')) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(UPLOADER_STUB_BODY);
          return;
        }
        next();
      };
      server.middlewares.stack.unshift({ route: '', handle: uploaderStub });
      server.middlewares.stack.unshift({ route: '', handle: injectLitMap });
    },
  };
}

export default defineConfig({
  plugins: [
    sallaTransformPlugin(),
    sallaBuildPlugin(),
    sallaDemoPlugin({
      grid: { columns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', minWidth: '300px' },
    }),
    litImportMapPlugin(),
  ],
  server: {
    proxy: {
      '^/api/v1/form-builder-mock': { target: 'https://salla.design', changeOrigin: true, secure: true },
    },
  },
});
