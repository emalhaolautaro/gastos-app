use crate::models::{Transaction, TransactionInput, TransactionUpdate};
use crate::AppState;
use tauri::State;

#[tauri::command]
pub fn get_transactions(state: State<AppState>) -> Result<Vec<Transaction>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = db
        .prepare(
            "SELECT id, description, amount, amount_in_ars, currency, exchange_rate,
                category_id, date, type, created_at, updated_at
         FROM transactions ORDER BY date DESC, id DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            let amount_cents: i64 = row.get(2)?;
            let amount_in_ars_cents: i64 = row.get(3)?;
            Ok(Transaction {
                id: row.get(0)?,
                description: row.get(1)?,
                amount: amount_cents as f64 / 100.0,
                amount_in_ars: amount_in_ars_cents as f64 / 100.0,
                currency: row.get(4)?,
                exchange_rate: row.get(5)?,
                category_id: row.get(6)?,
                date: row.get(7)?,
                r#type: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let result: Vec<Transaction> = rows
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(result)
}

#[tauri::command]
pub fn add_transaction(
    state: State<AppState>,
    input: TransactionInput,
) -> Result<Transaction, String> {
    input.validate()?;

    let db = state.db.lock().map_err(|e| e.to_string())?;

    // Verify that the category exists
    let category_exists: bool = db
        .query_row(
            "SELECT COUNT(*) > 0 FROM categories WHERE id = ?1",
            [input.category_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    if !category_exists {
        return Err(format!(
            "La categoría con id {} no existe",
            input.category_id
        ));
    }

    let now = chrono::Utc::now().to_rfc3339();

    // Convert floats to centavos for storage
    let amount_cents = (input.amount * 100.0).round() as i64;
    let amount_in_ars_cents = (input.amount_in_ars * 100.0).round() as i64;

    db.execute(
        "INSERT INTO transactions (description, amount, amount_in_ars, currency, exchange_rate,
         category_id, date, type, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            input.description,
            amount_cents,
            amount_in_ars_cents,
            input.currency,
            input.exchange_rate,
            input.category_id,
            input.date,
            input.r#type,
            &now,
            &now
        ],
    )
    .map_err(|e| e.to_string())?;

    let id = db.last_insert_rowid();

    Ok(Transaction {
        id,
        description: input.description,
        amount: input.amount,
        amount_in_ars: input.amount_in_ars,
        currency: input.currency,
        exchange_rate: input.exchange_rate,
        category_id: input.category_id,
        date: input.date,
        r#type: input.r#type,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn delete_transaction(state: State<AppState>, id: i64) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let affected = db
        .execute("DELETE FROM transactions WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;

    if affected == 0 {
        return Err(format!("Transacción con id {} no encontrada", id));
    }

    Ok(())
}

#[tauri::command]
pub fn update_transaction(
    state: State<AppState>,
    id: i64,
    input: TransactionUpdate,
) -> Result<Transaction, String> {
    input.validate()?;

    let db = state.db.lock().map_err(|e| e.to_string())?;

    // Verify that the category exists
    let category_exists: bool = db
        .query_row(
            "SELECT COUNT(*) > 0 FROM categories WHERE id = ?1",
            [input.category_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    if !category_exists {
        return Err(format!(
            "La categoría con id {} no existe",
            input.category_id
        ));
    }

    let now = chrono::Utc::now().to_rfc3339();

    // Convert floats to centavos for storage
    let amount_cents = (input.amount * 100.0).round() as i64;
    let amount_in_ars_cents = (input.amount_in_ars * 100.0).round() as i64;

    let affected = db
        .execute(
            "UPDATE transactions SET description = ?1, amount = ?2, amount_in_ars = ?3,
             currency = ?4, exchange_rate = ?5, category_id = ?6, date = ?7,
             type = ?8, updated_at = ?9
             WHERE id = ?10",
            rusqlite::params![
                input.description,
                amount_cents,
                amount_in_ars_cents,
                input.currency,
                input.exchange_rate,
                input.category_id,
                input.date,
                input.r#type,
                &now,
                id
            ],
        )
        .map_err(|e| e.to_string())?;

    if affected == 0 {
        return Err(format!("Transacción con id {} no encontrada", id));
    }

    // Return the updated transaction with the original created_at
    let created_at: String = db
        .query_row(
            "SELECT created_at FROM transactions WHERE id = ?1",
            [id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    Ok(Transaction {
        id,
        description: input.description,
        amount: input.amount,
        amount_in_ars: input.amount_in_ars,
        currency: input.currency,
        exchange_rate: input.exchange_rate,
        category_id: input.category_id,
        date: input.date,
        r#type: input.r#type,
        created_at,
        updated_at: now,
    })
}
