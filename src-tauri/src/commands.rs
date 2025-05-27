use crate::utils::get_database_path;
use tauri::{AppHandle, Emitter, EventTarget};
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;
use tracing::{error, info}; // Import BufReader

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
        .sidecar("surreal")
        .unwrap()
        .args([
            "start",
            "--bind",
            "127.0.0.1:8877",
            "--user",
            "root",
            "--pass",
            &surreal_db_password,
            "--deny-guests",
            "--deny-scripting",
            "--deny-funcs",
            "--no-banner",
            "--log",
            "debug",
            format!("file:{}", db_path).as_str(),
        ])
        .spawn()
        .expect("Failed to start surrealdb");

    info!("SurrealDB started.");
    dbg!(
        "Spawned Tauri sidecar process `surreal` with PID: {}",
        child.pid()
    );

    tauri::async_runtime::spawn(async move {
        // read events such as stdout
        while let Some(event) = rx.recv().await {
            // Re-print the stdout. A good place to put the output to a dedicated output
            // file or something along those lines.
            if let CommandEvent::Stdout(line) = &event {
                println!(" ++-> surreal: {:?}", String::from_utf8(line.clone()));
            }

            // Print pring logs, errors, etc. from surreal to the console
            // A smarter solution would of course be to dump them into some dedicated
            // log file. This is the place to do it :)
            if let CommandEvent::Stderr(line) = &event {
                println!(" ++-> surreal: {:?}", String::from_utf8(line.clone()));
            }

            // React to the tasks' termination. In our case we can't live without the database.
            // The process panics and that's it. However this could also be used to set some
            // flag used to inform the frontend about the loss of connection and/or trying to
            // restart.
            // This will also capture a failed start (e.g. bad args)
            if let CommandEvent::Terminated(line) = &event {
                println!(" ++-> surreal: terminated.");

                // Set `panic = 'abort'` in your build profile to make the panic global
                // If set to unwind it will simply terminate the async task but not the entire application.
                //
                // Still looking for a solution that will work with the `unwind` setting.
                //
                // Relevant resources:
                // * https://users.rust-lang.org/t/panic-in-tokio-task-does-not-end-the-program-execution/45731/6
                // * https://doc.rust-lang.org/book/ch09-01-unrecoverable-errors-with-panic.html

                panic!("Surreal went away :'(");
            }
        }
    });
}
