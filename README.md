# vite-plugin-mistcss

A Vite plugin to seamlessly integrate [MistCSS](https://github.com/typicode/mistcss) into your project.

> **Note**: Both `vite-plugin-mistcss` and MistCSS are under active development, and breaking changes may occur. Please stay updated with the latest releases and consider pinning versions in your project to avoid unexpected issues.

## Installation

Install the plugin using npm:

```bash
npm install --save-dev vite-plugin-mistcss mistcss
```

Or, if you use Yarn:

```bash
yarn add --dev vite-plugin-mistcss mistcss
```

> **Compatibility**: If you're using MistCSS version 0.5.6 or lower, please install `vite-plugin-mistcss@<1.0.0`.

## Usage

To add the plugin to your Vite configuration, update your `vite.config.ts` file as follows:

```typescript
import { defineConfig } from "vite";
import mistcssPlugin from "vite-plugin-mistcss";

export default defineConfig({
  plugins: [
    mistcssPlugin({
      cleanBeforeStart: true,
      keepUnused: false,
    }),
  ],
});
```

> **Note**: There's no need to configure `mistcss` in `postcss.config.js` or other files.

## Options

- **`cleanBeforeStart`** (default: `false`): Deletes all `mist.d.ts` files before starting the build process.
- **`keepUnused`** (default: `false`): Retains unused `mist.d.ts` files.

## FAQ

### Can MistCSS be used without this plugin?

Yes, MistCSS can be used independently. However, this plugin offers a streamlined integration with Vite, automatically generating `mist.d.ts` files for each CSS file and removing them if they’re not used. Additionally, it allows MistCSS to be used alongside other CSS transformers in Vite.

## Build

To build the project, run:

```bash
npm run build
```

Or, if using Yarn:

```bash
yarn build
```

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

## Contributing

We welcome contributions! Feel free to open an issue or submit a pull request.

## Acknowledgements

Special thanks to [@typicode](https://github.com/typicode/mistcss) and the Vite team for their incredible work.
