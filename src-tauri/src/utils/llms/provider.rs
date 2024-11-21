use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use anyhow::Result;

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    pub role: String,
    pub content: String,
}

#[async_trait]
pub trait LLMProvider {
    async fn generate_response(&self, messages: Vec<Message>) -> Result<String>;
    async fn generate_stream(&self, messages: Vec<Message>) -> Result<impl futures::Stream<Item = Result<String>>>;
} 