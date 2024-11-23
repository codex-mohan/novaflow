use anyhow::Result;
use async_trait::async_trait;
use futures::stream::{self, Stream, StreamExt};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::pin::Pin;

// Enum for model providers
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ModelProvider {
    Local,
    Ollama,
    OpenAI,
    Groq,
}

// Message structure for LLM interactions
#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    pub role: String,
    pub content: String,
}

// Trait for LLM providers
#[async_trait]
pub trait LLMProvider {
    async fn generate_response(&self, messages: Vec<Message>) -> Result<String>;
    async fn generate_stream(
        &self,
        messages: Vec<Message>,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<String>> + Send>>>;
}

// Example implementation for Local provider
pub struct LocalProvider;

#[async_trait]
impl LLMProvider for LocalProvider {
    async fn generate_response(&self, messages: Vec<Message>) -> Result<String> {
        // Implement logic for generating a response using the Local provider
        Ok("Local response".to_string())
    }

    async fn generate_stream(
        &self,
        messages: Vec<Message>,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<String>> + Send>>> {
        // Implement logic for streaming responses using the Local provider
        Ok(Box::pin(stream::once(async {
            Ok("Local stream response".to_string())
        })))
    }
}

// Example implementation for Ollama provider
pub struct OllamaProvider {
    client: Client,
    api_url: String,
}

impl OllamaProvider {
    pub fn new(api_url: &str) -> Self {
        OllamaProvider {
            client: Client::new(),
            api_url: api_url.to_string(),
        }
    }
}

#[async_trait]
impl LLMProvider for OllamaProvider {
    async fn generate_response(&self, messages: Vec<Message>) -> Result<String> {
        // Implement logic for generating a response using the Ollama provider
        Ok("Ollama response".to_string())
    }

    async fn generate_stream(
        &self,
        messages: Vec<Message>,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<String>> + Send>>> {
        // Just a sample request body
        let request_body = serde_json::json!({
            "model": "phi3", // Specify the model you want to use
            "messages": messages,
        });

        let response = self
            .client
            .post(&self.api_url)
            .json(&request_body)
            .send()
            .await?;

        let bytes = response.bytes().await?; // Get the complete bytes
        let chunk_str = String::from_utf8_lossy(&bytes);
        // Parse the JSON response
        let json_response: serde_json::Value = serde_json::from_str(&chunk_str).unwrap();
        // Extract the content from the response
        let content = json_response["message"]["content"]
            .as_str()
            .unwrap_or("")
            .to_string();

        Ok(Box::pin(stream::once(async { Ok(content) })))
    }
}

// Additional providers can be implemented similarly

// Function to get the appropriate LLMProvider based on the ModelProvider enum
pub fn get_provider(provider: ModelProvider) -> Box<dyn LLMProvider + Send> {
    match provider {
        ModelProvider::Local => Box::new(LocalProvider),
        ModelProvider::Ollama => Box::new(OllamaProvider::new("your_api_url_here")), // Replace with actual API URL
        // Add cases for other providers as needed
        _ => panic!("Unsupported provider"),
    }
}
