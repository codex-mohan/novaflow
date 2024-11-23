use crate::{db::user_db, utils::get_database_path};
use candle_core::cpu;
use serde_json::{json, Value};
use std::result::Result::Ok;
use std::thread;
use std::time::Duration;
use sysinfo::{Cpu, System};
use tauri::{async_runtime::JoinHandle, AppHandle, Emitter, EventTarget};
use tracing::{error, info};

use crate::db::user_db::{User, UserDatabase};

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
) -> Result<(), String> {
    info!("Signing up user...");
    let database_path = get_database_path("db").display().to_string();
    // Ensure the database is initialized
    if let Err(e) = UserDatabase::initialize(&database_path).await {
        error!("Failed to initialize database: {:?}", e);
        return Err(format!("Database initialization failed: {:?}", e));
    }

    info!("Database initialized successfully");

    // Spawn an asynchronous task for user creation
    let joint_result = tauri::async_runtime::spawn(async move {
        UserDatabase::create_user(first_name, last_name, username, password, email).await
    });

    info!("User creation started");

    // Await the result
    match joint_result.await {
        Ok(result) => match result {
            Ok(_) => {
                info!("User created successfully");
                Ok(())
            }
            Err(e) => {
                error!("Failed creating user: {:?}", e);
                Err(format!("Failed creating user: {:?}", e))
            }
        },
        Err(e) => {
            error!("Error creating user: {:?}", e);
            Err(format!("Error creating user: {:?}", e))
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn login_user(username: String, password: String) -> Result<serde_json::Value, String> {
    info!("Logging in user...");

    // Ensure the database is initialized
    let database_path = get_database_path("db").display().to_string();
    if let Err(e) = UserDatabase::initialize(&database_path).await {
        error!("Failed to initialize database: {:?}", e);
        return Err(format!("Database initialization failed: {:?}", e));
    }

    // Spawn an asynchronous task for user login
    let joint_result = tauri::async_runtime::spawn(async move {
        UserDatabase::verify_password(&username, &password).await
    });

    // Await and handle the result
    match joint_result.await {
        Ok(result) => match result {
            Ok(Some(user)) => {
                info!("Login successful for user");

                // Convert user details into JSON
                Ok(json!(user))
            }
            Ok(None) => {
                info!("Authentication failed for user");
                Err("Invalid credentials".to_string())
            }
            Err(err) => {
                error!("Authentication error: {:?}", err);
                Err(format!("Authentication error: {:?}", err))
            }
        },
        Err(e) => {
            error!("Task error: {:?}", e);
            Err(format!("Error logging in: {:?}", e))
        }
    }
}

#[tauri::command]
pub fn get_system_stats() -> (f32, f32, f32, f32) {
    let mut sys = System::new_all();
    sys.refresh_all();

    sys.refresh_cpu_usage();
    // CPU Usage (average across all cores)
    let cpu_usage =
        sys.cpus().iter().map(|cpu| cpu.cpu_usage()).sum::<f32>() / sys.cpus().len() as f32;

    // println!("CPU Usage: {}", cpu_usage);

    // Memory Usage
    let total_memory = sys.total_memory() as f32;
    let used_memory = (sys.total_memory() - sys.available_memory()) as f32;
    let memory_usage = (used_memory / total_memory) * 100.0;

    // GPU Info (example using nvidia-smi, you'll need to add nvidia-smi crate)
    // For this example, returning placeholder values
    let gpu_usage = 0.0;
    let vram_usage = 0.0;

    (cpu_usage, memory_usage, gpu_usage, vram_usage)
}
