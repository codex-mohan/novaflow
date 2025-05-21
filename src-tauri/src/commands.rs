use crate::utils::get_database_path;
use serde_json::json;
use std::result::Result::Ok;
use tauri::{AppHandle, Emitter, EventTarget};
use tracing::{error, info};

#[tauri::command]
pub fn open_file(app: AppHandle, path: std::path::PathBuf) {
    app.emit_filter("open-file", path, |target| match target {
        EventTarget::WebviewWindow { label } => label == "main" || label == "file-viewer",
        _ => false,
    })
    .unwrap();
}
