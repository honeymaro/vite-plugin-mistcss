import { spawn, ChildProcess } from "child_process";
import { Plugin } from "vite";

interface MistcssPluginOptions {
  target?: "react" | "vue" | "astro" | "hono" | "svelte";
  directory?: string;
  watch?: boolean;
}

let mistcssProcess: ChildProcess | null = null;

function runMistcss({
  target = "react",
  directory = "src",
  watch = false,
}: MistcssPluginOptions): void {
  const args = [directory, "--target", target];
  if (watch) {
    args.unshift("--watch");
  }

  mistcssProcess = spawn("npx", ["mistcss", ...args], {
    stdio: "inherit",
    shell: true,
  });

  mistcssProcess.on("error", (err) => {
    console.error("Error running mistcss:", err);
  });

  mistcssProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`mistcss process exited with code ${code}`);
    }
  });
}

function stopMistcss() {
  if (mistcssProcess) {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", mistcssProcess.pid!.toString(), "/f", "/t"]);
    } else {
      mistcssProcess.kill("SIGTERM");
    }
    mistcssProcess = null;
    console.log("mistcss process stopped.");
  }
}

export default function mistcssPlugin(
  options: MistcssPluginOptions = {}
): Plugin {
  let isWatchMode = false;

  return {
    name: "vite-plugin-mistcss",

    config(_config, { command }) {
      isWatchMode = command === "serve";
    },

    buildStart() {
      runMistcss({ watch: isWatchMode, ...options });
    },

    closeBundle() {
      stopMistcss();
    },

    closeWatcher() {
      stopMistcss();
    },
  };
}
