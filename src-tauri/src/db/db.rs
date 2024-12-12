use std::sync::Arc;
use std::sync::OnceLock;
use surrealdb::engine::local::{Db, RocksDb};
use surrealdb::{Error as SurrealError, Surreal};
use tokio::sync::Mutex;
use tracing::info;

// Singleton Database Instance
static DB: OnceLock<Arc<Mutex<Surreal<Db>>>> = OnceLock::new();

pub struct Database {
    db: Arc<Mutex<Surreal<Db>>>,
}

impl Database {
    /// Initialize the singleton RocksDB instance
    pub async fn initialize(
        db_path: &str,
        namespace: &str,
        database: &str,
    ) -> Result<(), SurrealError> {
        if DB.get().is_none() {
            info!("Initializing RocksDB connection...");

            // Connect to the RocksDB storage
            let surreal = Surreal::new::<RocksDb>(db_path).await?;
            surreal.use_ns(namespace).use_db(database).await?;

            // Store the connection in the static instance
            DB.set(Arc::new(Mutex::new(surreal))).unwrap();
            info!("RocksDB connection initialized.");
        } else {
            info!("RocksDB connection already initialized.");
        }
        Ok(())
    }

    /// Get the singleton instance of the database
    pub fn get_connection() -> Arc<Mutex<Surreal<Db>>> {
        DB.get()
            .expect("Database must be initialized before use!")
            .clone()
    }
}
