# [1.0.0-beta.20](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.19...v1.0.0-beta.20) (2026-05-09)


### Features

* expose app version in health endpoint and navbar ([f467baf](https://github.com/Omar-Abduh/isle/commit/f467bafcb4b55f16507eb2728de0391872a796a6))

# [1.0.0-beta.19](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.18...v1.0.0-beta.19) (2026-05-09)


### Bug Fixes

* recalculate streak on uncheck instead of leaving it stale ([7df89f5](https://github.com/Omar-Abduh/isle/commit/7df89f53adb42b0b9cbc413e6f1a0969e71aa778))

# [1.0.0-beta.18](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.17...v1.0.0-beta.18) (2026-05-09)


### Features

* invalidate queries on app visibility change for cross-client sync ([77bb6fa](https://github.com/Omar-Abduh/isle/commit/77bb6fa55c735992e1b90f95ccbc809c6a81bd5c))
* invalidate queries on visibility change for cross-client sync (web) ([d336b9d](https://github.com/Omar-Abduh/isle/commit/d336b9d4ae727dc4eeea87ffda8dfa5c353c47a8))

# [1.0.0-beta.17](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.16...v1.0.0-beta.17) (2026-05-09)


### Bug Fixes

* resolve desktop navigation and check/uncheck refresh issues ([cd21993](https://github.com/Omar-Abduh/isle/commit/cd21993c52f006b5943203d1d4ef86c40c398738))

# [1.0.0-beta.16](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.15...v1.0.0-beta.16) (2026-05-09)


### Bug Fixes

* add vercel.json rewrite rule for SPA routing ([29a22c1](https://github.com/Omar-Abduh/isle/commit/29a22c1dc23750149042906e246f49e6c0b37982))

# [1.0.0-beta.15](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2026-05-09)


### Bug Fixes

* **ci:** add visible OAuth error alert and fetch timeout ([c7bcc16](https://github.com/Omar-Abduh/isle/commit/c7bcc1649d7d1a7f7ce81a34b1193a9f2a3bf1fc))

# [1.0.0-beta.14](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2026-05-09)


### Bug Fixes

* update build config for Google OAuth and release pipeline ([1f51d02](https://github.com/Omar-Abduh/isle/commit/1f51d02f283183b548f12a0094320bbcec1486e0))

# [1.0.0-beta.13](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2026-05-09)


### Bug Fixes

* **ci:** pass VITE env vars to Tauri build step so frontend gets Google Client ID ([9ea97e6](https://github.com/Omar-Abduh/isle/commit/9ea97e6425e090febae56c7321f71ab95ea440fd))
* **ci:** use platform-specific upload steps for release assets ([da59916](https://github.com/Omar-Abduh/isle/commit/da59916986fb38d7b98c0ebcaa30783c60ba4d62))

# [1.0.0-beta.12](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2026-05-09)


### Bug Fixes

* **ci:** ad-hoc sign macOS dmg to fix Gatekeeper damaged app error ([fd05666](https://github.com/Omar-Abduh/isle/commit/fd05666504cc35f53c863a748a8ca811d6c0808c))
* force clean rebuild with new web client id ([47b8829](https://github.com/Omar-Abduh/isle/commit/47b88290c155e553693d0fda2a0a2a5a8dc9d797))

# [1.0.0-beta.11](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2026-05-09)


### Bug Fixes

* **ci:** use find for cross-platform glob in release upload ([54f2644](https://github.com/Omar-Abduh/isle/commit/54f26449b4d5abeca06bcdcba49cdd99f0533fd1))

# [1.0.0-beta.10](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2026-05-09)


### Bug Fixes

* **auth:** resolve redirect_uri_mismatch and Gatekeeper dmg issues ([70ab1d1](https://github.com/Omar-Abduh/isle/commit/70ab1d108689064014605e633a4f1a7e2cbe5ceb))

# [1.0.0-beta.9](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2026-05-09)


### Bug Fixes

* remove pnpm-workspace.yaml from apps/web to avoid workspace mode in CI ([662c8a3](https://github.com/Omar-Abduh/isle/commit/662c8a36a1850fd784084bd7f5eddaaa2f04906c))
* remove pnpm-workspace.yaml from apps/web to avoid workspace mode in CI ([53616c3](https://github.com/Omar-Abduh/isle/commit/53616c34fb3862d9a8e69dd703c5030c6aa56c1c))

# [1.0.0-beta.8](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2026-05-09)


### Bug Fixes

* add local OAuth callback server for Tauri dev mode ([f3f0768](https://github.com/Omar-Abduh/isle/commit/f3f076826f0c22885f69894877ca439dc706f139))

# [1.0.0-beta.7](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2026-05-09)


### Bug Fixes

* force clean rebuild with new web client id ([c918374](https://github.com/Omar-Abduh/isle/commit/c918374f25dc372b496d5028c1a8da98bc34acd3))

# [1.0.0-beta.6](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2026-05-09)


### Bug Fixes

* gracefully handle deep-link registration error on launch ([3255bab](https://github.com/Omar-Abduh/isle/commit/3255baba19c2379cb90ac25595caa73b8928d59d))
* move esbuild approval to package.json to avoid pnpm workspace mode ([8de713a](https://github.com/Omar-Abduh/isle/commit/8de713ac846e3007a26529a0500dee6b7cf4f700))

# [1.0.0-beta.5](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2026-05-09)


### Bug Fixes

* trigger rebuild to bake in corrected oauth uri ([fead8e5](https://github.com/Omar-Abduh/isle/commit/fead8e51cee733677d96018c05f60ace1575ef0a))

# [1.0.0-beta.4](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2026-05-08)


### Bug Fixes

* serve success.html from spring boot static resources ([#7](https://github.com/Omar-Abduh/isle/issues/7)) ([8484b65](https://github.com/Omar-Abduh/isle/commit/8484b6564192c0dd26d3174aef901bd45dcb21d9))

# [1.0.0-beta.3](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2026-05-08)


### Bug Fixes

* add missing conventional commits parser for semantic release ([452b5b5](https://github.com/Omar-Abduh/isle/commit/452b5b51de10384e70834584507a171906fee182))
* set permissions for generated JWT keys in CI workflow ([5d39247](https://github.com/Omar-Abduh/isle/commit/5d392473d94aa945fe02655f5f3e1199b25832ac))
* switch windows bundler to nsis to support semver pre-releases ([16dc29b](https://github.com/Omar-Abduh/isle/commit/16dc29b4f1c23b916f6ebe7ba168e1d1b9736339))
* update smoke test to install curl if missing and enhance health check response validation ([858db4a](https://github.com/Omar-Abduh/isle/commit/858db4a521bd64d0b5fd6c59bc4a128f84b82db3))


### Features

* Implement habit tracking features with recurrence and streak calculations ([274b6f7](https://github.com/Omar-Abduh/isle/commit/274b6f77c0600581eb7b88bde34c06f1c655a9ed))

# [1.0.0-beta.2](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2026-05-08)


### Bug Fixes

* add frontend build step to tauri release matrix ([d3eed0d](https://github.com/Omar-Abduh/isle/commit/d3eed0d6945e2b88a9d9ed0f9b565c0bc2268cef))

# [1.0.0-beta.1](https://github.com/Omar-Abduh/isle/compare/v1.0.0-beta.1) (2026-05-08)


### Bug Fixes

* add missing conventional commits parser for semantic release ([#6](https://github.com/Omar-Abduh/isle/issues/6)) ([53f440c](https://github.com/Omar-Abduh/isle/commit/53f440c995e67e736d778ad04f733a932ebf209b))
