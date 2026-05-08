#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const nextVersion = process.argv[2];

if (!nextVersion) {
  console.error("Missing next version argument.");
  process.exit(1);
}

const rootDir = process.cwd();
const normalizedVersion = nextVersion.startsWith("v") ? nextVersion.slice(1) : nextVersion;

const desktopPackagePath = path.join(rootDir, "apps/desktop/package.json");
const desktopPackage = JSON.parse(readFileSync(desktopPackagePath, "utf8"));
desktopPackage.version = normalizedVersion;
writeFileSync(desktopPackagePath, `${JSON.stringify(desktopPackage, null, 2)}\n`, "utf8");

const tauriConfigPath = path.join(rootDir, "apps/desktop/src-tauri/tauri.conf.json");
const tauriConfig = JSON.parse(readFileSync(tauriConfigPath, "utf8"));
tauriConfig.version = normalizedVersion;
writeFileSync(tauriConfigPath, `${JSON.stringify(tauriConfig, null, 2)}\n`, "utf8");

const rootPackagePath = path.join(rootDir, "package.json");
const rootPackage = JSON.parse(readFileSync(rootPackagePath, "utf8"));
rootPackage.version = normalizedVersion;
writeFileSync(rootPackagePath, `${JSON.stringify(rootPackage, null, 2)}\n`, "utf8");

execSync(`mvn -q versions:set -DnewVersion=${normalizedVersion} -DgenerateBackupPoms=false`, {
  cwd: path.join(rootDir, "services/api"),
  stdio: "inherit"
});

console.log(`Synchronized project versions to ${normalizedVersion}`);
