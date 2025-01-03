use crate::utils::get_database_path;
use serde_json::{json, Value};
use tauri::{command, AppHandle, Emitter, EventTarget};
use tracing::{error, info};

use crate::db::conversation_db::{Conversation, ConversationDatabase};
use crate::db::user_db::UserDatabase;

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
    let database_path = get_database_path("db").display().to_string();
    // Ensure the database is initialized
    if let Err(e) = UserDatabase::initialize(&database_path).await {
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
    let database_path = get_database_path("db").display().to_string();
    if let Err(e) = UserDatabase::initialize(&database_path).await {
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
pub async fn update_conversation_db() -> Result<(), String> {
    info!("Updating conversation database...");
    let database_path = get_database_path("db").display().to_string();

    // Ensure the database is initialized
    if let Err(e) = ConversationDatabase::initialize(&database_path).await {
        error!("Failed to initialize database: {:?}", e);
        return Err(format!("Database initialization failed: {:?}", e));
    }

    Ok(())
}

#[command(rename_all = "snake_case")]
pub async fn create_conversation(user_id: String) -> Result<String, String> {
    let database_path = get_database_path("db").display().to_string();
    if let Err(e) = ConversationDatabase::initialize(&database_path).await {
        return Err(format!("Database initialization failed: {:?}", e));
    }
    let title = "default_conversation"; // Use default title
    let conversation_id = ConversationDatabase::create_conversation(user_id, title.to_string())
        .await
        .map_err(|e| format!("{:?}", e))?;
    Ok(conversation_id)
}

#[command(rename_all = "snake_case")]
pub async fn load_conversations(user_id: String) -> Result<Vec<Conversation>, String> {
    let database_path = get_database_path("db").display().to_string();
    if let Err(e) = ConversationDatabase::initialize(&database_path).await {
        return Err(format!("Database initialization failed: {:?}", e));
    }

    let conversations = match ConversationDatabase::get_user_conversations(&user_id).await {
        Ok(conversations) => conversations,
        Err(e) => return Err(format!("Failed to get user conversations: {:?}", e)),
    };
    Ok(conversations)
}

#[command(rename_all = "snake_case")]
pub async fn add_message_to_conversation(
    user: String, // Access the current user's data
    conversation_id: String,
    role: String,
    content: Value, // Assuming content is in JSON format
) -> Result<String, String> {
    // Check if the user exists (optional, but ensures you handle state properly)
    if user.is_empty() {
        return Err("User ID is missing".into());
    }

    // Add the message to the conversation
    let message_id = match ConversationDatabase::add_message(&conversation_id, role, content).await
    {
        Ok(message) => message,
        Err(e) => {
            return Err(format!(
                "Failed to add message to conversation - {}: {:?}",
                conversation_id, e
            ))
        }
    };
    Ok(message_id)
}
