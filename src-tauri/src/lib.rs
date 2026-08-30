pub mod commands;
pub mod models;
pub mod workbook;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            workbook_create,
            workbook_open,
            workbook_save,
            workbook_backup,
            workbook_restore,
            workbook_list_backups,
            workbook_check_modified,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
