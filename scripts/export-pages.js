import { cp, mkdir, rm, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const projectRoot = process.cwd();
const outDir = join(projectRoot, "out");
const buildHtml = join(projectRoot, ".next", "server", "app", "index.html");
const notFoundHtml = join(projectRoot, ".next", "server", "pages", "404.html");
const staticDir = join(projectRoot, ".next", "static");
const outStaticDir = join(outDir, "_next", "static");

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function copyStaticAssets() {
  await mkdir(outStaticDir, { recursive: true });
  await cp(join(staticDir, "chunks"), join(outStaticDir, "chunks"), { recursive: true });
  await cp(join(staticDir, "media"), join(outStaticDir, "media"), { recursive: true });
}

async function writeRootFavicon() {
  if (!(await exists(join(outStaticDir, "media")))) return;
  const files = await readdir(join(outStaticDir, "media"));
  const favicon = files.find((name) => name.endsWith(".ico"));
  if (!favicon) return;
  await cp(
    join(outStaticDir, "media", favicon),
    join(outDir, "favicon.ico")
  );
}

async function main() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  if (!(await exists(buildHtml))) {
    throw new Error("Build output not found: .next/server/app/index.html");
  }

  await cp(buildHtml, join(outDir, "index.html"));
  if (await exists(notFoundHtml)) {
    await cp(notFoundHtml, join(outDir, "404.html"));
  }

  await copyStaticAssets();
  await writeRootFavicon();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
