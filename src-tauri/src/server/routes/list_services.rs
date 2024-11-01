use axum::{routing::get, Router};

async fn list_services() -> &'static str {
    return "list services";
}

pub fn list_services_route() -> Router {
    Router::new().route("/list_services", get(list_services))
}
