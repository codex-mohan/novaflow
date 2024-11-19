pub mod llms;

use std::path::PathBuf;

pub fn get_database_path(db_name: &str) -> PathBuf {
    // let app_dir = BaseDirectory::AppData.variable();
    let mut path = PathBuf::from("~/novaflow/db/");
    path.push(db_name);
    path
}
