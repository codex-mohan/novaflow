use rocket::get;

#[get("/list-services")]
pub fn list_services() -> &'static str {
    "Welcome to the services page"
}
