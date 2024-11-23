pub mod llms;

use std::path::PathBuf;

pub fn get_database_path(db_name: &str) -> PathBuf {
    // let app_dir = BaseDirectory::AppData.variable();
    let mut path = PathBuf::from("~/novaflow/db/");
    path.push(db_name);
    path
}

use base64::engine::general_purpose::STANDARD;
use base64::Engine as _; // For the encode method
use image::{DynamicImage, ImageFormat};
use reqwest::Client;
use std::error::Error;
use std::io::Cursor;
use std::path::Path;

// Define an enum for input types
pub enum ImageInput<'a> {
    Path(&'a str),
    Url(&'a str),
    Buffer(&'a [u8]),
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
