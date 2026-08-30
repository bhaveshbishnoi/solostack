# Exdrow Architecture Specification

## 1. System Overview

Exdrow is a local-first business operating system powered by a single user-owned `.xlsx` workbook.
There is **no hosted backend, no cloud database, and no mandatory authentication server**.

```
┌────────────────────────────────────────────────────────┐
│                      React 19 UI                       │
│  Topbar │ Sidebar │ Command Palette │ POS │ Analytics  │
└───────────────────────────┬────────────────────────────┘
                            │
                  Zustand State Stores
  (workbookStore, settingsStore, uiStore, tableStore)
                            │
               IWorkbookService Abstraction
                            │
         ┌──────────────────┴──────────────────┐
         ▼                                     ▼
Tauri IPC Commands Layer             Web/Dev Fallback Engine
(src-tauri / Rust)                   (ExcelJS in-memory)
         │                                     │
         ▼                                     ▼
Rust WorkbookEngine                  Browser Virtual Storage
(calamine + rust_xlsxwriter)
         │
         ▼
Single User-Owned .xlsx File
```

## 2. Workbook Persistence Model

- All business entities map 1:1 to worksheets within the active workbook:
  - `_AppConfig`: Business profile, currency, tax mode, schema version.
  - `_DashboardConfig`: Saved widget layouts and chart configurations.
  - `_Categories`: Product category hierarchy.
  - `_Products`: Product catalog, SKU, pricing, GST rates, stock thresholds.
  - `_Inventory`: Live stock levels, minimum reorder alerts.
  - `_StockMovements`: Audit trail for stock in, stock out, sales, adjustments.
  - `_Customers`: Customer contact details, addresses, GSTIN.
  - `_Suppliers`: Supplier directory and contact notes.
  - `_Sales`: Transaction records, subtotals, tax breakdown, grand totals.
  - `_SaleItems`: Line items associated with sales.
  - `_GST`: Configurable tax slabs (CGST, SGST, IGST).
  - `_Expenses`: Operating expense ledger with categories and payment methods.
  - `_CustomTables`: Metadata and column schemas for user-defined tables.
  - `_SavedViews`: Custom filters and column sorting configurations.

## 3. Transaction Integrity

When completing a point-of-sale transaction:
1. Validate stock availability in `_Inventory`.
2. Compute subtotals, discounts, and GST tax breakdowns.
3. Atomically append sale record to `_Sales` and line items to `_SaleItems`.
4. Decrement inventory quantities in `_Inventory`.
5. Append movement audit record to `_StockMovements`.
6. Debounce/persist workbook to `.xlsx` on disk.

## 4. Safety & Backups

- Automatic backups are generated with timestamped filenames (`filename.backup-YYYY-MM-DD-HHmmss.xlsx`).
- External file modifications (e.g. from Microsoft Excel) are detected to prevent silent overwrites.
