use crate::models::{BackupInfo, ColumnDef, CreateWorkbookRequest, SheetData, WorkbookMetadata};
use calamine::{open_workbook_auto, Data, Reader};
use chrono::Utc;
use rust_xlsxwriter::{Format, Workbook};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

pub struct WorkbookEngine;

impl WorkbookEngine {
    pub fn create_default_workbook(req: &CreateWorkbookRequest) -> Result<WorkbookMetadata, String> {
        let path = Path::new(&req.file_path);
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
        }

        let mut workbook = Workbook::new();
        let header_format = Format::new().set_bold().set_background_color(0xE2E8F0);

        // 1. _AppConfig
        let app_config_sheet = workbook.add_worksheet();
        app_config_sheet.set_name("_AppConfig").map_err(|e| e.to_string())?;
        app_config_sheet.write_with_format(0, 0, "key", &header_format).map_err(|e| e.to_string())?;
        app_config_sheet.write_with_format(0, 1, "value", &header_format).map_err(|e| e.to_string())?;

        let tax_rate_str = req.config.default_tax_rate.to_string();
        let configs = vec![
            ("business_name", req.config.business_name.as_str()),
            ("business_type", req.config.business_type.as_str()),
            ("country", req.config.country.as_str()),
            ("currency", req.config.currency.as_str()),
            ("currency_symbol", req.config.currency_symbol.as_str()),
            ("tax_preference", req.config.tax_preference.as_str()),
            ("default_tax_rate", tax_rate_str.as_str()),
            ("date_format", req.config.date_format.as_str()),
            ("timezone", req.config.timezone.as_str()),
            ("schema_version", "1.0.0"),
            ("created_at", req.config.created_at.as_str()),
            ("updated_at", req.config.updated_at.as_str()),
        ];

        for (i, (k, v)) in configs.iter().enumerate() {
            let row = (i + 1) as u32;
            app_config_sheet.write(row, 0, *k).map_err(|e| e.to_string())?;
            app_config_sheet.write(row, 1, *v).map_err(|e| e.to_string())?;
        }

        // Standard business sheets
        let standard_sheets: Vec<(&str, Vec<&str>)> = vec![
            ("_Categories", vec!["category_id", "name", "description", "status", "created_at", "updated_at"]),
            ("_Products", vec!["product_id", "sku", "name", "category_id", "purchase_price", "selling_price", "gst_rate", "unit", "minimum_stock", "status", "created_at", "updated_at"]),
            ("_Inventory", vec!["inventory_id", "product_id", "quantity", "minimum_stock", "updated_at"]),
            ("_StockMovements", vec!["movement_id", "product_id", "type", "quantity", "reference_id", "notes", "created_at"]),
            ("_Customers", vec!["customer_id", "name", "phone", "email", "address", "gstin", "created_at", "updated_at"]),
            ("_Suppliers", vec!["supplier_id", "name", "phone", "email", "address", "gstin", "notes", "created_at"]),
            ("_Sales", vec!["sale_id", "customer_id", "sale_date", "subtotal", "discount", "tax", "total", "payment_method", "status", "created_at"]),
            ("_SaleItems", vec!["sale_item_id", "sale_id", "product_id", "quantity", "unit_price", "discount", "tax", "line_total"]),
            ("_GST", vec!["gst_id", "name", "rate", "cgst_rate", "sgst_rate", "igst_rate", "status"]),
            ("_Expenses", vec!["expense_id", "date", "category", "description", "amount", "gst", "payment_method", "notes"]),
            ("_DashboardConfig", vec!["widget_id", "type", "title", "x", "y", "w", "h", "config_json"]),
            ("_SavedViews", vec!["view_id", "table_name", "view_name", "columns_json", "filter_json", "sort_json"]),
            ("_CustomTables", vec!["table_id", "name", "display_name", "icon", "columns_def_json", "pinned_to_sidebar"]),
        ];

        for (sheet_name, headers) in standard_sheets {
            let sheet = workbook.add_worksheet();
            sheet.set_name(sheet_name).map_err(|e| e.to_string())?;
            for (col_idx, header) in headers.iter().enumerate() {
                sheet.write_with_format(0, col_idx as u16, *header, &header_format).map_err(|e| e.to_string())?;
            }
        }

