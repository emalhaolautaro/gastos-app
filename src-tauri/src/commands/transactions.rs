use crate::models::{Transaction, TransactionInput};
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
            Ok(Transaction {
                id: row.get(0)?,
                description: row.get(1)?,
                amount: row.get(2)?,
                amount_in_ars: row.get(3)?,
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

    let result: Vec<Transaction> = rows.filter_map(|r| r.ok()).collect();

    Ok(result)
}

#[tauri::command]
pub fn add_transaction(
    state: State<AppState>,
    input: TransactionInput,
) -> Result<Transaction, String> {
    input.validate()?;

    let db = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    db.execute(
        "INSERT INTO transactions (description, amount, amount_in_ars, currency, exchange_rate,
         category_id, date, type, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            input.description,
            input.amount,
            input.amount_in_ars,
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
