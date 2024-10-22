// use tauri::Wry;
// use tauri_plugin_store::StoreExt;
// use serde_json::json;

// #[cfg_attr(mobile, tauri::mobile_entry_point)]
// pub fn manage_settings(){
//     tauri::Builder::default().plugin(tauri_plugin_store::Builder::default().build()).setup(|app|{
//         let store = app.store("settings.json")?;
//         store.set("window_width", json!({"value":1500}));
//         store.set("window_height", json!({"value":1080}));

//         store.close_resource();

//         Ok(())
//     }).run(tauri::generate_context!()).expect("error processing settings")

// }
