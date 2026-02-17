use crate::models::{Category, CategoryInput, CategoryUpdate};
use crate::AppState;
use tauri::State;

#[tauri::command]
pub fn get_categories(state: State<AppState>) -> Result<Vec<Category>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = db
        .prepare("SELECT id, name, type, icon, color, is_default FROM categories ORDER BY id")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            let is_default_int: i32 = row.get(5)?;
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                r#type: row.get(2)?,
                icon: row.get(3)?,
                color: row.get(4)?,
                is_default: is_default_int != 0,
            })
        })
        .map_err(|e| e.to_string())?;

    let result: Vec<Category> = rows.filter_map(|r| r.ok()).collect();

    Ok(result)
}

#[tauri::command]
pub fn add_category(state: State<AppState>, input: CategoryInput) -> Result<Category, String> {
    input.validate()?;

    let db = state.db.lock().map_err(|e| e.to_string())?;

    db.execute(
        "INSERT INTO categories (name, type, icon, color, is_default) VALUES (?1, ?2, ?3, ?4, 0)",
        rusqlite::params![input.name, input.r#type, input.icon, input.color],
    )
    .map_err(|e| e.to_string())?;

    let id = db.last_insert_rowid();

    Ok(Category {
        id,
        name: input.name,
        r#type: input.r#type,
        icon: input.icon,
        color: input.color,
        is_default: false,
    })
}

#[tauri::command]
pub fn update_category(
    state: State<AppState>,
    id: i64,
    updates: CategoryUpdate,
) -> Result<Category, String> {
    updates.validate()?;

    let db = state.db.lock().map_err(|e| e.to_string())?;

    let affected = db
        .execute(
            "UPDATE categories SET name = ?1, type = ?2, icon = ?3, color = ?4 WHERE id = ?5",
            rusqlite::params![
                updates.name,
                updates.r#type,
                updates.icon,
                updates.color,
                id
            ],
        )
        .map_err(|e| e.to_string())?;

    if affected == 0 {
        return Err(format!("Categoría con id {} no encontrada", id));
    }

    // Re-fetch to get the is_default flag
    let cat = db
        .query_row(
            "SELECT id, name, type, icon, color, is_default FROM categories WHERE id = ?1",
            [id],
            |row| {
                let is_default_int: i32 = row.get(5)?;
                Ok(Category {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    r#type: row.get(2)?,
                    icon: row.get(3)?,
                    color: row.get(4)?,
                    is_default: is_default_int != 0,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(cat)
}

#[tauri::command]
pub fn delete_category(state: State<AppState>, id: i64) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    // Check if category has transactions
    let tx_count: i64 = db
        .query_row(
            "SELECT COUNT(*) FROM transactions WHERE category_id = ?1",
            [id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    if tx_count > 0 {
        return Err(format!(
            "No se puede eliminar: la categoría tiene {} transacciones asociadas",
            tx_count
        ));
    }

    let affected = db
        .execute("DELETE FROM categories WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;

    if affected == 0 {
        return Err(format!("Categoría con id {} no encontrada", id));
    }

    Ok(())
}
