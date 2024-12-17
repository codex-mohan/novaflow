use crate::db::db::Database;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use surrealdb::Result;
use tracing::info;

#[derive(Debug, Serialize, Deserialize)]
pub struct Conversation {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub conversation_id: String,
    pub role: String,   // "user" | "assistant"
    pub content: Value, // JSON payload
    pub timestamp: String,
}

pub struct ConversationDatabase;

impl ConversationDatabase {
    /// Initialize the database and define schemas for `conversation` and `message`
    pub async fn initialize(db_path: &str) -> Result<()> {
        Database::initialize(db_path, "novaflow", "conversations").await?;

        let db = Database::get_connection();
        let conn = db.lock().await;

        // Define the conversation table
        conn.query("DEFINE TABLE conversation SCHEMAFUL;").await?;
        conn.query("DEFINE FIELD user_id ON conversation TYPE record<user>;")
            .await?;
        conn.query("DEFINE FIELD title ON conversation TYPE string ASSERT $value != NONE AND $value != '';" ).await?;
        conn.query("DEFINE INDEX idx_title ON conversation FIELDS title UNIQUE;")
            .await?;
        conn.query("DEFINE FIELD created_at ON conversation TYPE datetime;")
            .await?;
        conn.query("DEFINE FIELD updated_at ON conversation TYPE datetime;")
            .await?;

        // Define the message table
        conn.query("DEFINE TABLE message SCHEMAFUL;").await?;
        conn.query("DEFINE FIELD conversation_id ON message TYPE record<conversation>;")
            .await?;
        conn.query("DEFINE FIELD role ON message TYPE string;")
            .await?;
        conn.query("DEFINE FIELD content ON message TYPE object;")
            .await?; // JSON content
        conn.query("DEFINE FIELD timestamp ON message TYPE datetime;")
            .await?;

        info!("Schema definitions for `conversation` and `message` are set up.");
        Ok(())
    }

    /// Create a new conversation and return its ID
    pub async fn create_conversation(user_id: String, title: String) -> Result<String> {
        let db = Database::get_connection();
        let conn = db.lock().await;

        let mut result = conn
            .query("CREATE conversation SET user_id = $user_id, title = $title, created_at = time::now(), updated_at = time::now();")
            .bind(("user_id", format!("user:{}", user_id)))
            .bind(("title", title))
            .await?;

        let conversation: Option<Conversation> = result.take(0)?;
        Ok(conversation.unwrap().id)
    }

    /// Add a message to a conversation
    pub async fn add_message(
        conversation_id: &str,
        role: String,
        content: Value,
    ) -> Result<String> {
        let db = Database::get_connection();
        let conn = db.lock().await;

        let mut result = conn
            .query("CREATE message SET conversation_id = $conversation_id, role = $role, content = $content, timestamp = time::now();")
            .bind(("conversation_id", format!("conversation:{}", conversation_id)))
            .bind(("role", role))
            .bind(("content", content))
            .await?;

        let message: Option<Message> = result.take(0)?;
        Ok(message.unwrap().id)
    }

    /// Retrieve all messages for a given conversation ID
    pub async fn get_conversation_messages(conversation_id: &str) -> Result<Vec<Message>> {
        let db = Database::get_connection();
        let conn = db.lock().await;

        let mut result = conn
            .query("SELECT * FROM message WHERE conversation_id = $conversation_id ORDER BY timestamp ASC;")
            .bind(("conversation_id", format!("conversation:{}", conversation_id)))
            .await?;

        let messages: Vec<Message> = result.take(0)?;
        Ok(messages)
    }

    /// Retrieve all conversations for a given user ID
    pub async fn get_user_conversations(user_id: &str) -> Result<Vec<Conversation>> {
        let db = Database::get_connection();
        let conn = db.lock().await;

        let mut result = conn
            .query("SELECT * FROM conversation WHERE user_id = $user_id ORDER BY created_at ASC;")
            .bind(("user_id", format!("user:{}", user_id)))
            .await?;

        let conversations: Vec<Conversation> = result.take(0)?;
        Ok(conversations)
    }
}
