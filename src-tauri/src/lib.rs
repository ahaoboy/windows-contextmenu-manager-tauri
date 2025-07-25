use std::process::Command;
use tauri::Manager as _;
use wcm::{Manager, Scope, Type};

#[tauri::command]
fn list(ty: Type, scope: Option<Scope>) -> Vec<wcm::MenuItem> {
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
fn disable(ty: Type, id: String, scope: Option<Scope>) {
    let _ = ty.disable(&id, scope);
}

#[tauri::command]
fn enable(ty: Type, id: String, scope: Option<Scope>) {
    let _ = ty.enable(&id, scope);
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
    let uri = format!("ms-windows-store://pdp/?PFN={name}");
    let _ = Command::new("powershell")
        .args(["-c", &format!("start {uri}")])
        .spawn();
}

#[tauri::command]
fn uninstall(fullname: &str) {
    let cmd = format!("Remove-AppxPackage {fullname} -Confirm");

    let _ = Command::new("cmd")
        .args(["/C", "start", "powershell", "-NoExit", "-Command", &cmd])
        .spawn();
}

#[tauri::command]
fn backup(ty: Type, scope: Option<Scope>) -> String {
    let v = ty.list(scope);

    serde_json::to_string(&v).unwrap_or_default()
}

// FIXME: download utf16le bom file from web
#[tauri::command]
fn export_reg_zip(path: &str, filename: &str) -> Vec<u8> {
    let buffer = wcm::export_reg(path).unwrap_or_default();
    let files = easy_archive::File {
        buffer,
        path: filename.to_string(),
        mode: None,
        is_dir: false,
        last_modified: None,
    };

    easy_archive::Fmt::Zip
        .encode(vec![files])
        .unwrap_or_default()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            let name = env!("CARGO_PKG_NAME");
            let version = env!("CARGO_PKG_VERSION");
            let title = format!("{} v{}", name, version);

            let _ = window.set_title(&title);
            Ok(())
        })
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
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
            backup,
            export_reg_zip
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
