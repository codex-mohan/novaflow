use crate::db::db::Database;
use serde::{Deserialize, Serialize};
use serde_json::json;
use surrealdb::Result;
use tracing::info;

use super::db;

#[derive(Debug, Serialize, Deserialize)]
pub struct UserCredentials {
    pub first_name: String,
    pub last_name: String,
    pub username: String,
    pub email: String,
}

pub struct UserDatabase {
    base: Database,
}

impl UserDatabase {
    pub async fn new(path: &str) -> Result<Self> {
        let base = Database::new(path).await?;
        Ok(Self { base })
    }

    pub async fn initialize(&self) -> Result<()> {
        self.base.initialize("novaflow", "users").await
    }

    pub async fn create_user(
        &self,
        first_name: String,
        last_name: String,
        username: String,
        pass: String,
        email: String,
    ) -> Result<()> {
        let db_connection = self.base.get_connection();
        let db = db_connection.lock().await;
        let query = format!(
            "CREATE user SET first_name = '{}', last_name = '{}', username = '{}', pass = crypto::argon2::generate('{}'), email = '{}'",
            first_name, last_name, username, pass, email
        );
        db.query(&query).await?;

        // remove / delete the db_connection
        // drop(db);
        Ok(())
    }

    /// Authenticate a user by verifying their username and password
    pub async fn auth_db(&self, username: &str, password: &str) -> Result<serde_json::Value> {
        let db_connection = self.base.get_connection();
        let db = db_connection.lock().await;

        // Query to verify username and password using Argon2 comparison
        let query = format!(
            "SELECT username, first_name, last_name, email FROM user WHERE username = '{}' AND crypto::argon2::compare(pass, '{}') LIMIT 1",
            username, password
        );

        let mut result = db.query(&query).await?;
        let user_details: Option<UserCredentials> = result.take(0)?;

        if let Some(details) = user_details {
            info!("Authentication successful for user: {}", username);
            Ok(json!({ "status": "success", "user": details }))
        } else {
            info!("Authentication failed for user: {}", username);
            Ok(json!({ "status": "error", "message": "Invalid credentials" }))
        }
    }
}
