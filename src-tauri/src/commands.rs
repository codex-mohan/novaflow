use crate::utils::get_database_path;
use serde_json::{json, Value};
use std::sync::LazyLock;
use tauri::{command, AppHandle, Emitter, EventTarget};
use tracing::{error, info};

use crate::db::conversation_db::{Conversation, ConversationDatabase, Message, Messages, Record};
use crate::db::user_db::UserDatabase;

static DB_PATH: LazyLock<String> =
    std::sync::LazyLock::new(|| get_database_path("db").display().to_string());

#[command]
pub fn open_file(app: AppHandle, path: std::path::PathBuf) {
    app.emit_filter("open-file", path, |target| match target {
        EventTarget::WebviewWindow { label } => label == "main" || label == "file-viewer",
        _ => false,
    })
    .unwrap();
}

#[command(rename_all = "snake_case")]
pub async fn signup_user(
    first_name: String,
    last_name: String,
    username: String,
    password: String,
    email: String,
) -> Result<(), String> {
    info!("Signing up user...");
    // Ensure the database is initialized
    if let Err(e) = UserDatabase::initialize(&*DB_PATH).await {
        error!("Failed to initialize database: {:?}", e);
        return Err(format!("Database initialization failed: {:?}", e));
    }

    info!("Database initialized successfully");

    // Spawn an asynchronous task for user creation
    let joint_result = tauri::async_runtime::spawn(async move {
        UserDatabase::create_user(first_name, last_name, username, password, email).await
    });

    info!("User creation started");

    // Await the result
    match joint_result.await {
        Ok(result) => match result {
            Ok(_) => {
                info!("User created successfully");
                Ok(())
            }
            Err(e) => {
                error!("Failed creating user: {:?}", e);
                Err(format!("Failed creating user: {:?}", e))
            }
        },
        Err(e) => {
            error!("Error creating user: {:?}", e);
            Err(format!("Error creating user: {:?}", e))
        }
    }
}

#[command(rename_all = "snake_case")]
pub async fn login_user(username: String, password: String) -> Result<serde_json::Value, String> {
    info!("Logging in user...");

    // Ensure the database is initialized
    if let Err(e) = UserDatabase::initialize(&*DB_PATH).await {
        error!("Failed to initialize database: {:?}", e);
        return Err(format!("Database initialization failed: {:?}", e));
    }

    // Spawn an asynchronous task for user login
    let joint_result = tauri::async_runtime::spawn(async move {
        UserDatabase::verify_password(&username, &password).await
    });

    // Await and handle the result
    match joint_result.await {
        Ok(result) => match result {
            Ok(Some(user)) => {
                info!("Login successful for user");

                // Convert user details into JSON
                Ok(json!(user))
            }
            Ok(None) => {
                info!("Authentication failed for user");
                Err("Invalid credentials".to_string())
            }
            Err(err) => {
                error!("Authentication error: {:?}", err);
                Err(format!("Authentication error: {:?}", err))
            }
        },
        Err(e) => {
            error!("Task error: {:?}", e);
            Err(format!("Error logging in: {:?}", e))
        }
    }
}

#[command(rename_all = "snake_case")]
pub async fn create_conversation(
    username: String,
    conversation_title: String,
) -> Result<Conversation, String> {
    // Clone the `username` to create an owned String
    let username_owned = username.to_string();

    if let Err(e) = UserDatabase::initialize(&*DB_PATH).await {
        error!("Failed to initialize database: {:?}", e);
        return Err(format!("Database initialization failed: {:?}", e));
    }

    if let Err(e) = ConversationDatabase::initialize(&*DB_PATH).await {
        return Err(format!("Database initialization failed: {:?}", e));
    }

    // Spawn an asynchronous task for getting user ID
    let result = UserDatabase::get_user_id(&username_owned).await;

    let user_id = result.map_err(|e| format!("Failed to get user ID: {:?}", e))?;

    if user_id.id.key().to_string().is_empty() {
        info!("Got empty user id")
    }

    // Use default title if conversation_title is empty
    let title = if conversation_title.is_empty() {
        "default_conversation".to_string()
    } else {
        conversation_title
    };

    let conversation =
        ConversationDatabase::create_conversation(user_id.id.key().to_string(), title.to_string())
            .await;

    match conversation {
        Ok(data) => Ok(data),
        Err(e) => Err(format!("Got error {}", e)),
    }
}

