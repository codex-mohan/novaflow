use crate::utils::get_database_path;
use serde_json::json;
use std::result::Result::Ok;
use tauri::{AppHandle, Emitter, EventTarget};
use tauri_plugin_shell::ShellExt;
use tracing::{error, info};
use tokio::io::AsyncBufReadExt; // Import AsyncBufReadExt
use tokio::io::BufReader; // Import BufReader

#[tauri::command]
pub fn open_file(app: AppHandle, path: std::path::PathBuf) {
    app.emit_filter("open-file", path, |target| match target {
        EventTarget::WebviewWindow { label } => label == "main" || label == "file-viewer",
        _ => false,
    })
    .unwrap();
}

#[tauri::command]
pub fn start_surrealdb(app: AppHandle, db_path: String) {
    // Assuming surreal_db_password is defined elsewhere or passed in
    let surreal_db_password = "your_surreal_db_password"; // Replace with actual password source

    let (mut rx, mut child) = app
        .shell()
        .sidecar("surrealdb")
        .unwrap()
        .args([
            "start",
            "--bind",
            "127.0.0.1:8877",
            "--user",
            "root",
            "--pass",
            &surreal_db_password,
            "--auth",
            "--deny-guests",
            "--deny-scripting",
            "--deny-funcs",
            "\"http::*\"",
            "--no-banner",
            "--log",
            "debug",
            format!("file:{}", db_path).as_str(),
        ])
        .spawn()
        .expect("Failed to start surrealdb");

    // Spawn a task to read and log output from the surrealdb process
    tauri::async_runtime::spawn(async move {
        let stdout = child.stdout.take().expect("Failed to take stdout");
        let stderr = child.stderr.take().expect("Failed to take stderr");

        let mut stdout_reader = BufReader::new(stdout).lines();
        let mut stderr_reader = BufReader::new(stderr).lines();

        loop {
            tokio::select! {
                line = stdout_reader.next_line() => {
                    match line {
                        Ok(Some(line)) => info!("SurrealDB stdout: {}", line),
                        Ok(None) => break, // EOF
                        Err(e) => {
                            error!("Error reading SurrealDB stdout: {}", e);
                            break;
                        }
                    }
                }
                line = stderr_reader.next_line() => {
                     match line {
                        Ok(Some(line)) => error!("SurrealDB stderr: {}", line),
                        Ok(None) => break, // EOF
                        Err(e) => {
                            error!("Error reading SurrealDB stderr: {}", e);
                            break;
                        }
                    }
                }
                // Add a small delay to prevent tight loop if both streams are empty
                _ = tokio::time::sleep(tokio::time::Duration::from_millis(10)) => {}
            }
        }

        // Optionally wait for the child process to exit
        let _ = child.wait().await;
        info!("SurrealDB process exited.");
    });
}
