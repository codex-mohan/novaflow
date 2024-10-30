pub mod routes;
pub mod state;

use rocket::{Build, Config, Rocket};

pub fn launch_server() -> Rocket<Build> {
    let config = Config {
        port: 7777,
        ..Default::default()
    };
    println!("Starting server...");
    rocket::build()
        .mount("/", routes::all_routes())
        .attach(state::init())
        .configure(config)
}
