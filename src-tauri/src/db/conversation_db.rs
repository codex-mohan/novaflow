use crate::db::db::Database;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::borrow::Cow;
use surrealdb::{error::Db, sql::Datetime, RecordId, Result, Surreal};
use tracing::{error, info};

#[derive(Debug, Serialize, Deserialize)]
pub struct Record {
    #[allow(dead_code)]
    pub id: RecordId,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Conversation {
    id: RecordId,
    pub user_id: RecordId,
    pub title: String,
    pub messages: Vec<Message>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ConversationData {
    user_id: RecordId,
    messages: Vec<Message>,
    title: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConversationInfo {
    id: RecordId,
    pub user_id: RecordId,
    pub title: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    pub message_id: String,
    pub role: String,
    pub contents: Value, // JSON payload
    pub timestamp: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Messages {
    messages: Vec<Message>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageData<'a> {
    pub message_id: Cow<'a, str>,
    pub content: Value, // JSON payload
    pub images: Vec<String>,
}

pub struct ConversationDatabase;

impl ConversationDatabase {
    /// Initialize the database and define schemas for `conversation` and `message`
    pub async fn initialize(db_path: &str) -> Result<()> {
        Database::initialize(db_path, "novaflow", "conversations").await?;

        let db = Database::get_connection();
        let conn = db.lock().await;

        // Define the conversation table
        conn.query(
            r#"
            DEFINE TABLE conversation SCHEMAFUL;
            DEFINE FIELD user_id ON conversation TYPE record<user>;
            DEFINE FIELD title ON conversation TYPE string ASSERT $value != NONE AND $value != '';
            DEFINE FIELD messages ON conversation FLEXIBLE TYPE option<array<object>>;
            DEFINE FIELD created_at ON conversation VALUE time::now();
            DEFINE FIELD updated_at ON conversation VALUE time::now();
            "#,
        )
        .await?;

        info!("Schema definitions for `conversation` and `messages` are set up.");
        Ok(())
    }

    pub async fn create_conversation<'a>(
        user_id: impl Into<Cow<'a, str>>,
        title: impl Into<Cow<'a, str>>,
    ) -> Result<Conversation> {
        let db = Database::get_connection();
        let conn = db.lock().await;

        // Convert `user_id` and `title` to `Cow<'a, str>`
        let user_id = user_id.into();
        let title = title.into();

        info!("creating and fetching the result...");
        // Execute the query to create the conversation
        let conversation: Option<Conversation> = conn
            .create("conversation")
            .content(ConversationData {
                user_id: RecordId::from_table_key("user", &*user_id),
                messages: vec![],
                title: title.to_string(), // Convert `Cow` to `String` as required by the struct
            })
            .await?;

        // Retrieve the conversation
        dbg!(conversation.as_ref());

        // Return the created conversation
        Ok(conversation.unwrap())
    }

    pub async fn add_message_to_coversation(
        conversation_id: String,
        messages: Vec<Message>,
    ) -> Result<String> {
        let db = Database::get_connection();
        let conn = db.lock().await;

        info!("Adding message to conversation: {}", &conversation_id);

        let conversation_id_rec = RecordId::from_table_key("conversation", &conversation_id);

        #[derive(Debug, Serialize, Deserialize)]
        struct UserId {
            user_id: RecordId,
            title: String,
        };

        let data: Option<UserId> = conn.select(("conversation", &conversation_id)).await?;

        let title = data.as_ref().unwrap().title.clone();
        let user_id = data.as_ref().unwrap().user_id.clone();

        let message: Option<ConversationData> = conn
            .upsert((
                conversation_id_rec.table().to_string(),
                conversation_id_rec.key().to_string(),
            ))
            .content(ConversationData {
                user_id: user_id,
                messages: messages,
                title: title,
            })
            .await?;

        Ok(message.unwrap().title.to_string())
    }

    /// Retrieve all messages for a given conversation ID
    pub async fn get_conversation_messages(conversation_id: &str) -> Result<Vec<Messages>> {
        let db = Database::get_connection();
        let conn = db.lock().await;

        info!(
            "Loading comversations messages for Conversation ID: {}",
            conversation_id
        );

        let mut result = conn
            .query("SELECT messages FROM $conversation_id;")
            .bind((
                "conversation_id",
                RecordId::from_table_key("conversation", conversation_id),
            ))
            .await?;

        dbg!(&result);
        let messages: Vec<Messages> = result.take(0)?;

        info!("{:?}", &messages);

        Ok(messages)
    }

    /// Retrieve all conversations for a given user ID
    pub async fn get_user_conversations(user_id: RecordId) -> Result<Vec<Conversation>> {
        let db = Database::get_connection();
        let conn = db.lock().await;

        info!("getting user conversations for {}", user_id);

        let mut result = conn
            .query("SELECT * FROM conversation WHERE user_id = $user_id ORDER BY created_at ASC;")
            .bind(("user_id", user_id))
            .await?;

        let conversations: Vec<Conversation> = result.take(0)?;

        dbg!(&conversations);

        Ok(conversations)
    }

    // Delete both conversation and it associated messages. Pass only the table id (key)
    pub async fn delete_conversation(conversation_id: &str) -> Result<Record> {
        let db = Database::get_connection();
        let conn = db.lock().await;

        let conversation_id_rec = RecordId::from_table_key("messages", conversation_id);

        // Delete both the conversation and it associated messages.
        let mut result_msg = conn
            .query("DELETE messages WHERE conversation_id = $conversation_id;")
            .bind(("conversation_id", conversation_id_rec))
            .await?;

        let msg: Option<Record> = result_msg.take(0)?;

        // Now delete the conversation

        let result_conversation: Option<Record> =
            conn.delete(("conversation", conversation_id)).await?;

        dbg!(result_conversation.as_ref());

        match result_conversation {
            Some(val) => {
                info!("The conversation {} has been deleted.", val.id);
                return Ok(val);
            }
            None => {
                info!("The mentioned record doesn't exist.");
                return Err(surrealdb::Error::Db(Db::NoRecordFound));
            }
        }
    }
}
