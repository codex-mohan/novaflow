use crate::db::db::Database;
use surrealdb::Result;

pub struct ChatDatabase {
    base: Database,
}

impl ChatDatabase {
    pub async fn new(path: &str) -> Result<Self> {
        let base = Database::new(path).await?;
        Ok(Self { base })
    }

    pub async fn initialize(&self) -> Result<()> {
        self.base.initialize("novaflow", "chats").await
    }

    pub async fn create_message(&self, user_id: String, content: String) -> Result<()> {
        let db_connection = self.base.get_connection();
        let db = db_connection.lock().await;
        let query = format!(
            "CREATE message SET user_id = '{}', content = '{}'",
            user_id, content
        );
        db.query(&query).await?;
        Ok(())
    }
}
