use std::sync::Arc;
use surrealdb::{
    engine::local::{Db, RocksDb},
    Error as SurrealError, Surreal,
};
use tokio::sync::Mutex;
use tracing::info;

pub struct Database {
    db: Arc<Mutex<Surreal<Db>>>,
}

impl Database {
    pub async fn new(db_path: &str) -> Result<Self, SurrealError> {
        // Create or fetch the singleton instance
        info!("Initializing the database connection...");
        let db = Surreal::new::<RocksDb>(db_path).await?;

        Ok(Self {
            db: Arc::new(Mutex::new(db)),
        })
    }

    pub fn get_connection(&self) -> Arc<Mutex<Surreal<Db>>> {
        Arc::clone(&self.db)
    }

    pub async fn initialize(&self, namespace: &str, database: &str) -> surrealdb::Result<()> {
        let db = self.db.lock().await;
        db.use_ns(namespace).use_db(database).await?;
        Ok(())
    }
}
