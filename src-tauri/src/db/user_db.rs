use crate::db::db::Database;
use serde::{Deserialize, Serialize};
use serde_json::json;
use surrealdb::Result as SurrealResult;
use tracing::{error, info};

use surrealdb::RecordId;

#[derive(Debug, Serialize, Deserialize)]
pub struct Record {
    id: RecordId,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub first_name: String,
    pub last_name: String,
    pub username: String,
    pub email: String,
    pub created_at: String,
    pub updated_at: String,
}

pub struct UserDatabase;

impl UserDatabase {
    /// Initialize the database and set up schemas for the `user` table
    pub async fn initialize(db_path: &str) -> SurrealResult<()> {
        // Initialize the database connection if not already done
        Database::initialize(db_path, "novaflow", "users").await?;

        let db = Database::get_connection();
        let conn = db.lock().await;

        // Define user table schema
        conn.query("DEFINE TABLE user SCHEMAFULL").await?;
        conn.query("DEFINE FIELD first_name ON user TYPE string")
            .await?;
        conn.query("DEFINE FIELD last_name ON user TYPE string")
            .await?;
        conn.query(
            "DEFINE FIELD username ON user TYPE string ASSERT $value != NONE AND $value != ''",
        )
        .await?;
        conn.query("DEFINE FIELD email ON user TYPE string").await?;
        conn.query("DEFINE FIELD pass ON user TYPE string").await?;
        conn.query("DEFINE FIELD created_at ON user TYPE datetime DEFAULT time::now()")
            .await?;
        conn.query("DEFINE FIELD updated_at ON user TYPE datetime DEFAULT time::now()")
            .await?;

        // Define indexes for unique constraints
        conn.query("DEFINE INDEX idx_username ON user FIELDS username UNIQUE")
            .await?;

        info!("Schema definition for `user` table is set up.");
        Ok(())
    }

    /// Create a new user with Argon2 password hashing
    pub async fn create_user(
        first_name: String,
        last_name: String,
        username: String,
        pass: String,
        email: String,
    ) -> SurrealResult<()> {
        let db = Database::get_connection();
        let conn = db.lock().await;

        let query = "CREATE user SET 
            first_name = $first_name, 
            last_name = $last_name, 
            username = $username, 
            pass = crypto::argon2::generate($pass), 
            email = $email,
            created_at = time::now(),
            updated_at = time::now()";

        let vars = json!({
            "first_name": first_name,
            "last_name": last_name,
            "username": username,
            "pass": pass,
            "email": email
        });

        let result = conn.query(query).bind(vars).await?;
        dbg!(result);

        Ok(())
    }

    /// Retrieve a user by their username
    pub async fn get_user_by_username(username: &str) -> SurrealResult<Option<User>> {
        let db = Database::get_connection();
        let conn = db.lock().await;

        let query = "SELECT * FROM user WHERE username = $username";
        let vars = json!({ "username": username });

        let mut result = conn.query(query).bind(vars).await?;
        let user: Option<User> = result.take(0)?;

        Ok(user)
    }

    pub async fn verify_password(username: &str, password: &str) -> SurrealResult<Option<User>> {
        let db = Database::get_connection();
        let conn = db.lock().await;

        let query = 
            "SELECT username, first_name, last_name, email, created_at, updated_at FROM user WHERE username = $username AND crypto::argon2::compare(pass, $pass)";

        let vars = json!({ "username": username, "pass": password });

        // Execute the query
        let mut resp = conn.query(query).bind(vars).await?;
        let results: Option<User> = resp.take(0)?;

        Ok(results)

        // match result {
        //     Ok(mut query_result) => {
        //         // Extract user details
        //         let user: Option<Record> = query_result.take(0)?;

        //         dbg!(user.as_ref());

        //         if let Some(details) = user {
        //             info!("Authentication successful for user: {}", username);
        //             Ok(Some(details))
        //         } else {
        //             info!("Authentication failed for user: {}", username);
        //             Ok(None) // Return None if the credentials are invalid
        //         }
        //     }
        //     Err(e) => {
        //         error!("Database query failed: {:?}", e);
        //         Err(e)
        //     }
        // }
    }
}
