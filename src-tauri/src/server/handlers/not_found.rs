// handlers.rs
use axum::http::StatusCode;
use axum::response::Json;
use serde::Serialize;

#[derive(Serialize)]
pub struct ErrorResponse {
    error: String,
    message: String,
}

// A handler function for non-existent routes that returns a JSON response
pub async fn not_found_handler() -> (StatusCode, Json<ErrorResponse>) {
    let error_response = ErrorResponse {
        error: "404".to_string(),
        message: "Page Not Found".to_string(),
    };

    (StatusCode::NOT_FOUND, Json(error_response))
}
