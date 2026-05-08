#!/usr/bin/env node

import { appendFileSync } from "node:fs";
import semanticRelease from "semantic-release";

const result = await semanticRelease({
  ci: true
});

const released = Boolean(result && result.nextRelease);
const version = released ? result.nextRelease.version : "";
const gitTag = released ? result.nextRelease.gitTag : "";

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `released=${released}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `git_tag=${gitTag}\n`);
}

if (released) {
  console.log(`Published release ${gitTag}`);
} else {
  console.log("No release published for this commit range.");
}
