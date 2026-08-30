# Exdrow Development Guide

## Prerequisites

- **Node.js**: >= 18 LTS
- **Rust Toolchain**: Stable (`rustc` & `cargo` installed via `rustup`)
- **Xcode Command Line Tools** (on macOS)

## Quick Start

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Run frontend in local browser development mode:
   ```bash
   npm run dev
   ```
   Open `http://localhost:1420` in your browser.
   The browser development environment automatically uses the isomorphic ExcelJS workbook engine for instantaneous preview and live testing.

3. Run in native desktop mode with Tauri:
   ```bash
   npm run tauri dev
   ```

4. Build production native package (macOS `.dmg` / `.app`):
   ```bash
   npm run tauri build
   ```

## Running Tests

- Run TypeScript & Vitest integration tests:
  ```bash
  npm test
  ```

- Run Rust engine unit tests:
  ```bash
  source "$HOME/.cargo/env" && cd src-tauri && cargo test
  ```

- Run TypeScript compiler checks:
  ```bash
  npx tsc --noEmit
  ```
