import { invoke } from "@tauri-apps/api/core";

export function base64ToImageUrl(
  data: string | undefined,
  mimeType = "image/png",
): string {
  if (!data) {
    return "/empty.png";
  }
  return `data:${mimeType};base64,${data}`;
}

export type Type = "Win10" | "Win11";
export type Scope = "User" | "Machine";
export type Scene =
  | "File"
  | "Folder"
  | "Desktop"
  | "Directory"
  | "Background"
  | "Drive"
  | "AllObjects"
  | "Computer"
  | "RecycleBin"
  | "Library"
  | "LibraryBackground"
  | "User"
  | "Uwp"
  | "SystemFileAssociations";
// | "Unknown";
export const SceneList: Scene[] = [
  "File",
  "Folder",
  "Desktop",
  "Directory",
  "Background",
  "Drive",
  "AllObjects",
  "Computer",
  "RecycleBin",
  "Library",
  "LibraryBackground",
  "User",
  "Uwp",
  "SystemFileAssociations",
  // "Unknown",
];
export function get_registry_path(scene: Scene) {
  switch (scene) {
    case "File":
      return ["*\\shell", "*\\ShellEx", "*\\OpenWithList"];
    case "Folder":
      return ["Folder\\shell", "Folder\\ShellEx"];
    case "Background":
      return ["Directory\\Background\\Shell", "Directory\\Background\\ShellEx"];
    case "Directory":
      return ["Directory\\Shell", "Directory\\ShellEx"];
    case "Desktop":
      return ["DesktopBackground\\Shell", "DesktopBackground\\ShellEx"];
    case "Drive":
      return ["Drive\\Shell", "Drive\\ShellEx"];
    case "AllObjects":
      return ["AllFilesystemObjects"];
    case "Computer":
      return ["CLSID\\{20D04FE0-3AEA-1069-A2D8-08002B30309D}"];
    case "RecycleBin":
      return ["CLSID\\{645FF040-5081-101B-9F08-00AA002F954E}"];
    case "Library":
      return ["LibraryFolder"];
    case "LibraryBackground":
      return ["LibraryFolder\\Background"];
    case "User":
      return ["UserLibraryFolder"];
    case "Uwp":
      return ["Launcher.ImmersiveApplication"];
    case "SystemFileAssociations":
      return ["SystemFileAssociations"];
    // case "Unknown":
    default:
      return ["Unknown"];
  }
}

export type TypeItem = {
  id: string;
  clsid: string;
  ty: string;
};
export type MenuItemInfo = {
  icon: string | undefined;
  publisher_display_name: string;
  description: string;
  types: TypeItem[];
  family_name: string;
  install_path: string;
  full_name: string;
};

export type MenuItem = {
  id: string;
  name: string;
  enabled: boolean;
  info?: MenuItemInfo;
};

export function restart_explorer() {
  return invoke("restart_explorer");
}
export function enable_classic_menu() {
  return invoke("enable_classic_menu");
}
export function disable_classic_menu() {
  return invoke("disable_classic_menu");
}
export function is_admin() {
  return invoke<boolean>("is_admin");
}
export function menu_type() {
  return invoke<Type>("menu_type");
}
export function enable(ty: Type, id: string, scope: Scope) {
  return invoke("enable", { ty, id, scope });
}
export function disable(ty: Type, id: string, scope: Scope) {
  return invoke("disable", { ty, id, scope });
}
export function list(ty: Type, scope: Scope) {
  return invoke<MenuItem[]>("list", { ty, scope });
}
export function open_file_location(path: string) {
  return invoke("open_file_location", { path });
}
export function open_app_settings() {
  return invoke("open_app_settings");
}
export function open_store(name: string) {
  return invoke("open_store", { name });
}

export function uninstall(fullname: string) {
  return invoke("uninstall", { fullname });
}
export function backup(ty: Type, scope: Scope) {
  return invoke<string>("backup", { ty, scope });
}
export const ScopeList: Scope[] = [
  "User",
  "Machine",
];

export function download(s: string, filename = "backup.json") {
  const blob = new Blob([s], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