#[command(rename_all = "snake_case")]
pub async fn update_conversation_db() -> Result<(), String> {
    info!("Updating conversation database...");

    // Ensure the database is initialized
    if let Err(e) = ConversationDatabase::initialize(&*DB_PATH).await {
        error!("Failed to initialize database: {:?}", e);
        return Err(format!("Database initialization failed: {:?}", e));
    }

    Ok(())
}

#[command(rename_all = "snake_case")]
pub async fn load_conversations(username: String) -> Result<Vec<Conversation>, String> {
    if let Err(e) = ConversationDatabase::initialize(&*DB_PATH).await {
        return Err(format!("Database initialization failed: {:?}", e));
    }

    let result = UserDatabase::get_user_id(&username).await;

    let user_id = result.map_err(|e| format!("Failed to get user ID: {:?}", e))?;

    let conversations = match ConversationDatabase::get_user_conversations(user_id.id).await {
        Ok(conversations) => conversations,
        Err(e) => return Err(format!("Failed to get user conversations: {:?}", e)),
    };
    Ok(conversations)
}

#[command(rename_all = "snake_case")]
pub async fn add_messages_to_conversation(
    conversation_id: String,
    messages: Vec<Message>, // Assuming content is in JSON format
) -> Result<String, String> {
    // Initializing the conversation_db
    if let Err(e) = ConversationDatabase::initialize(&*DB_PATH).await {
        error!("Failed to initialize database: {:?}", e);
        return Err(format!("Database initialization failed: {:?}", e));
    }

    // Add the message to the conversation
    let message_id =
        match ConversationDatabase::add_message_to_coversation(conversation_id.clone(), messages)
            .await
        {
            Ok(message) => message,
            Err(e) => {
                return Err(format!(
                    "Failed to add message to conversation - {}: {:?}",
                    conversation_id.to_string(),
                    e
                ))
            }
        };
    Ok(message_id)
}

#[command(rename_all = "snake_case")]
pub async fn get_messages_from_conversation(
    conversation_id: String,
) -> Result<Vec<Messages>, String> {
    // Initializing the conversation_db
    if let Err(e) = ConversationDatabase::initialize(&*DB_PATH).await {
        error!("Failed to initialize database: {:?}", e);
        return Err(format!("Database initialization failed: {:?}", e));
    }

    let joint_result = tauri::async_runtime::spawn(async move {
        ConversationDatabase::get_conversation_messages(conversation_id.as_str()).await
    });

    match joint_result.await {
        Ok(result) => match result {
            Ok(messages) => Ok(messages),
            Err(e) => Err(format!("Failed getting messages {}", e)),
        },
        Err(e) => Err(format!(
            "Job for get_messages_from_conversations failed with error: {}",
            e
        )),
    }
}

#[command(rename_all = "snake_case")]
pub async fn delete_conversation(conversation_id: String) -> Result<Record, String> {
    if let Err(e) = ConversationDatabase::initialize(&*DB_PATH).await {
        error!("Failed to initialize database: {:?}", e);
        return Err(format!("Database initialization failed: {:?}", e));
    }

    let joint_result = tauri::async_runtime::spawn(async move {
        ConversationDatabase::delete_conversation(&conversation_id).await
    });

    match joint_result.await {
        Ok(conversation) => match conversation {
            Ok(value) => Ok(value),
            Err(e) => Err(format!("Failed deleting messages: {}", e)),
        },
        Err(e) => Err(format!(
            "Job for get_messages_from_conversations failed with error: {}",
            e
        )),
    }
}