        // Sample GST slabs
        let gst_sheet = workbook.worksheet_from_name("_GST").map_err(|e| e.to_string())?;
        let sample_taxes = vec![
            ("gst_0", "GST 0%", 0.0, 0.0, 0.0, 0.0, "active"),
            ("gst_5", "GST 5%", 5.0, 2.5, 2.5, 5.0, "active"),
            ("gst_12", "GST 12%", 12.0, 6.0, 6.0, 12.0, "active"),
            ("gst_18", "GST 18%", 18.0, 9.0, 9.0, 18.0, "active"),
            ("gst_28", "GST 28%", 28.0, 14.0, 14.0, 28.0, "active"),
        ];
        for (idx, (id, name, rate, cgst, sgst, igst, status)) in sample_taxes.iter().enumerate() {
            let row = (idx + 1) as u32;
            gst_sheet.write(row, 0, *id).map_err(|e| e.to_string())?;
            gst_sheet.write(row, 1, *name).map_err(|e| e.to_string())?;
            gst_sheet.write(row, 2, *rate).map_err(|e| e.to_string())?;
            gst_sheet.write(row, 3, *cgst).map_err(|e| e.to_string())?;
            gst_sheet.write(row, 4, *sgst).map_err(|e| e.to_string())?;
            gst_sheet.write(row, 5, *igst).map_err(|e| e.to_string())?;
            gst_sheet.write(row, 6, *status).map_err(|e| e.to_string())?;
        }

