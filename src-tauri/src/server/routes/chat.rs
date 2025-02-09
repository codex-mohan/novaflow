use std::sync::Arc;

use axum::body::Body;
use axum::response::Response;
use axum::{
    routing::{get, post},
    Json, Router,
};
use chrono::format;
use futures_util::stream::{self, StreamExt};
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream; // For image encoding/decoding

use langchain_rust::{
    agent::{AgentExecutor, ConversationalAgentBuilder},
    chain::{options::ChainCallOptions, Chain},
    llm::ollama::client::Ollama,
    prompt_args,
    schemas::Message,
    tools::{CommandExecutor, DuckDuckGoSearchResults, Wolfram},
    vectorstore::{
        qdrant::{Qdrant, StoreBuilder},
        Retriever, VectorStore,
    },
};
use tracing::info;

use crate::utils::tools::GetDateAndTime;

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
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "lowercase", tag = "type")]
pub struct MessageContent {
    text: String,
    image: Option<String>,
}

#[derive(Serialize, Deserialize, PartialEq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum ChatRole {
    User,
    Assistant,
    System,
}

#[derive(Serialize, Deserialize)]
pub struct ChatMessage {
    role: ChatRole,
    content: MessageContent,
}

// Request structure for chat
#[derive(Deserialize)]
pub struct ChatRequest {
    model: String,
    model_type: ModelType,
    prompt: MessageContent,
    // Common LLM parameters
    temperature: Option<f32>,
    top_k: Option<usize>,
    top_p: Option<f32>,
    max_tokens: Option<u32>,
    messages: Vec<ChatMessage>,
    should_stream: Option<bool>,
}

// Response structure
#[derive(Serialize, Debug)]
pub struct ChatResponse {
    response: String,
    is_streaming: bool,
    usage: Option<UsageInfo>,
}

#[derive(Serialize, Debug)]
pub struct UsageInfo {
    avg_prompt_tok_per_sec: u32,
    avg_compl_tok_per_sec: u32,
}

