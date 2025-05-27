// declare reference to modules
mod commands;
mod cuda_setup;
mod utils;

use std::time::Duration;
use tauri::async_runtime::spawn;
use tauri::{AppHandle, Manager};
use tracing::info;

use cuda_setup::run_cuda_setup;
use utils::get_database_path; // Import get_database_path
                              // use utils::start_resource_monitor;

// Our main entrypoint in a version 2 mobile compatible app
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Don't write code before Tauri starts, write it in the
    // setup hook instead!
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        // Add the plugins we want to use
        .plugin(tauri_plugin_fs::init())
        // Add commands
        .invoke_handler(tauri::generate_handler![
            greet, // Keep the greet command
            commands::open_file,
            commands::start_surrealdb
        ])
        // Use the setup hook to execute setup related tasks
        // Runs before the main loop, so no windows are yet created
        .setup(|app| {
            // Keep setup hook synchronous
            let app_handle = app.handle().clone();
            // Spawn CUDA setup task (frontend doesn't need to wait for this)
            spawn(cuda_setup());
            // spawn(start_resource_monitor(app_handle.clone()));

            // Start SurrealDB during setup
            let db_path = get_database_path("novaflow.db"); // Get the database path
            commands::start_surrealdb(app_handle.clone(), db_path.to_string_lossy().into_owned()); // Call the command

            // Spawn a task to handle window switching after a delay
            spawn(async move {
                // Add a backend-side delay (e.g., 3 seconds)
                tokio::time::sleep(Duration::from_secs(3)).await;

                info!("Backend delay complete. Attempting to switch windows.");

                // Get window instances
                let splash_window = app_handle.get_webview_window("splashscreen");
                let main_window = app_handle.get_webview_window("main");

                if let Some(splash) = splash_window {
                    if let Some(main) = main_window {
                        info!(
                            "Splashscreen and main windows found. Closing splash and showing main."
                        );
                        // Close splash screen and show main window
                        let _ = splash.close();
                        let _ = main.show();
                    } else {
                        info!("Main window not found.");
                    }
                } else {
                    info!("Splashscreen window not found.");
                }
            });

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

// Add a new async function for CUDA setup
async fn cuda_setup() -> Result<(), ()> {
    info!("Starting CUDA setup...");

    // Run the CUDA setup and await its completion
    run_cuda_setup().await;

    info!("CUDA setup completed!");

    // The frontend does not need to be notified of CUDA completion for window switching

    Ok(())
}
