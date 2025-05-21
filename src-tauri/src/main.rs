// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
fn main() {
    tracing_subscriber::fmt()
        .pretty() // Enables pretty printing of logs
        .with_max_level(tracing::Level::DEBUG)
        .with_target(true) // Optionally include the logging target
        .with_thread_names(true) // Optionally include thread names
        .with_line_number(true) // Optionally include line numbers
        .init();

    info!("Starting the App...");
    app_lib::run();
}
