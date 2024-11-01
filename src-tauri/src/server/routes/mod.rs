use axum::Router;

pub mod generate;
pub mod list_services;

pub fn all_routes() -> Router {
    Router::new()
        .merge(generate::generate_route())
        .merge(list_services::list_services_route())
}
