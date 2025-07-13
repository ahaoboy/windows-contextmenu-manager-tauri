use wcm::{Manager, Scope, Type};

#[tauri::command]
fn list(ty: Type, scope: Scope) -> Vec<wcm::MenuItem> {
    ty.list(scope)
}

#[tauri::command]
fn menu_type() -> Type {
    Type::menu_type()
}

#[tauri::command]
fn restart_explorer() {
    wcm::restart_explorer()
}

#[tauri::command]
fn enable_classic_menu() {
    let _ = Type::enable_classic_menu();
}

#[tauri::command]
fn disable_classic_menu() {
    let _ = Type::disable_classic_menu();
}

#[tauri::command]
fn disable(ty: Type, id: String, scope: Scope) -> Vec<wcm::MenuItem> {
    let _ = ty.disable(&id, scope);
    ty.list(scope)
}

#[tauri::command]
fn enable(ty: Type, id: String, scope: Scope) -> Vec<wcm::MenuItem> {
    let _ = ty.enable(&id, scope);
    ty.list(scope)
}

#[tauri::command]
fn is_admin() -> bool {
    is_admin::is_admin()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            list,
            menu_type,
            disable,
            enable,
            restart_explorer,
            is_admin,
            enable_classic_menu,
            disable_classic_menu,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
