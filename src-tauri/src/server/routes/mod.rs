use std::sync::Arc;

use crate::server::db::db::UserDatabase;
use auth::auth_route;
use axum::Router;
use tokio::sync::Mutex;

pub mod auth;
pub mod generate;
pub mod list_services;

pub async fn all_routes() -> Router {
    let database = UserDatabase::new()
        .await
        .expect("Failed to initialize database");
    let database = Arc::new(database);
    Router::new()
        .merge(generate::generate_route())
        .merge(list_services::list_services_route())
        .merge(auth::auth_route(database.clone()))
}
