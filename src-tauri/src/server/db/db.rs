use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use surrealdb::engine::local::RocksDb;
use surrealdb::{RecordId, Surreal};
use tauri::path::BaseDirectory;
use tokio::sync::Mutex;

fn get_database_path() -> PathBuf {
    let app_dir = BaseDirectory::AppData.variable();
    let mut path = PathBuf::from(app_dir);
    path.push("db");
    path
}

#[derive(Debug, Serialize, Deserialize)]
struct UserCredentials {
    first_name: String,
    middle_name: String,
    last_name: String,
    username: String,
    password: String,
    email: String,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct Record {
    id: RecordId,
}

pub struct UserDatabase {
    db: Arc<Mutex<Surreal<surrealdb::engine::local::Db>>>,
}

impl UserDatabase {
    pub async fn new() -> surrealdb::Result<Self> {
        let db_path = get_database_path().display().to_string();
        let db = Surreal::new::<RocksDb>(&db_path).await?;
        db.use_ns("novaflow").use_db("users").await?;

        Ok(Self {
            db: Arc::new(Mutex::new(db)),
        })
    }

    pub async fn create_user(
        &self,
        first_name: &str,
        middle_name: &str,
        last_name: &str,
        username: &str,
        password: &str,
        email: &str,
    ) -> surrealdb::Result<Option<Record>> {
        let user = UserCredentials {
            first_name: first_name.to_string(),
            middle_name: middle_name.to_string(),
            last_name: last_name.to_string(),
            username: username.to_string(),
            password: password.to_string(),
            email: email.to_string(),
        };

        let mut db = self.db.lock().await;
        let created: Option<Record> = db.create("user").content(user).await?;
        Ok(created)
    }
}