async fn chat(Json(request): Json<ChatRequest>) -> Response<Body> {
    let (tx, rx) = mpsc::channel(32); // Create a channel for streaming responses

    tokio::spawn(async move {
        match request.model_type {
            ModelType::VLM => {
                let llm = Ollama::default().with_model(request.model);

                // Default tools
                let command_executor = CommandExecutor::default();
                let get_date_and_time = GetDateAndTime {};
                let duck_duck_go_search_results = DuckDuckGoSearchResults::default();
                let wolfram = Wolfram::default();

                let agent = ConversationalAgentBuilder::new()
                    .tools(&[
                        Arc::new(command_executor),
                        Arc::new(get_date_and_time),
                        Arc::new(duck_duck_go_search_results),
                        Arc::new(wolfram),
                    ])
                    .options(
                        ChainCallOptions::new()
                            .with_max_tokens(request.max_tokens.unwrap_or(1000))
                            .with_top_p(request.top_p.unwrap_or(1.0))
                            .with_top_k(request.top_k.unwrap_or(50))
                            .with_temperature(request.temperature.unwrap_or(0.8)),
                    )
                    .build(llm)
                    .unwrap();

                let executor = AgentExecutor::from_agent(agent);

                let mut history: Vec<Message> = vec![];

                for message in &request.messages {
                    if message.role == ChatRole::Assistant {
                        history.push(Message::new_ai_message(message.content.text.clone()));
                    } else if message.role == ChatRole::User {
                        if message.content.image != None {
                            history.push(Message::new_human_message(message.content.text.clone()));
                            history.push(Message::new_human_message_with_images(vec![format!(
                                "data:image/jpeg;base64,{:?}",
                                message.content.image
                            )]));
                        } else {
                            history.push(Message::new_human_message(message.content.text.clone()));
                        }
                    } else if message.role == ChatRole::System {
                        history.push(Message::new_system_message(message.content.text.clone()));
                    } else {
                        info!("Unknown role: {:?}", message.role);
                    }
                }

                let input_variables = prompt_args! {
                    "input" => &request.prompt.text.clone(),
                    "history" => history,
                };

                match executor.invoke(input_variables).await {
                    Ok(result) => {
                        println!("Result: {:?}", result);
                    }
                    Err(e) => panic!("Error invoking LLMChain: {:?}", e),
                }
            }
            ModelType::LLM => {
                let llm = Ollama::default().with_model(request.model);

                // Default tools
                let command_executor = CommandExecutor::default();
                let get_date_and_time = GetDateAndTime {};
                let duck_duck_go_search_results = DuckDuckGoSearchResults::default();
                let wolfram = Wolfram::default();

                let agent = ConversationalAgentBuilder::new()
                    .tools(&[
                        Arc::new(command_executor),
                        Arc::new(get_date_and_time),
                        Arc::new(duck_duck_go_search_results),
                        Arc::new(wolfram),
                    ])
                    .options(
                        ChainCallOptions::new()
                            .with_max_tokens(request.max_tokens.unwrap_or(1000))
                            .with_top_p(request.top_p.unwrap_or(1.0))
                            .with_top_k(request.top_k.unwrap_or(50))
                            .with_temperature(request.temperature.unwrap_or(0.8)),
                    )
                    .build(llm)
                    .unwrap();

                let executor = AgentExecutor::from_agent(agent);

                let mut history: Vec<Message> = vec![];

                for message in &request.messages {
                    if message.role == ChatRole::Assistant {
                        history.push(Message::new_ai_message(message.content.text.clone()));
                    } else if message.role == ChatRole::User {
                        history.push(Message::new_human_message(message.content.text.clone()));
                    } else if message.role == ChatRole::System {
                        history.push(Message::new_system_message(message.content.text.clone()));
                    } else {
                        info!("Unknown role: {:?}", message.role);
                    }
                }

                let input_variables = prompt_args! {
                    "input" => &request.prompt.text.clone(),
                    "history" => history,
                };

                let mut stream = executor.stream(input_variables).await.unwrap();
                let mut full_response = String::new(); // Accumulate the full response

                let mut average_prompt_token: u32 = 0;
                let mut average_completion_token: u32 = 0;

                while let Some(result) = stream.next().await {
                    match result {
                        Ok(data) => {
                            let response_chunk = data.clone().content.to_string();
                            full_response.push_str(&response_chunk); // Append to the full response


                            let response = ChatResponse {
                                response: response_chunk,
                                is_streaming: true, // Streaming is ongoing
                                usage: Some(UsageInfo {
                                    avg_prompt_tok_per_sec: average_prompt_token,
                                    avg_compl_tok_per_sec: average_completion_token,
                                }),
                            };

                            info!("{:?}", response);

                            // Send the response chunk
                            if tx
                                .send(Ok::<_, axum::Error>(
                                    serde_json::to_string(&response).unwrap(),
                                ))
                                .await
                                .is_err()
                            {
                                break; // Stop if the receiver is dropped
                            }
                        }
                        Err(e) => {
                            let _ = tx.send(Err(axum::Error::new(e))).await;
                            break; // Stop on error
                        }
                    }
                }

                // Send the final response with the full accumulated response
                let final_response = ChatResponse {
                    response: full_response, // Include the full response
                    is_streaming: false,     // Streaming is done
                    usage: Some(UsageInfo {
                        avg_prompt_tok_per_sec: Some(average_prompt_token).unwrap_or(0),
                        avg_compl_tok_per_sec: Some(average_completion_token).unwrap_or(0),
                    }),
                };

                let _ = tx
                    .send(Ok(serde_json::to_string(&final_response).unwrap()))
                    .await;
            }
        }
    });

    // Convert the receiver into a stream
    let stream = ReceiverStream::new(rx).map(|result| {
        result
            .map(|chunk| axum::body::Bytes::from(chunk))
            .map_err(|e| axum::Error::new(e))
    });

    // Wrap the stream into a `Body`
    let body = Body::from_stream(stream);

    // Return the response with the streaming body
    Response::builder()
        .header("Content-Type", "application/json")
        .body(body)
        .unwrap()
}

pub fn chat_route() -> Router {
    Router::new().route("/chat", post(chat))
}
