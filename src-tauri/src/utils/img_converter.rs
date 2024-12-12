use std::fs::File;
use std::path::Path;
use std::io::{BufReader, BufWriter};
use image::{ImageFormat, io::Reader as ImageReader};

/// Converts an image to PNG format and saves it to the specified output path.
/// 
/// # Arguments
/// 
/// * `input_path` - Path to the input image.
/// * `output_path` - Path to save the output PNG image.
/// 
/// # Returns
/// 
/// * `Result<(), String>` - Returns Ok(()) on success, or an error message on failure.
fn convert_to_png(input_path: &str, output_path: &str) -> Result<(), String> {
    // Open the input file with buffered I/O for efficiency
    let input_file = File::open(input_path)
        .map_err(|err| format!("Failed to open input file: {}", err))?;
    let reader = BufReader::new(input_file);

    // Read the image format directly from the input file
    let format = ImageReader::new(reader)
        .with_guessed_format()
        .map_err(|err| format!("Failed to guess image format: {}", err))?
        .format()
        .ok_or("Unsupported or unrecognized image format")?;

    // Reopen the input file for actual image decoding
    let input_file = File::open(input_path)
        .map_err(|err| format!("Failed to reopen input file: {}", err))?;
    let reader = BufReader::new(input_file);
    let image = ImageReader::with_format(reader, format)
        .decode()
        .map_err(|err| format!("Failed to decode image: {}", err))?;

    // Open the output file with buffered I/O for efficiency
    let output_file = File::create(output_path)
        .map_err(|err| format!("Failed to create output file: {}", err))?;
    let writer = BufWriter::new(output_file);

    // Write the image as PNG
    image
        .write_to(&mut std::io::BufWriter::new(writer), ImageFormat::Png)
        .map_err(|err| format!("Failed to write PNG: {}", err))?;

    Ok(())
}


/*usage
fn main() {
    // Collect command-line arguments
    let args: Vec<String> = std::env::args().collect();
    if args.len() != 3 {
        eprintln!("Usage: {} <input_image> <output_image>", args[0]);
        std::process::exit(1);
    }

    let input_path = &args[1];
    let output_path = &args[2];

    // Call the conversion function and handle errors
    match convert_to_png(input_path, output_path) {
        Ok(_) => println!("Image converted and saved to {}", output_path),
        Err(err) => {
            eprintln!("Error: {}", err);
            std::process::exit(1);
        }
    }
*}
*/
