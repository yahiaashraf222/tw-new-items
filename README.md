# new items



This starter kit provides a foundation for building custom Twilight components for Salla's e-commerce platform. It includes a pre-configured build setup and development environment to help you get started quickly.

## Getting Started

1. Clone this repository
2. Remove the example components in `src/components/` using:
   ```
   tw-delete-component
   ```
3. Create your own components using the component generator:
   ```
   tw-create-component <component-name>
   ```
4. Run `pnpm install` to install dependencies
5. Run `pnpm run dev` to start the development server
6. Run `pnpm run build` to build your components for production

## Component Conventions

Components follow [Salla Twilight components overview](https://docs.salla.dev/doc-422580):

- **Strict typing**: Each component has a TypeScript interface for its config; the `data` property is typed (e.g. `LandingProductGalleryConfig`).
- **Default values**: Every non-required property has a default so the component works without form-builder data. Required fields are only those marked `required: true` in `twilight-bundle.json`.
- **Independent & reusable**: Components are self-contained and receive config via the `data` object from the Salla form builder.

## Project Structure

```
src/
  components/
    your-component-name/
      index.ts        # Main component file
      styles.ts       # Component styles (optional)
      types.ts        # Component types (optional)
```

## Built-in Plugins

This starter kit includes three Vite plugins that handle the build process:

### 1. Transform Plugin (`sallaTransformPlugin`)
- Transforms component files to ensure proper naming and registration
- Matches components in `src/components/*/index.ts`
- To disable: Remove from `vite.config.ts` plugins array

### 2. Build Plugin (`sallaBuildPlugin`)
- Handles component bundling and output
- Creates individual files for each component in `dist/`
- Configures external dependencies (lit libraries)
- To customize: Remove from plugins array and configure your own build settings:
  ```typescript
  {
    build: {
      lib: {
        entry: {/* your entries */},
        formats: ['es'],
        fileName: (format, entryName) => `${entryName}.js`
      },
      rollupOptions: {
        external: [/^lit/],
        output: {/* your output config */}
      }
    }
  }
  ```

### 3. Demo Plugin (`sallaDemoPlugin`)
- Provides a development environment for testing components
- Creates a demo page with your components
- Configures hot module reloading
- To disable: Remove from plugins array and set up your own dev server

### Demo Plugin Options

The `sallaDemoPlugin` accepts the following configuration options:

```typescript
{
  // Optional: Show only specific components
  components?: string[];

  // Optional: Customize the demo grid layout
  grid?: {
    // CSS grid-template-columns value
    columns?: string;     // default: 'repeat(auto-fill, minmax(300px, 1fr))'
    
    // Gap between components
    gap?: string;        // default: '1rem'
    
    // Responsive breakpoint
    minWidth?: string;   // default: '300px'
  };

  // Optional: Add custom CSS
  css?: string;

  // Optional: Add custom JavaScript
  js?: string;
}
```

#### Example Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    // ... other plugins
    sallaDemoPlugin({
      // Show only specific components
      components: ['product-card', 'scroll-top'],
      
      // Customize grid layout
      grid: {
        columns: 'repeat(3, 1fr)',
        gap: '1.5rem',
        minWidth: '768px'
      },

      // Add custom styles
      css: `
        .component-card {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .component-card:hover {
          transform: translateY(-2px);
        }
      `,

      // Add custom JavaScript
      js: `
        console.log('Demo page loaded!');
        // Add your custom JavaScript here
      `
    })
  ]
});
```

## Component Management

### Creating New Components

This starter kit includes a component generator to help you create new components quickly. To use it, run:

```bash
pnpm tw-create-component <component-name>
```

Or run without arguments for interactive mode:

```bash
pnpm tw-create-component
```

The generator will:
1. Prompt you for a component name (in kebab-case format)
2. Validate that the name is in kebab-case and doesn't already exist
3. Create a new component folder with an `index.ts` file
4. Add the component definition to `twilight-bundle.json`

### Deleting Components

To remove a component, use:

```bash
pnpm tw-delete-component <component-name>
```

Or run without arguments to see a list of available components:

```bash
pnpm tw-delete-component
```

This will:
1. Show a list of available components to select from
2. Ask for confirmation before deletion
3. Remove the component folder from `src/components/`
4. Remove the component definition from `twilight-bundle.json`

## Component Requirements

Each component should:
1. Be a class that extends `LitElement`
2. Export the class as default
3. Be placed in its own directory under `src/components/`
4. Have an `index.ts` as the entry point

Example:
```typescript
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export default class MyComponent extends LitElement {
  @property({ type: Object })
  config?: {
    name: string;
    //... other properties
  };

  static styles = css`/* your styles */`;

  render() {
    return html`<div>Hello ${this.config?.name || 'World'}!</div>`;
  }
}
```

## Building for Production

Run `pnpm run build` to create production-ready bundles in the `dist/` directory. Each component will have its own file named after the component (e.g., `landing-product-gallery.js`).

## Using on Salla

The built bundle is ready to use on a real Salla store. Demo-only behavior (form-builder-mock stubs, proxy, import map) lives only in the dev server (`vite.config.ts`) and is not included in `dist/` — production uses Salla’s real APIs and form builder.

**To use directly on Salla:**

1. **Build:** Run `pnpm run build`. Output is in `dist/` (one `.js` per component plus shared `fallback-data-*.js`).
2. **Upload the bundle:** Use [Salla Partners](https://salla.partners) (or your theme/app flow) to upload or register this bundle so the store can load it. You need to host the JS (e.g. CDN) and provide the bundle URL, or upload via the Partners portal if your workflow uses it.
3. **Register in the theme:** Ensure the theme loads your bundle script (e.g. `twilight-bundle.json` and the `dist/` JS URL are registered as a custom bundle). The store’s Twilight engine provides `lit`; your components register as `salla-landing-product-gallery`, `salla-landing-price-block`, etc.
4. **Use in the store:** In the page/landing builder, add the “new items” components and configure them (images, product ID for add-to-cart, videos, etc.). On a **product page**, leave **Product ID** empty in the Add to Cart component so Salla uses the current product.

**Components included:** Landing Product Gallery, Price Block, Store Features, Product Description, Perfume Ingredients, Add to Cart (wraps Salla’s native add product), Expert Section, Video Section.

## Development

Run `pnpm run dev` to start the development server. This will:
1. Create a demo page with all your components
2. Enable hot module reloading
3. Provide a development environment for testing

## License

MIT
