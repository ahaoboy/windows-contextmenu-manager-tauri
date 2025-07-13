use wcm::{Manager, Type};

#[tauri::command]
fn list(ty: Type) -> Vec<wcm::MenuItem> {
    ty.list()
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
fn disable(ty: Type, id: String) -> Vec<wcm::MenuItem> {
    // let v = ty.list();
    // let Some(item) = v.iter().find(|i| i.id == id) else {
    //     return v;
    // };

    ty.disable(&id, wcm::BlockScope::User);
    ty.list()
}
#[tauri::command]
fn enable(ty: Type, id: String) -> Vec<wcm::MenuItem> {
    // let v = ty.list();
    // let Some(item) = v.iter().find(|i| i.id == id) else {
    //     return v;
    // };

    ty.enable(&id, wcm::BlockScope::User);
    ty.list()
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
            restart_explorer
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
