use std::process::Command;
use wcm::{Manager, Scope, Type};

#[tauri::command]
fn list(ty: Type, scope: Scope) -> Vec<wcm::MenuItem> {
    ty.list(Some(scope))
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
fn disable(ty: Type, id: String, scope: Scope)   {
    let _ = ty.disable(&id, Some(scope));
}

#[tauri::command]
fn enable(ty: Type, id: String, scope: Scope)  {
    let _ = ty.enable(&id, Some(scope));
}

#[tauri::command]
fn is_admin() -> bool {
    is_admin::is_admin()
}

#[tauri::command]
fn open_file_location(path: &str) {
    let _ = Command::new("explorer")
        // .arg("/select,")
        .arg(path)
        .spawn();
}
#[tauri::command]
fn open_app_settings() {
    let _ = Command::new("powershell")
        .args(["-c", "start ms-settings:appsfeatures"])
        .spawn();
}
#[tauri::command]
fn open_store(name: &str) {
    let uri = format!("ms-windows-store://pdp/?PFN={}", name);
    let _ = Command::new("powershell")
        .args(["-c", &format!("start {uri}")])
        .spawn();
}

#[tauri::command]
fn uninstall(fullname: &str) {
    let cmd = format!("Remove-AppxPackage {} -Confirm", fullname);

    let _ = Command::new("cmd")
        .args(["/C", "start", "powershell", "-NoExit", "-Command", &cmd])
        .spawn();
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
            open_file_location,
            open_app_settings,
            open_store,
            uninstall,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
