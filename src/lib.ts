import { invoke } from "@tauri-apps/api/core";
import { Buffer } from "buffer";
import { encode, File, Fmt } from "@easy-install/easy-archive";
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
  | "Edge"
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
  "Edge",
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
  if (s.startsWith("SOFTWARE/Policies/Microsoft/Edge".toLowerCase())) {
    return "Edge";
  }
  return "Unknown";
}

export type TypeItem = {
  id: string;
  clsid: string;
  ty: string;
};

export type RegItem = {
  path: string;
  values: Record<string, string>;
  children?: RegItem[];
};

export type MenuItemInfo = {
  icon: string | undefined;
  publisher_display_name: string;
  description: string;
  types: TypeItem[];
  family_name: string;
  install_path: string;
  full_name: string;
  reg: RegItem | undefined;
  reg_txt: string | undefined;
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

export function downloadJson(s: string, filename = "backup.json") {
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

const HACK_CHAR = "𰻞"; // A character that is unlikely to appear in normal text
export function normalizeAmpersands(input: string) {
  return input
    .replace("&&", HACK_CHAR)
    .replace("&", "")
    .replace(HACK_CHAR, "&");
}

function getRegName(item: MenuItem, type: Type, scope?: Scope) {
  const filename = [
    item.name,
    new Date().toLocaleDateString(),
    type,
    item.enabled ? "enable" : "disable",
  ];
  if (scope) {
    filename.push(scope);
  }
  filename.push(item.id.replaceAll("\\", "_").replaceAll("/", "_"));
  return filename.join("_").replaceAll(
    "/",
    "_",
  ) + ".reg";
}

function getRegContent(item: MenuItem, type: Type, scope?: Scope) {
  const HEADER = `Windows Registry Editor Version 5.00\n`;
  const v: string[] = [];

  if (type === "Win11") {
    v.push(HEADER);
    const root = scope === "Machine"
      ? "HKEY_LOCAL_MACHINE"
      : "HKEY_CURRENT_USER";
    const blocked =
      `Software\\Microsoft\\Windows\\CurrentVersion\\Shell Extensions\\Blocked`;
    v.push(`[${root}\\${blocked}]`);
    if (item.enabled) {
      v.push(`"{${item.id}}"=-`);
    } else {
      v.push(`"{${item.id}}"=""`);
    }
  } else if (type === "Win10") {
    if (item.enabled) {
      v.push(item.info?.reg_txt || "");
    } else {
      v.push(HEADER);
      const root = "HKEY_CLASSES_ROOT";
      v.push(`[-${root}\\${item.id}]`);
    }
  }
  return v.join("\n");
}

export function downloadReg(item: MenuItem, type: Type, scope?: Scope) {
  const filename = getRegName(item, type, scope);
  const txt = getRegContent(item, type, scope);
  const bin = stringToUtf16LeWithBom(txt || "");
  downloadBinary(bin, filename);
}

export function downloadAllReg(
  items: MenuItem[],
  type: Type,
  scope?: Scope,
) {
  const zipName = [type, new Date().toISOString(), "backup"].join("_") + ".zip";

  const files = items.map((i) => {
    const filename = getRegName(i, type, scope);
    const txt = getRegContent(i, type, scope);
    return new File(
      filename,
      stringToUtf16LeWithBom(txt),
      undefined,
      false,
      undefined,
    );
  });

  const bin = encode(Fmt.Zip, files);
  if (!bin) {
    throw new Error("zip error");
  }

  downloadBinary(bin, zipName);
}

export const truncateText = (text: string, maxLength = 48) => {
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
};

function stringToUtf16LeWithBom(text: string) {
  const bom = Buffer.from([0xFF, 0xFE]);

  const content = Buffer.from(text, "utf16le");

  const fullBuffer = Buffer.concat([bom, content]);

  return new Uint8Array(fullBuffer);
}

const downloadBinary = (bin: Uint8Array, fileName: string) => {
  const blob = new Blob([new Uint8Array(bin)], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
