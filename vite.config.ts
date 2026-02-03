import { defineConfig } from 'vite';
import {
  sallaBuildPlugin,
  sallaDemoPlugin,
  sallaTransformPlugin,
} from '@salla.sa/twilight-bundles/vite-plugins';

/** Injects import map so CDN twilight-bundles.js can resolve bare "lit" specifier */
function litImportMapPlugin() {
  return {
    name: 'lit-import-map',
    transformIndexHtml(html: string) {
      const importMap = `
<script type="importmap">
{
  "imports": {
    "lit": "https://esm.sh/lit@3",
    "lit/": "https://esm.sh/lit@3/"
  }
}
</script>`;
      return html.replace(/<head>/i, `<head>${importMap}`);
    },
  };
}

export default defineConfig({
  plugins: [
    litImportMapPlugin(),
    sallaTransformPlugin(),
    sallaBuildPlugin(),
    sallaDemoPlugin({
      grid: {
        columns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
        minWidth: '300px',
      },
    }),
  ],
});
