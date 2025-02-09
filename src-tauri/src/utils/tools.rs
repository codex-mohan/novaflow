use async_trait::async_trait;
use serde_json::Value;
use std::error::Error;

use langchain_rust::tools::Tool;

pub struct GetDateAndTime {}

#[async_trait]
impl Tool for GetDateAndTime {
    fn name(&self) -> String {
        "Date".to_string()
    }

    fn description(&self) -> String {
        "This tool is used to fetch current date and time in 12-hour format. use it when user asks for current date or time ".to_string()
    }

    async fn run(&self, _input: Value) -> Result<String, Box<dyn Error>> {
        Ok(chrono::Local::now()
            .format("%Y-%m-%d %I:%M:%S %p")
            .to_string())
    }
}

pub struct OCRTool {}

#[async_trait]
impl Tool for OCRTool {
    fn name(&self) -> String {
        "OCR".to_string()
    }

    fn description(&self) -> String {
        "This tool is used to extract text from images".to_string()
    }

    async fn run(&self, _input: Value) -> Result<String, Box<dyn Error>> {
        Ok("OCR".to_string())
    }
}
