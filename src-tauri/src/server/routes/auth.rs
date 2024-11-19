use crate::db::user_db::{UserCredentials, UserDatabase};
use axum::{extract::State, response::Json, routing::post, Router};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

pub fn auth_route(database: Arc<UserDatabase>) -> Router {
    Router::new()
        .route("/auth/signup", post(signup).with_state(database))
        .route("/auth/login", post(login))
}

#[derive(Serialize, Deserialize)]
struct LoginRequest {
    username: String,
    password: String,
}

#[derive(Serialize, Deserialize)]
struct SignupRequest {
    first_name: String,
    middle_name: String,
    last_name: String,
    username: String,
    password: String,
    email: String,
}

async fn login() {}

async fn signup() {}
