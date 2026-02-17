use std::sync::Mutex;
use tauri::Manager;

mod commands;
mod db;
mod models;

pub struct AppState {
    pub db: Mutex<rusqlite::Connection>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let conn = db::init_db(app).expect("Error al inicializar la base de datos");

            app.manage(AppState {
                db: Mutex::new(conn),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Transactions
            commands::transactions::get_transactions,
            commands::transactions::add_transaction,
            commands::transactions::delete_transaction,
            commands::transactions::update_transaction,
            // Categories
            commands::categories::get_categories,
            commands::categories::add_category,
            commands::categories::update_category,
            commands::categories::delete_category,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
