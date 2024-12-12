use axum::{
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use base64::Engine as _; // For image encoding/decoding

// Enum for model providers
#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ModelProvider {
    Local,
    Ollama,
    OpenAI,
    Groq,
}

// Enum for model types
#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ModelType {
    LLM,
    VLM,
}

#[derive(Deserialize)]
pub struct Image {
    base64_image: String,
    caption: Option<String>,
}

// Content types that can be sent in messages
#[derive(Deserialize)]
#[serde(rename_all = "lowercase", tag = "type")]
pub enum MessageContent {
    Text { text: String },
    Image(Image),
    MultiModal {
        text: String,
        images: Vec<Image>, // base64 encoded images
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ChatRole {
    User,
    Assistant,
    System,
}

#[derive(Deserialize)]
pub struct ChatMessage {
    role: ChatRole,
    content: MessageContent,
}

// Request structure for chat
#[derive(Deserialize)]
pub struct ChatRequest {
    provider: ModelProvider,
    model_type: ModelType,
    // Common LLM parameters
    temperature: Option<f32>,
    top_k: Option<i32>,
    top_p: Option<f32>,
    max_tokens: Option<i32>,
    messages: Vec<ChatMessage>,
}

// Response structure
#[derive(Serialize)]
pub struct ChatResponse {
    response: String,
    usage: Option<UsageInfo>,
}

#[derive(Serialize)]
pub struct UsageInfo {
    avg_prompt_tok_per_sec: f32,
    avg_compl_tok_per_sec: f32,
}

async fn chat(Json(request): Json<ChatRequest>) -> Json<ChatResponse> {
    match request.model_type {
        ModelType::VLM => {
            // Handle VLM-specific logic
            // Example pseudo-code:
            /*
            let model = VisionModelBuilder::new(MODEL_ID, VisionLoaderType::VLlama)
                .with_isq(IsqType::Q4K)
                .with_logging()
                .build()
                .await?;

            let mut vision_messages = VisionMessages::new();
            
            for msg in request.messages {
                match msg.content {
                    MessageContent::Image { base64_image, caption } => {
                        let image_bytes = base64::engine::general_purpose::STANDARD
                            .decode(base64_image)
                            .unwrap();
                        let image = image::load_from_memory(&image_bytes).unwrap();
                        vision_messages.add_vllama_image_message(
                            msg.role.into(),
                            caption.unwrap_or_default(),
                            image,
                        );
                    },
                    MessageContent::Text { text } => {
                        vision_messages.add_text_message(msg.role.into(), text);
                    },
                    MessageContent::MultiModal { text, images } => {
                        // Handle multiple images with text
                    }
                }
            }

            let response = model.send_chat_request(vision_messages).await?;
            */
        },
        ModelType::LLM => {
            // Handle regular LLM logic
        }
    }

    // Placeholder response
    Json(ChatResponse {
        response: "Response placeholder".to_string(),
        usage: Some(UsageInfo {
            avg_prompt_tok_per_sec: 0.0,
            avg_compl_tok_per_sec: 0.0,
        }),
    })
}

pub fn chat_route() -> Router {
    Router::new().route("/chat", post(chat))
}