// declare reference to modules
mod commands;
mod cuda_setup;
mod db;
mod server;
mod utils;

use axum;
use server::handlers;
use std::net::SocketAddr;
use std::sync::Mutex;
use tauri::async_runtime::spawn;
use tauri::{AppHandle, Manager, State};
use tokio::time::{sleep, Duration};

use cuda_setup::run_cuda_setup;

// Create a struct we'll use to track the completion of
// setup related tasks
struct SetupState {
    frontend_task: bool,
    backend_task: bool,
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
            backend_task: false,
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
            commands::login_user
        ])
        // Use the setup hook to execute setup related tasks
        // Runs before the main loop, so no windows are yet created
        .setup(|app| {
            // Spawn both setup tasks
            spawn(setup_backend(app.handle().clone()));
            spawn(cuda_setup(app.handle().clone()));
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
        "backend" => state_lock.backend_task = true,
        "cuda" => state_lock.cuda_task = true,
        _ => panic!("invalid task completed!"),
    }
    // Check if all tasks are completed
    if state_lock.backend_task && state_lock.cuda_task {
        // Setup is complete, we can close the splashscreen
        // and unhide the main window!
        println!("All tasks completed!");
        let splash_window = app.get_webview_window("splashscreen").unwrap();
        let main_window = app.get_webview_window("main").unwrap();
        splash_window.close().unwrap();
        main_window.show().unwrap();
    }
    Ok(())
}

// An async function that does some heavy setup task
async fn setup_backend(app: AppHandle) -> Result<(), ()> {
    // Setup the actual backend and fake loading for  3 seconds
    tauri::async_runtime::spawn(async move {
        let app = server::routes::all_routes()
            .await
            .fallback(handlers::not_found::not_found_handler);

        // Start the Axum server
        let addr = SocketAddr::from(([127, 0, 0, 1], 8920));
        println!("Axum server listening on {}", addr);
        let listener = tokio::net::TcpListener::bind("0.0.0.0:8920").await.unwrap();
        axum::serve(listener, app).await.unwrap();
        println!("Axom Server started");
    });
    println!("sleeping for 8 seconds");
    sleep(Duration::from_secs(8)).await;
    println!("Backend setup task completed!");
    set_complete(
        app.clone(),
        app.state::<Mutex<SetupState>>(),
        "backend".to_string(),
    )
    .await?;
    Ok(())
}

// Add a new async function for CUDA setup
async fn cuda_setup(app: AppHandle) -> Result<(), ()> {
    println!("Starting CUDA setup...");

    // Run the CUDA setup and await its completion
    run_cuda_setup().await;

    println!("CUDA setup completed!");

    // Set the CUDA task as completed
    set_complete(
        app.clone(),
        app.state::<Mutex<SetupState>>(),
        "cuda".to_string(),
    )
    .await?;

    Ok(())
}
