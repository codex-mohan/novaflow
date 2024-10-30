use rocket::State;
use rocket::{fairing::AdHoc, get};
use std::sync::{Arc, Mutex};

// Example: Application state holding a simple counter
pub struct AppState {
    pub visit_count: Mutex<i32>,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            visit_count: Mutex::new(0),
        }
    }
}

// Fairing to initialize and attach the AppState
pub fn init() -> AdHoc {
    AdHoc::on_ignite("State Initialization", |rocket| async {
        let state = AppState::new();
        rocket.manage(Arc::new(state))
    })
}

// Function to access and increment the counter
#[get("/count")]
pub async fn visit_count(state: &State<Arc<AppState>>) -> String {
    let mut count = state.visit_count.lock().unwrap();
    *count += 1;
    format!("Visitor count: {}", count)
}
