pub mod generate;
pub mod list_services;

use rocket::{routes, Route};

pub fn all_routes() -> Vec<Route> {
    routes![generate::generate, list_services::list_services,]
}