        workbook.save(&req.file_path).map_err(|e| e.to_string())?;
        Self::get_metadata(&req.file_path)
    }

    pub fn get_metadata(file_path: &str) -> Result<WorkbookMetadata, String> {
        let path = Path::new(file_path);
        let metadata = fs::metadata(path).map_err(|e| format!("Failed to read file metadata: {}", e))?;
        let last_modified = metadata
            .modified()
            .map(|t| chrono::DateTime::<Utc>::from(t).to_rfc3339())
            .unwrap_or_else(|_| Utc::now().to_rfc3339());

        let reader = open_workbook_auto(path).map_err(|e| format!("Failed to open excel: {}", e))?;
        let sheet_names = reader.sheet_names();

        Ok(WorkbookMetadata {
            file_path: file_path.to_string(),
            file_name: path.file_name().and_then(|n| n.to_str()).unwrap_or("workbook.xlsx").to_string(),
            file_size: metadata.len(),
            last_modified,
            sheet_names,
        })
    }

    pub fn read_workbook(file_path: &str) -> Result<(WorkbookMetadata, Vec<SheetData>), String> {
        let meta = Self::get_metadata(file_path)?;
        let mut reader = open_workbook_auto(file_path).map_err(|e| format!("Failed to open excel: {}", e))?;
        let sheet_names = reader.sheet_names();

        let mut sheets = Vec::new();

        for name in sheet_names {
            if let Ok(range) = reader.worksheet_range(&name) {
                let mut columns: Vec<ColumnDef> = Vec::new();
                let mut rows: Vec<HashMap<String, serde_json::Value>> = Vec::new();

                let mut row_iter = range.rows();
                if let Some(header_row) = row_iter.next() {
                    let mut col_keys = Vec::new();
                    for (i, cell) in header_row.iter().enumerate() {
                        let header_str = match cell {
                            Data::String(s) => s.trim().to_string(),
                            Data::Int(n) => n.to_string(),
                            Data::Float(f) => f.to_string(),
                            _ => format!("column_{}", i + 1),
                        };
                        if !header_str.is_empty() {
                            col_keys.push(header_str.clone());
                            columns.push(ColumnDef {
                                key: header_str.clone(),
                                name: header_str,
                                data_type: "text".to_string(),
                                required: false,
                                default_value: None,
                                options: None,
                                reference_table: None,
                                reference_key: None,
                            });
                        }
                    }

                    for data_row in row_iter {
                        let mut row_map = HashMap::new();
                        let mut has_data = false;

                        for (idx, key) in col_keys.iter().enumerate() {
                            if let Some(cell) = data_row.get(idx) {
                                let val = match cell {
                                    Data::Empty => serde_json::Value::Null,
                                    Data::String(s) => {
                                        if !s.is_empty() {
                                            has_data = true;
                                        }
                                        serde_json::Value::String(s.clone())
                                    }
                                    Data::Float(f) => {
                                        has_data = true;
                                        serde_json::Number::from_f64(*f)
                                            .map(serde_json::Value::Number)
                                            .unwrap_or(serde_json::Value::Null)
                                    }
                                    Data::Int(n) => {
                                        has_data = true;
                                        serde_json::Value::Number((*n).into())
                                    }
                                    Data::Bool(b) => {
                                        has_data = true;
                                        serde_json::Value::Bool(*b)
                                    }
                                    Data::DateTime(dt) => {
                                        has_data = true;
                                        serde_json::Value::String(dt.to_string())
                                    }
                                    Data::DateTimeIso(s) => {
                                        has_data = true;
                                        serde_json::Value::String(s.clone())
                                    }
                                    Data::DurationIso(s) => {
                                        has_data = true;
                                        serde_json::Value::String(s.clone())
                                    }
                                    Data::Error(_) => serde_json::Value::Null,
                                };
                                row_map.insert(key.clone(), val);
                            }
                        }

                        if has_data {
                            rows.push(row_map);
                        }
                    }
                }

                sheets.push(SheetData {
                    name: name.clone(),
                    columns,
                    rows,
                });
            }
        }

        Ok((meta, sheets))
    }

    pub fn save_workbook(file_path: &str, sheets: &[SheetData]) -> Result<WorkbookMetadata, String> {
        let mut workbook = Workbook::new();
        let header_format = Format::new().set_bold().set_background_color(0xF1F5F9);

        for sheet_data in sheets {
            let sheet = workbook.add_worksheet();
            sheet.set_name(&sheet_data.name).map_err(|e| e.to_string())?;

            for (col_idx, col) in sheet_data.columns.iter().enumerate() {
                sheet
                    .write_with_format(0, col_idx as u16, &col.key, &header_format)
                    .map_err(|e| e.to_string())?;
            }

            for (row_idx, row) in sheet_data.rows.iter().enumerate() {
                let row_num = (row_idx + 1) as u32;
                for (col_idx, col) in sheet_data.columns.iter().enumerate() {
                    if let Some(val) = row.get(&col.key) {
                        match val {
                            serde_json::Value::Null => {}
                            serde_json::Value::Bool(b) => {
                                sheet.write(row_num, col_idx as u16, *b).map_err(|e| e.to_string())?;
                            }
                            serde_json::Value::Number(n) => {
                                if let Some(f) = n.as_f64() {
                                    sheet.write(row_num, col_idx as u16, f).map_err(|e| e.to_string())?;
                                }
                            }
                            serde_json::Value::String(s) => {
                                sheet.write(row_num, col_idx as u16, s.as_str()).map_err(|e| e.to_string())?;
                            }
                            _ => {
                                let str_val = val.to_string();
                                sheet.write(row_num, col_idx as u16, str_val.as_str()).map_err(|e| e.to_string())?;
                            }
                        }
                    }
                }
            }
        }

        workbook.save(file_path).map_err(|e| e.to_string())?;
        Self::get_metadata(file_path)
    }

    pub fn create_backup(file_path: &str) -> Result<BackupInfo, String> {
        let orig_path = Path::new(file_path);
        if !orig_path.exists() {
            return Err("Original workbook file does not exist".to_string());
        }

        let parent = orig_path.parent().unwrap_or_else(|| Path::new("."));
        let stem = orig_path.file_stem().and_then(|s| s.to_str()).unwrap_or("business");
        let timestamp = Utc::now().format("%Y-%m-%d-%H%M%S").to_string();
        let backup_name = format!("{}.backup-{}.xlsx", stem, timestamp);
        let backup_path: PathBuf = parent.join(&backup_name);

        fs::copy(orig_path, &backup_path).map_err(|e| format!("Failed to copy file for backup: {}", e))?;

        let meta = fs::metadata(&backup_path).map_err(|e| e.to_string())?;

        Ok(BackupInfo {
            path: backup_path.to_string_lossy().to_string(),
            filename: backup_name,
            timestamp: Utc::now().to_rfc3339(),
            size_bytes: meta.len(),
        })
    }

    pub fn list_backups(file_path: &str) -> Result<Vec<BackupInfo>, String> {
        let orig_path = Path::new(file_path);
        let parent = orig_path.parent().unwrap_or_else(|| Path::new("."));
        let stem = orig_path.file_stem().and_then(|s| s.to_str()).unwrap_or("business");
        let prefix = format!("{}.backup-", stem);

        let mut backups = Vec::new();
        if let Ok(entries) = fs::read_dir(parent) {
            for entry in entries.flatten() {
                let name = entry.file_name().to_string_lossy().to_string();
                if name.starts_with(&prefix) && name.ends_with(".xlsx") {
                    if let Ok(meta) = entry.metadata() {
                        let mod_time = meta
                            .modified()
                            .map(|t| chrono::DateTime::<Utc>::from(t).to_rfc3339())
                            .unwrap_or_else(|_| Utc::now().to_rfc3339());
                        backups.push(BackupInfo {
                            path: entry.path().to_string_lossy().to_string(),
                            filename: name,
                            timestamp: mod_time,
                            size_bytes: meta.len(),
                        });
                    }
                }
            }
        }

        backups.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        Ok(backups)
    }

    pub fn restore_backup(file_path: &str, backup_path: &str) -> Result<WorkbookMetadata, String> {
        let b_path = Path::new(backup_path);
        if !b_path.exists() {
            return Err("Backup file does not exist".to_string());
        }

        fs::copy(b_path, file_path).map_err(|e| format!("Failed to restore backup: {}", e))?;
        Self::get_metadata(file_path)
    }
}
