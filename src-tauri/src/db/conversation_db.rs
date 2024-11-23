use crate::db::db::Database;
use serde::{Deserialize, Serialize};
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
    pub role: String, // "user" | "assistant"
    pub content: MessageContent,
    pub timestamp: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MessageContent {
    Text {
        text: String,
    },
    Image {
        base64_image: String,
        caption: Option<String>,
    },
    MultiModal {
        text: String,
        images: Vec<Image>, // base64 encoded images
    },
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Image {
    pub base64_image: String,
    pub caption: Option<String>,
}

pub struct ConversationDatabase;

impl ConversationDatabase {
    /// Initialize the database and define schemas for `conversation` and `message`
    pub async fn initialize() -> Result<()> {
        // Initialize the database connection if not already done
        Database::initialize("./data", "novaflow", "conversations").await?;

        let db = Database::get_connection();
        let conn = db.lock().await;

        // Define the conversation table with relation to user
        conn.query("DEFINE TABLE conversation SCHEMAFUL;").await?;
        conn.query("DEFINE FIELD user_id ON conversation TYPE record(user);")
            .await?;
        conn.query("DEFINE FIELD title ON conversation TYPE string;")
            .await?;
        conn.query("DEFINE FIELD created_at ON conversation TYPE datetime;")
            .await?;
        conn.query("DEFINE FIELD updated_at ON conversation TYPE datetime;")
            .await?;

        // Define the message table with relation to conversation
        conn.query("DEFINE TABLE message SCHEMAFUL;").await?;
        conn.query("DEFINE FIELD conversation_id ON message TYPE record(conversation);")
            .await?;
        conn.query("DEFINE FIELD role ON message TYPE string;")
            .await?;
        conn.query("DEFINE FIELD content ON message TYPE object;")
            .await?;
        conn.query("DEFINE FIELD timestamp ON message TYPE datetime;")
            .await?;

        info!("Schema definitions for `conversation` and `message` are set up.");
        Ok(())
    }

    /// Create a new conversation and return its ID
    pub async fn create_conversation(user_id: &str, title: &str) -> Result<String> {
        let db = Database::get_connection();
        let conn = db.lock().await;

        let query = format!(
            "CREATE conversation SET user_id = user:{}, title = '{}', created_at = time::now(), updated_at = time::now()",
            user_id, title
        );

        let mut result = conn.query(&query).await?;
        let conversation: Option<Conversation> = result.take(0)?;

        Ok(conversation.unwrap().id)
    }

    /// Add a message to a specific conversation
    pub async fn add_message(conversation_id: &str, message: Message) -> Result<()> {
        let db = Database::get_connection();
        let conn = db.lock().await;

        let content_json = serde_json::to_string(&message.content).unwrap();

        let query = format!(
            "CREATE message SET conversation_id = conversation:{}, role = '{}', content = {}, timestamp = time::now()",
            conversation_id, message.role, content_json
        );

        conn.query(&query).await?;
        Ok(())
    }

    /// Retrieve all messages for a given conversation ID
    pub async fn get_conversation_messages(conversation_id: &str) -> Result<Vec<Message>> {
        let db = Database::get_connection();
        let conn = db.lock().await;

        let query = format!(
            "SELECT * FROM message WHERE conversation_id = conversation:{} ORDER BY timestamp ASC",
            conversation_id
        );

        let mut result = conn.query(&query).await?;
        let messages: Vec<Message> = result.take(0)?;

        Ok(messages)
    }
}
