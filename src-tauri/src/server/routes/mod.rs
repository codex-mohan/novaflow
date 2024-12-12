#[allow(unused_imports)]
use std::sync::Arc;

use axum::Router;

pub mod auth;
pub mod chat;
pub mod list_services;

pub async fn all_routes() -> Router {

    Router::new()
        .nest("/api", chat::chat_route())
        .nest("/api", list_services::list_services_route())

}
