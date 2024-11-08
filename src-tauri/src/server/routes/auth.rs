use crate::server::db::db::{Record, UserDatabase};
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

async fn signup(State(database): State<Arc<UserDatabase>>, Json(request): Json<SignupRequest>) {
    database
        .create_user(
            &request.first_name,
            &request.middle_name,
            &request.last_name,
            &request.username,
            &request.password,
            &request.email,
        )
        .await
        .expect("failed adding user");
}
