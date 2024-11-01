use axum::{routing::get, Router};

async fn generate() -> &'static str {
    "Welcome to the generate page"
}

pub fn generate_route() -> Router {
    Router::new().route("/generate", get(generate))
}
