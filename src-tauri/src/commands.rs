use crate::{db::user_db, utils::get_database_path};
use serde_json::Value;
use std::result::Result::Ok;
use tauri::{async_runtime::JoinHandle, AppHandle, Emitter, EventTarget};
use tracing::info;

use crate::db::user_db::UserDatabase;

#[tauri::command]
pub fn open_file(app: AppHandle, path: std::path::PathBuf) {
    app.emit_filter("open-file", path, |target| match target {
        EventTarget::WebviewWindow { label } => label == "main" || label == "file-viewer",
        _ => false,
    })
    .unwrap();
}

#[tauri::command(rename_all = "snake_case")]
pub async fn signup_user(
    first_name: String,
    last_name: String,
    username: String,
    password: String,
    email: String,
) -> Result<Result<(), surrealdb::Error>, String> {
    info!("Signing up user...");

    let database_path = get_database_path("db").display().to_string();

    let joint_result: JoinHandle<Result<(), surrealdb::Error>> =
        tauri::async_runtime::spawn(async move {
            // Initialize the UserDatabase
            let user_db = UserDatabase::new(&database_path).await?;

            user_db.initialize().await?;

            // Call `create_user` method
            user_db
                .create_user(first_name, last_name, username, password, email)
                .await
        });

    // Await the result
    match joint_result.await {
        Ok(result) => {
            info!("User created successfully:");
            Ok(result)
        }
        Err(e) => Err(format!("Error creating user: {:?}", e)),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn login_user(username: String, password: String) -> Result<serde_json::Value, String> {
    info!("Logging in user...");

    let database_path = get_database_path("db").display().to_string();

    let joint_result: JoinHandle<Result<serde_json::Value, String>> =
        tauri::async_runtime::spawn(async move {
            // Initialize the UserDatabase
            let user_db = UserDatabase::new(&database_path)
                .await
                .map_err(|e| format!("Failed to initialize database: {:?}", e))?;
            let _ = user_db.initialize().await;
            // Attempt authentication
            user_db
                .auth_db(&username, &password)
                .await
                .map_err(|e| format!("Authentication failed: {:?}", e))
        });

    // Await and handle the result
    match joint_result.await {
        Ok(result) => {
            match result {
                Ok(value) => {
                    info!("Login successful: {:?}", value); // Use {:?} to print debug information
                    Ok(value)
                }
                Err(err) => {
                    info!("Login failed: {:?}", err); // Log the error
                    Err(format!("Login failed: {:?}", err))
                }
            }
        }
        Err(e) => Err(format!("Error logging in: {:?}", e)),
    }
}
