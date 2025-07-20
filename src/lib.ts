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
  | "SystemFileAssociations"
  | "PropertySheetHandlers"
  | "DragDropHandlers"
  | "CopyHookHandlers"
  // | "ContextMenuHandlers"
  | "Unknown";

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
  "PropertySheetHandlers",
  "DragDropHandlers",
  "CopyHookHandlers",
  // "ContextMenuHandlers",
  "Unknown",
];

export function match_scene(path: string): Scene {
  const s = path.toLowerCase().replace(/\\/g, "/");

  if (s.includes("ShellEx/PropertySheetHandlers".toLowerCase())) {
    return "PropertySheetHandlers";
  }

  if (s.includes("ShellEx/DragDropHandlers".toLowerCase())) {
    return "DragDropHandlers";
  }
  if (s.includes("ShellEx/CopyHookHandlers".toLowerCase())) {
    return "CopyHookHandlers";
  }
  // if (s.includes("ShellEx/ContextMenuHandlers".toLowerCase())) {
  //   return "ContextMenuHandlers";
  // }

  if (s.startsWith("*")) {
    return "File";
  }
  if (s.startsWith("Folder".toLowerCase())) {
    return "Folder";
  }
  if (s.startsWith("DesktopBackground".toLowerCase())) {
    return "Desktop";
  }
  if (s.startsWith("Directory/Background".toLowerCase())) {
    return "Background";
  }
  if (s.startsWith("Directory".toLowerCase())) {
    return "Directory";
  }
  if (s.startsWith("Drive".toLowerCase())) {
    return "Drive";
  }
  if (s.startsWith("AllFilesystemObjects".toLowerCase())) {
    return "AllObjects";
  }
  if (
    s.startsWith("CLSID/{20D04FE0-3AEA-1069-A2D8-08002B30309D}".toLowerCase())
  ) {
    return "Computer";
  }
  if (
    s.startsWith("CLSID/{645FF040-5081-101B-9F08-00AA002F954E}".toLowerCase())
  ) {
    return "RecycleBin";
  }

  if (s.startsWith("LibraryFolder".toLowerCase())) {
    return "Library";
  }
  if (s.startsWith("LibraryFolder/Background".toLowerCase())) {
    return "LibraryBackground";
  }
  if (s.startsWith("UserLibraryFolder".toLowerCase())) {
    return "User";
  }
  if (s.startsWith("Launcher.ImmersiveApplication".toLowerCase())) {
    return "Uwp";
  }
  if (s.startsWith("SystemFileAssociations".toLowerCase())) {
    return "SystemFileAssociations";
  }
  return "Unknown";
}

export type TypeItem = {
  id: string;
  clsid: string;
  ty: string;
};

export type RegItem = {
  path: string
  values: Record<string, string>;
  children?: RegItem[];
}

export type MenuItemInfo = {
  icon: string | undefined;
  publisher_display_name: string;
  description: string;
  types: TypeItem[];
  family_name: string;
  install_path: string;
  full_name: string;
  reg: RegItem | undefined
  reg_txt: string | undefined
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
export async function export_reg_zip(path: string, filename: string) {
  return new Uint8Array(
    await invoke<Uint8Array>("export_reg_zip", { path, filename }),
  );
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

export function normalizeAmpersands(input: string) {
  return input
    .replace(/&&/g, "\u0000")
    .replace(/&/g, "")
    .replace(/\u0000/g, "&");
}

function downloadUTF16LEFile(data: Uint8Array, filename: string) {
  const blob = new Blob([data], { type: "application/octet-stream" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export async function downloadReg(item: MenuItem) {
  const filename =
    [item.name, new Date().toLocaleDateString()].join("_").replaceAll(
      "/",
      "_",
    ) + ".reg";
  const zipname =
    [item.name, new Date().toLocaleDateString()].join("_").replaceAll(
      "/",
      "_",
    ) + ".zip";
  const bin = await export_reg_zip(item.id, filename);
  downloadUTF16LEFile(bin, zipname);
}
