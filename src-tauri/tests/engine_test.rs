#[cfg(test)]
mod tests {
    use exdrow_lib::models::{AppConfig, CreateWorkbookRequest};
    use exdrow_lib::workbook::WorkbookEngine;
    use std::fs;

    #[test]
    fn test_create_and_read_workbook() {
        let temp_dir = std::env::temp_dir();
        let file_path = temp_dir.join("test_exdrow_business.xlsx").to_string_lossy().to_string();

        let req = CreateWorkbookRequest {
            file_path: file_path.clone(),
            config: AppConfig::default(),
        };

        // 1. Create default workbook
        let meta = WorkbookEngine::create_default_workbook(&req).expect("Failed to create workbook");
        assert_eq!(meta.file_name, "test_exdrow_business.xlsx");
        assert!(meta.sheet_names.contains(&"_Products".to_string()));
        assert!(meta.sheet_names.contains(&"_Sales".to_string()));
        assert!(meta.sheet_names.contains(&"_GST".to_string()));

        // 2. Read workbook back
        let (read_meta, sheets) = WorkbookEngine::read_workbook(&file_path).expect("Failed to read workbook");
        assert_eq!(read_meta.file_name, "test_exdrow_business.xlsx");
        assert!(!sheets.is_empty());

        let gst_sheet = sheets.iter().find(|s| s.name == "_GST");
        assert!(gst_sheet.is_some());
        assert!(!gst_sheet.unwrap().rows.is_empty());

        // Clean up
        let _ = fs::remove_file(file_path);
    }
}
