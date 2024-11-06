import { Plugin } from "vite";
// @ts-expect-error mistcss has no type definition
import mistcss from "mistcss";
import { readFile, unlink } from "fs/promises";
import path from "path";
import postcss, { Processor } from "postcss";
import { glob } from "tinyglobby";
import { existsSync } from "fs";

async function removeFileIfExists(filename: string) {
  await unlink(filename).catch(() => false);
}

const windowsSlashRE = /\\/g;
function slash(p: string): string {
  return p.replace(windowsSlashRE, "/");
}

const isMistCSSFilename = (id: string) => path.basename(id) === "mist.css";

interface MistCSSPluginOptions {
  cleanBeforeStart?: boolean;
  keepUnused?: boolean;
}

export default function mistcssPlugin(options?: MistCSSPluginOptions): Plugin {
  let processor: Processor | undefined = undefined;
  let timerId: ReturnType<typeof setTimeout> | undefined = undefined;
  const warmupList: string[] = [];

  const runMistCSS = async (filename: string) => {
    if (!processor) {
      return;
    }
    try {
      const code = await readFile(filename);
      processor.process(code, { from: filename }).catch(console.log);
    } catch {
      // ignore
    }
  };

  return {
    name: "vite-plugin-mistcss",
    configResolved(config) {
      const resolve = (p: string) => path.resolve(config.root, p);
      const options = config.build;
      const libOptions = options.lib;
      const input = libOptions
        ? options.rollupOptions?.input ||
          (typeof libOptions.entry === "string"
            ? resolve(libOptions.entry)
            : Array.isArray(libOptions.entry)
            ? libOptions.entry.map(resolve)
            : Object.fromEntries(
                Object.entries(libOptions.entry).map(([alias, file]) => [
                  alias,
                  resolve(file),
                ])
              ))
        : typeof options.ssr === "string"
        ? resolve(options.ssr)
        : options.rollupOptions?.input || resolve("index.html");
      const inputs =
        typeof input === "string"
          ? [input]
          : Array.isArray(input)
          ? input
          : Object.values(input);

      inputs.forEach((input) => {
        warmupList.push(input);
      });
    },

    configureServer(server) {
      warmupList.forEach((filename) => {
        if (filename.endsWith(".html")) {
          readFile(filename, "utf-8").then((html) => {
            server.transformIndexHtml(filename, html).catch(() => false);
          });
          return;
        }
        server.warmupRequest(filename).catch(() => false);
      });
      const serverWatchHandler = (filename: string) => {
        if (filename.endsWith(".d.ts")) {
          return;
        }
        if (server.moduleGraph.getModuleById(slash(filename))?.file) {
          server.warmupRequest(filename).catch(() => false);
        }
        if (timerId) {
          clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
          server.moduleGraph.idToModuleMap.forEach((moduleNode) => {
            if (moduleNode.file && isMistCSSFilename(moduleNode.file)) {
              if (moduleNode.importers.size === 0) {
                if (!options?.keepUnused) {
                  removeFileIfExists(
                    moduleNode.file.replace(/\.css$/, ".d.ts")
                  );
                }
                return;
              }
              runMistCSS(moduleNode.file);
            }
          });
        }, 100);
      };
      server.watcher.on("change", serverWatchHandler);
      server.watcher.on("add", serverWatchHandler);
    },

    load(id) {
      if (isMistCSSFilename(id)) {
        runMistCSS(id);
      }
    },

    async buildStart() {
      if (!mistcss.postcss) {
        console.warn(
          "The installed version of mistcss does not support. Please upgrade to mistcss@1.0.0 or later or use the previous version of this plugin."
        );
        return;
      }
      processor = postcss([mistcss()]);
      const filenames = await glob("**/mist.d.ts", {
        ignore: ["node_modules"],
      });
      filenames.forEach((filename) => {
        if (
          options?.cleanBeforeStart ||
          (!options?.keepUnused &&
            !existsSync(filename.replace(/\.d\.ts$/, ".css")))
        ) {
          removeFileIfExists(filename);
        }
      });
    },

    watchChange(filename, change) {
      if (path.basename(filename) === "mist.css") {
        if (change.event === "delete") {
          removeFileIfExists(filename.replace(/\.css$/, ".d.ts"));
        }
      }
    },
  };
}
