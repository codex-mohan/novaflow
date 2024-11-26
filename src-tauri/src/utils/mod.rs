pub mod llms;

use base64::engine::general_purpose::STANDARD;
use base64::Engine as _; // For the encode method
use image::{DynamicImage, ImageFormat};
use reqwest::Client;
use serde::Deserialize;
use std::error::Error;
use std::io::Cursor;
use std::path::Path;
use std::path::PathBuf;
use sysinfo::System;
use sysinfo::{CpuRefreshKind, RefreshKind};
use tauri::{AppHandle, Emitter};
use tokio::time::sleep;

// Define an enum for input types
pub enum ImageInput<'a> {
    Path(&'a str),
    Url(&'a str),
    Buffer(&'a [u8]),
}

pub fn get_database_path(db_name: &str) -> PathBuf {
    // let app_dir = BaseDirectory::AppData.variable();
    let mut path = PathBuf::from("~/novaflow/db/");
    path.push(db_name);
    path
}

// Main function to process the image and return Base64
pub async fn get_base64_image(input: ImageInput<'_>) -> Result<String, Box<dyn Error>> {
    let image: DynamicImage = match input {
        ImageInput::Path(path) => {
            // Load image from file path
            image::open(Path::new(path))?
        }
        ImageInput::Url(url) => {
            // Fetch image from URL and load
            let client = Client::new();
            let response = client.get(url).send().await?.bytes().await?;
            image::load_from_memory(&response)?
        }
        ImageInput::Buffer(buffer) => {
            // Load image from in-memory buffer
            image::load_from_memory(buffer)?
        }
    };

    // Convert image to PNG format and encode as Base64
    let mut png_buffer = Vec::new();
    let mut cursor = Cursor::new(&mut png_buffer); // Use Cursor to wrap the Vec<u8>
    image.write_to(&mut cursor, ImageFormat::Png)?; // Write to the cursor
    let base64_encoded = STANDARD.encode(&png_buffer);

    // Return Base64-encoded string with MIME type
    Ok(format!("data:image/png;base64,{}", base64_encoded))
}

#[derive(serde::Serialize, Deserialize, Clone)]
struct statsPayload {
    cpu: f32,
    ram: f32,
    vram: f32,
}

pub async fn start_resource_monitor(app: AppHandle) {
    // Spawn a background task to monitor system resources
    tauri::async_runtime::spawn(async move {
        loop {
            // Get system stats
            let stats = get_system_stats();

            // Emit the stats to the frontend
            app.emit("resource-stats", stats).unwrap();

            // Wait for a specified duration before the next update
            sleep(std::time::Duration::from_secs(2)).await; // Using Tokio's sleep
        }
    });
}

pub fn get_system_stats() -> statsPayload {
    let mut sys = System::new_all();
    sys.refresh_all();

    let mut s =
        System::new_with_specifics(RefreshKind::new().with_cpu(CpuRefreshKind::everything()));

    // Wait a bit because CPU usage is based on diff.
    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
    // Refresh CPUs again to get actual value.
    sys.refresh_cpu_all();

    // CPU Usage (average across all cores)
    let cpu_usage =
        sys.cpus().iter().map(|cpu| cpu.cpu_usage()).sum::<f32>() / sys.cpus().len() as f32;

    // Memory Usage
    let total_memory = sys.total_memory() as f32;
    let used_memory = (sys.total_memory() - sys.available_memory()) as f32;
    let memory_usage = (used_memory / total_memory) * 100.0;

    // GPU Info (example using nvidia-smi, you'll need to add nvidia-smi crate)
    // For this example, returning placeholder values
    let gpu_usage = 0.0;
    let vram_usage = 0.0;

    statsPayload {
        cpu: cpu_usage,
        ram: memory_usage,
        vram: vram_usage,
    }
}
