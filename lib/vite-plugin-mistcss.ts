import { Plugin } from "vite";
import { parse } from "mistcss/lib/parser";
import { render as renderReact } from "mistcss/lib/renderers/react";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { globby } from "globby";
import { unlink } from "fs/promises";

type RenderFunction = typeof renderReact;
type Extension = ".tsx" | ".astro" | ".svelte";
type Target = "react" | "hono" | "astro" | "vue" | "svelte";

interface MistcssPluginOptions {
  target?: Target;
}

function getFileExtension(target: Target): Extension {
  if (target === "react" || target === "hono" || target === "vue") {
    return ".tsx";
  }
  return `.${target}`;
}

async function getRenderFunction(target: Target) {
  const rendererName = target === "hono" ? "react" : target;
  const renderer = await import(`mistcss/lib/renderers/${rendererName}.js`);

  const render = renderer.render as RenderFunction;

  if (target === "hono") {
    return (...args: Parameters<RenderFunction>) =>
      render(args[0], args[1], true);
  }

  return render;
}

function createFile(
  mistFilename: string,
  renderFunction: RenderFunction,
  outputExtension: Extension
) {
  try {
    const data = parse(readFileSync(mistFilename, "utf8"));
    const name = path.basename(mistFilename, ".mist.css");
    if (data[0]) {
      const result = renderFunction(name, data[0]);

      writeFileSync(mistFilename.replace(/\.css$/, outputExtension), result);
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(`Error ${mistFilename}: ${e.message}`);
    } else {
      console.error(`Error ${mistFilename}`);
      console.error(e);
    }
  }
}

async function removeFile(filename: string) {
  await unlink(filename).catch(() => false);
}

export default function mistcssPlugin({
  target = "react",
}: MistcssPluginOptions = {}): Plugin {
  let renderFunction: RenderFunction;
  let outputExtension: Extension;

  return {
    name: "vite-plugin-mistcss",

    async config() {
      renderFunction = await getRenderFunction(target);
      outputExtension = getFileExtension(target);
    },

    async buildStart() {
      // Build out files
      (await globby("**/*.mist.css")).forEach((mistFilename) =>
        createFile(mistFilename, renderFunction, outputExtension)
      );

      // Clean out files without a matching mist file
      (await globby(`**/*.mist${outputExtension}`)).forEach((componentFilename) => {
        const mistFilename = componentFilename.replace(
          new RegExp(`${outputExtension}$`),
          ".css"
        );
        if (!existsSync(mistFilename)) {
          removeFile(componentFilename);
        }
      });
    },

    watchChange(filename, change) {
      if (filename.endsWith(".mist.css")) {
        if (change.event === "update" || change.event === "create") {
          createFile(filename, renderFunction, outputExtension);
        }
        if (change.event === "delete") {
          removeFile(filename.replace(/\.css$/, outputExtension));
        }
      }
    },
  };
}
