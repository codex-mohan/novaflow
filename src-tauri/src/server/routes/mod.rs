#[allow(unused_imports)]
use std::sync::Arc;

use axum::Router;

pub mod auth;
pub mod generate;
pub mod list_services;

pub async fn all_routes() -> Router {
    // let database = UserDatabase::new()
    //     .await
    //     .expect("Failed to initialize database");
    // let database = Arc::new(database);
    Router::new()
        .merge(generate::generate_route())
        .merge(list_services::list_services_route())
    // .merge(auth::auth_route(database.clone()))
}
