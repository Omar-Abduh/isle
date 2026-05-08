#!/usr/bin/env node

import { appendFileSync } from "node:fs";
import semanticRelease from "semantic-release";

const result = await semanticRelease({
  ci: true
});

const released = Boolean(result && result.nextRelease);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `released=${released}\n`);
}

if (released) {
  console.log(`Published release ${result.nextRelease.gitTag}`);
} else {
  console.log("No release published for this commit range.");
}
