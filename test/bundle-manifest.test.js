import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const packageJsonUrl = new URL("../package.json", import.meta.url);
const bundlePatchUrl = new URL("../cordis.patch.yml", import.meta.url);

test("declares an installable DeepSeek Harness bundle patch", async () => {
  const packageJson = JSON.parse(await readFile(packageJsonUrl, "utf8"));
  assert.equal(packageJson.dsh?.bundle?.patch, "./cordis.patch.yml");
  assert.ok(packageJson.files.includes("cordis.patch.yml"));

  const patch = await readFile(bundlePatchUrl, "utf8");
  assert.match(patch, /id: timeline-studio/);
  assert.match(patch, /name: dsh-timeline-studio-plugin/);
  assert.match(patch, /TIMELINE_STUDIO_ROOT/);
  assert.match(patch, /disabled:/);
});

