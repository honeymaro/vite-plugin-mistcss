# vite-plugin-mistcss

A Vite plugin to seamlessly integrate MistCSS into your project.

## Installation

Install the plugin using npm:

```bash
npm install --save-dev vite-plugin-mistcss
```

Or, if you use Yarn:

```bash
yarn add --dev vite-plugin-mistcss
```

## Usage

Add the plugin to your `vite.config.ts` file:

```typescript
import { defineConfig } from "vite";
import mistcssPlugin from "vite-plugin-mistcss";

export default defineConfig({
  plugins: [
    mistcssPlugin({
      target: "react", // Available options: 'react', 'vue', 'astro', 'hono', 'svelte'
    }),
  ],
});
```

## Options

- **`target`** (default: `react`): The target framework. Available options: `react`, `vue`, `astro`, `hono`, `svelte`.

## Build

To build the project, run:

```bash
npm run build
```

Or if using Yarn:

```bash
yarn build
```

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

## Contributing

We welcome contributions! Feel free to open an issue or submit a pull request.

## Acknowledgements

Special thanks to the Vite and MistCSS teams for their amazing work.
