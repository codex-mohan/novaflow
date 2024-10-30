use rocket::get;

#[get("/generate")]
pub fn generate() -> &'static str {
    "Welcome to the Generate page"
}
