use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub business_name: String,
    pub business_type: String,
    pub country: String,
    pub currency: String,
    pub currency_symbol: String,
    pub tax_preference: String, // "inclusive" | "exclusive"
    pub default_tax_rate: f64,
    pub date_format: String,
    pub timezone: String,
    pub schema_version: String,
    pub created_at: String,
    pub updated_at: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            business_name: "My Business".to_string(),
            business_type: "Retail Store".to_string(),
            country: "India".to_string(),
            currency: "INR".to_string(),
            currency_symbol: "₹".to_string(),
            tax_preference: "exclusive".to_string(),
            default_tax_rate: 18.0,
            date_format: "YYYY-MM-DD".to_string(),
            timezone: "UTC".to_string(),
            schema_version: "1.0.0".to_string(),
            created_at: now.clone(),
            updated_at: now,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColumnDef {
    pub key: String,
    pub name: String,
    pub data_type: String, // "text" | "number" | "currency" | "date" | "boolean" | "select" | "reference"
    pub required: bool,
    pub default_value: Option<String>,
    pub options: Option<Vec<String>>,
    pub reference_table: Option<String>,
    pub reference_key: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SheetData {
    pub name: String,
    pub columns: Vec<ColumnDef>,
    pub rows: Vec<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardWidget {
    pub id: String,
    pub widget_type: String, // "kpi" | "chart" | "table" | "recent_sales" | "low_stock"
    pub title: String,
    pub w: u32,
    pub h: u32,
    pub x: u32,
    pub y: u32,
    pub config: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkbookMetadata {
    pub file_path: String,
    pub file_name: String,
    pub file_size: u64,
    pub last_modified: String,
    pub sheet_names: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateWorkbookRequest {
    pub file_path: String,
    pub config: AppConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SaveWorkbookRequest {
    pub file_path: String,
    pub sheets: Vec<SheetData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupInfo {
    pub path: String,
    pub filename: String,
    pub timestamp: String,
    pub size_bytes: u64,
}
