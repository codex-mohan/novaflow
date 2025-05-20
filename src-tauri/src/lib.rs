// declare reference to modules
mod commands;
mod cuda_setup;
mod db;
mod server;
mod utils;

use std::sync::Mutex;
use tauri::async_runtime::spawn;
use tauri::{AppHandle, Manager, State};
use tracing::info;

use cuda_setup::run_cuda_setup;
use utils::start_resource_monitor;

// Create a struct we'll use to track the completion of
// setup related tasks
struct SetupState {
    frontend_task: bool,
    cuda_task: bool,
}

// Our main entrypoint in a version 2 mobile compatible app
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Don't write code before Tauri starts, write it in the
    // setup hook instead!
    tauri::Builder::default()
        // Register a `State` to be managed by Tauri
        // We need write access to it so we wrap it in a `Mutex`
        .manage(Mutex::new(SetupState {
            frontend_task: false,
            cuda_task: false,
        }))
        // Add the plugins we want to use
        .plugin(tauri_plugin_fs::init())
        // Add a command we can use to check
        .invoke_handler(tauri::generate_handler![
            greet,
            set_complete,
            commands::open_file,
            commands::signup_user,
            commands::login_user,
        ])
        // Use the setup hook to execute setup related tasks
        // Runs before the main loop, so no windows are yet created
        .setup(|app| {
            // Spawn both setup tasks
            spawn(cuda_setup(app.handle().clone()));
            spawn(start_resource_monitor(app.handle().clone()));
            // The hook expects an Ok result
            Ok(())
        })
        // Run the app
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: String) -> String {
    format!("Hello {name} from Rust!")
}

// A custom task for setting the state of a setup task
#[tauri::command]
async fn set_complete(
    app: AppHandle,
    state: State<'_, Mutex<SetupState>>,
    task: String,
) -> Result<(), ()> {
    // Lock the state without write access
    let mut state_lock = state.lock().unwrap();
    match task.as_str() {
        "frontend" => state_lock.frontend_task = true,
        "cuda" => state_lock.cuda_task = true,
        _ => panic!("invalid task completed!"),
    }
    // Check if all tasks are completed
    if state_lock.frontend_task && state_lock.cuda_task {
        // Setup is complete, we can close the splashscreen
        // and unhide the main window!
        info!("All tasks completed!");
        let splash_window = app.get_webview_window("splashscreen").unwrap();
        let main_window = app.get_webview_window("main").unwrap();
        splash_window.close().unwrap();
        main_window.show().unwrap();
    }
    Ok(())
}

// Add a new async function for CUDA setup
async fn cuda_setup(app: AppHandle) -> Result<(), ()> {
    info!("Starting CUDA setup...");

    // Run the CUDA setup and await its completion
    run_cuda_setup().await;

    info!("CUDA setup completed!");

    // Set the CUDA task as completed
    set_complete(
        app.clone(),
        app.state::<Mutex<SetupState>>(),
        "cuda".to_string(),
    )
    .await?;

    Ok(())
}
