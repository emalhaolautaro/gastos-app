use rusqlite::{Connection, Result};
use tauri::Manager;

/// Initialize the database: create tables and seed default categories.
pub fn init_db(app: &tauri::App) -> Result<Connection, Box<dyn std::error::Error>> {
    let app_dir = app.path().app_data_dir()?;
    std::fs::create_dir_all(&app_dir)?;

    let db_path = app_dir.join("gastos.db");
    let conn = Connection::open(db_path)?;

    // Enable WAL mode for better concurrent read performance
    conn.execute_batch("PRAGMA journal_mode=WAL;")?;

    // Enforce foreign key constraints (SQLite does NOT enforce them by default)
    conn.execute_batch("PRAGMA foreign_keys = ON;")?;

    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
            icon TEXT NOT NULL,
            color TEXT NOT NULL,
            is_default INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            amount INTEGER NOT NULL,
            amount_in_ars INTEGER NOT NULL,
            currency TEXT NOT NULL CHECK(currency IN ('ARS', 'USD')),
            exchange_rate REAL,
            category_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );

        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);",
    )?;

    // Seed default categories if table is empty
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM categories", [], |row| row.get(0))?;
    if count == 0 {
        seed_default_categories(&conn)?;
    }

    Ok(conn)
}

fn seed_default_categories(conn: &Connection) -> Result<()> {
    let defaults = [
        // Expenses
        ("Alimentación", "expense", "Utensils", "#f87171"),
        ("Transporte", "expense", "Car", "#fb923c"),
        ("Vivienda", "expense", "Home", "#facc15"),
        ("Servicios", "expense", "Zap", "#a3e635"),
        ("Entretenimiento", "expense", "Gamepad2", "#22d3ee"),
        ("Salud", "expense", "Heart", "#f472b6"),
        ("Educación", "expense", "GraduationCap", "#818cf8"),
        ("Compras", "expense", "ShoppingBag", "#2dd4bf"),
        ("Otros", "expense", "MoreHorizontal", "#9ca3af"),
        // Income
        ("Salario", "income", "Briefcase", "#4ade80"),
        ("Freelance", "income", "Laptop", "#34d399"),
        ("Inversiones", "income", "TrendingUp", "#60a5fa"),
        ("Regalo", "income", "Gift", "#c084fc"),
        ("Otros Ingresos", "income", "Plus", "#94a3b8"),
    ];

    for (name, cat_type, icon, color) in defaults {
        conn.execute(
            "INSERT INTO categories (name, type, icon, color, is_default) VALUES (?1, ?2, ?3, ?4, 1)",
            rusqlite::params![name, cat_type, icon, color],
        )?;
    }

    Ok(())
}
