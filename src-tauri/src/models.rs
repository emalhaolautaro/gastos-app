use serde::{Deserialize, Serialize};

const MAX_DESCRIPTION_LEN: usize = 255;
const MAX_NAME_LEN: usize = 100;
const MAX_ICON_LEN: usize = 50;
const VALID_TYPES: [&str; 2] = ["income", "expense"];
const VALID_CURRENCIES: [&str; 2] = ["ARS", "USD"];
const HEX_COLOR_LEN: usize = 7; // "#rrggbb"

// --- Category ---

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub r#type: String,
    pub icon: String,
    pub color: String,
    pub is_default: bool,
}

/// Input for creating a new category (no id, no is_default)
#[derive(Debug, Deserialize)]
pub struct CategoryInput {
    pub name: String,
    pub r#type: String,
    pub icon: String,
    pub color: String,
}

impl CategoryInput {
    pub fn validate(&self) -> Result<(), String> {
        validate_name(&self.name)?;
        validate_type(&self.r#type)?;
        validate_icon(&self.icon)?;
        validate_color(&self.color)?;
        Ok(())
    }
}

/// Input for updating an existing category
#[derive(Debug, Deserialize)]
pub struct CategoryUpdate {
    pub name: String,
    pub r#type: String,
    pub icon: String,
    pub color: String,
}

impl CategoryUpdate {
    pub fn validate(&self) -> Result<(), String> {
        validate_name(&self.name)?;
        validate_type(&self.r#type)?;
        validate_icon(&self.icon)?;
        validate_color(&self.color)?;
        Ok(())
    }
}

// --- Transaction ---

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: i64,
    pub description: String,
    pub amount: f64,
    pub amount_in_ars: f64,
    pub currency: String,
    pub exchange_rate: Option<f64>,
    pub category_id: i64,
    pub date: String,
    pub r#type: String,
    pub created_at: String,
    pub updated_at: String,
}

/// Input for creating a new transaction (no id, no timestamps)
#[derive(Debug, Deserialize)]
pub struct TransactionInput {
    pub description: String,
    pub amount: f64,
    pub amount_in_ars: f64,
    pub currency: String,
    pub exchange_rate: Option<f64>,
    pub category_id: i64,
    pub date: String,
    pub r#type: String,
}

impl TransactionInput {
    pub fn validate(&self) -> Result<(), String> {
        // Description
        let desc = self.description.trim();
        if desc.is_empty() {
            return Err("La descripción no puede estar vacía".into());
        }
        if desc.len() > MAX_DESCRIPTION_LEN {
            return Err(format!(
                "La descripción no puede superar {} caracteres",
                MAX_DESCRIPTION_LEN
            ));
        }

        // Amount
        if self.amount <= 0.0 {
            return Err("El monto debe ser mayor a 0".into());
        }
        if !self.amount.is_finite() {
            return Err("El monto no es un número válido".into());
        }

        // Amount in ARS
        if self.amount_in_ars <= 0.0 {
            return Err("El monto en ARS debe ser mayor a 0".into());
        }
        if !self.amount_in_ars.is_finite() {
            return Err("El monto en ARS no es un número válido".into());
        }

        // Currency
        if !VALID_CURRENCIES.contains(&self.currency.as_str()) {
            return Err(format!(
                "Moneda inválida: '{}'. Debe ser ARS o USD",
                self.currency
            ));
        }

        // Exchange rate
        if self.currency == "USD" {
            match self.exchange_rate {
                Some(rate) if rate <= 0.0 => {
                    return Err("La cotización debe ser mayor a 0".into());
                }
                Some(rate) if !rate.is_finite() => {
                    return Err("La cotización no es un número válido".into());
                }
                None => {
                    return Err("La cotización es obligatoria para transacciones en USD".into());
                }
                _ => {}
            }
        }

        // Type
        validate_type(&self.r#type)?;

        // Date (basic ISO 8601 check)
        if self.date.trim().is_empty() {
            return Err("La fecha no puede estar vacía".into());
        }

        // Category ID
        if self.category_id <= 0 {
            return Err("Debe seleccionar una categoría válida".into());
        }

        Ok(())
    }
}

/// Update uses the same fields and validation as Input
pub type TransactionUpdate = TransactionInput;

// --- Shared validation helpers ---

fn validate_name(name: &str) -> Result<(), String> {
    let name = name.trim();
    if name.is_empty() {
        return Err("El nombre no puede estar vacío".into());
    }
    if name.len() > MAX_NAME_LEN {
        return Err(format!(
            "El nombre no puede superar {} caracteres",
            MAX_NAME_LEN
        ));
    }
    Ok(())
}

fn validate_type(t: &str) -> Result<(), String> {
    if !VALID_TYPES.contains(&t) {
        return Err(format!(
            "Tipo inválido: '{}'. Debe ser 'income' o 'expense'",
            t
        ));
    }
    Ok(())
}

fn validate_icon(icon: &str) -> Result<(), String> {
    let icon = icon.trim();
    if icon.is_empty() {
        return Err("El ícono no puede estar vacío".into());
    }
    if icon.len() > MAX_ICON_LEN {
        return Err(format!(
            "El nombre del ícono no puede superar {} caracteres",
            MAX_ICON_LEN
        ));
    }
    // Icon names are PascalCase identifiers (letters only)
    if !icon.chars().all(|c| c.is_ascii_alphanumeric()) {
        return Err("El nombre del ícono solo puede contener letras y números".into());
    }
    Ok(())
}

fn validate_color(color: &str) -> Result<(), String> {
    let color = color.trim();
    if color.len() != HEX_COLOR_LEN || !color.starts_with('#') {
        return Err(format!(
            "Color inválido: '{}'. Debe ser formato #rrggbb",
            color
        ));
    }
    if !color[1..].chars().all(|c| c.is_ascii_hexdigit()) {
        return Err(format!(
            "Color inválido: '{}'. Debe contener solo dígitos hexadecimales",
            color
        ));
    }
    Ok(())
}
