// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  println!("Starting Novaflow...");
  std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
  app_lib::run();
}
