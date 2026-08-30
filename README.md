# Exdrow — Local-First Business Operations Desktop App

> **Run your entire business from one workspace — powered by your existing Excel spreadsheet data.**

Exdrow is a modern, cross-platform desktop application that turns **one user-owned `.xlsx` workbook into a complete business operating system**.

---

## Key Features

- ⚡ **Local First**: Completely private and offline. No cloud account, no hosted database, no telemetry. Your business data stays strictly on your computer.
- 📊 **One Active Workbook**: All business modules (`_Products`, `_Categories`, `_Inventory`, `_Customers`, `_Suppliers`, `_Sales`, `_SaleItems`, `_GST`, `_Expenses`) are persisted in a single `.xlsx` file that remains 100% compatible with Microsoft Excel and Numbers.
- 🛒 **Dedicated Point of Sale (POS)**: Fast checkout workflow, customer selection, live stock indicators, automated GST/tax calculation, discounts, and printable receipts.
- 📦 **Inventory & Stock Movements**: Real-time stock counts, low-stock warnings, and complete audit history (Stock In, Stock Out, Adjustments).
- 📈 **Interactive Dashboards & Apache ECharts**: Live KPI cards, sales revenue trends, product category breakdowns, and an in-app Chart Builder for custom metrics.
- 📑 **Custom Tables & Dynamic Columns**: Add custom sheets directly to the workbook and pin them to your sidebar navigation.
- 🖨️ **Reports & CSV/Excel Export**: Build custom statements, filter records, compute column totals, and print or export data anytime.
- 🛡️ **Safety & Backups**: Automated snapshots, manual backups (`.backup-YYYY-MM-DD-HHmmss.xlsx`), and external Excel change conflict alerts.
- ⌨️ **Command Palette**: Press `Cmd+K` anywhere for instant fuzzy search, quick actions, and fast navigation.

---

## Tech Stack

- **Desktop Framework**: Tauri 2.x (macOS, Windows, Linux)
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **State Management**: Zustand
- **Visualizations**: Apache ECharts
- **Native Layer**: Rust (calamine + rust_xlsxwriter)
- **Testing**: Vitest & Cargo test

---

## Getting Started

### Development Mode

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run local development:
   ```bash
   npm run dev
   ```
   Open `http://localhost:1420` to test in the browser.

3. Run native desktop app:
   ```bash
   npm run tauri dev
   ```

### Building for Production

```bash
npm run tauri build
```
Creates distributable `.dmg` or `.app` on macOS.

---

## Documentation

- [ARCHITECTURE.md](file:///Users/bhavesh/Developer/exdrow/ARCHITECTURE.md): System architecture and data flow.
- [WORKBOOK_FORMAT.md](file:///Users/bhavesh/Developer/exdrow/WORKBOOK_FORMAT.md): Detailed Excel sheet schemas and specifications.
- [DEVELOPMENT.md](file:///Users/bhavesh/Developer/exdrow/DEVELOPMENT.md): Developer guide, testing, and compilation.
# solostack
