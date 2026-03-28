export interface DesktopItem {
  id: string;
  name: string;
  type: "file" | "folder" | "app";
  icon?: string;
  x: number;
  y: number;
  parentId: string | null; // null = desktop
  content?: string; // for text files
  appId?: string; // for app shortcuts
  createdAt: number;
  modifiedAt: number;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  data?: Record<string, unknown>; // app-specific data (e.g., folderId for Finder)
}

export type ContextMenuState = {
  x: number;
  y: number;
  items: ContextMenuItem[];
} | null;

export interface ContextMenuItem {
  label: string;
  action: () => void;
  separator?: boolean;
  disabled?: boolean;
}
