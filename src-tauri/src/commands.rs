use crate::models::{BackupInfo, CreateWorkbookRequest, SaveWorkbookRequest, SheetData, WorkbookMetadata};
use crate::workbook::WorkbookEngine;
use std::path::Path;

#[tauri::command]
pub fn workbook_create(req: CreateWorkbookRequest) -> Result<WorkbookMetadata, String> {
    WorkbookEngine::create_default_workbook(&req)
}

#[tauri::command]
pub fn workbook_open(file_path: String) -> Result<(WorkbookMetadata, Vec<SheetData>), String> {
    WorkbookEngine::read_workbook(&file_path)
}

#[tauri::command]
pub fn workbook_save(req: SaveWorkbookRequest) -> Result<WorkbookMetadata, String> {
    WorkbookEngine::save_workbook(&req.file_path, &req.sheets)
}

#[tauri::command]
pub fn workbook_backup(file_path: String) -> Result<BackupInfo, String> {
    WorkbookEngine::create_backup(&file_path)
}

#[tauri::command]
pub fn workbook_restore(file_path: String, backup_path: String) -> Result<WorkbookMetadata, String> {
    WorkbookEngine::restore_backup(&file_path, &backup_path)
}

#[tauri::command]
pub fn workbook_list_backups(file_path: String) -> Result<Vec<BackupInfo>, String> {
    WorkbookEngine::list_backups(&file_path)
}

#[tauri::command]
pub fn workbook_check_modified(file_path: String, known_last_modified: String) -> Result<bool, String> {
    let path = Path::new(&file_path);
    if !path.exists() {
        return Ok(false);
    }
    let metadata = match std::fs::metadata(path) {
        Ok(m) => m,
        Err(_) => return Ok(false),
    };
    if let Ok(mod_time) = metadata.modified() {
        let current_rfc = chrono::DateTime::<chrono::Utc>::from(mod_time).to_rfc3339();
        Ok(current_rfc != known_last_modified)
    } else {
        Ok(false)
    }
}
