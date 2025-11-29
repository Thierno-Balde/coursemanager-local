export type ResourceKind = 'file' | 'link' | 'cloud';
export type ResourceCategory = 'main' | 'pdfs' | 'videos' | 'extras';
export type ResourceFormat = 'ppt' | 'pdf' | 'video' | 'image' | 'link' | 'zip' | 'other';

export interface Resource {
  id: string;
  label: string;
  kind: ResourceKind;
  category: ResourceCategory;
  format?: ResourceFormat | string;
  path?: string; // absolute path for local files
  relativePath?: string; // relative to userData/resources for cleanup
  url?: string; // web URL or custom provider URL
  provider?: string;
  createdAt: string;
}

export interface CourseItem {
  id: string;
  title: string;
  description?: string;
  resources: Resource[];
}

export interface Course {
  id: string;
  name: string;
  description: string;
  icon?: string; // Icon name for the UI
  items: CourseItem[];
}

export interface AppData {
  courses: Course[];
}

declare global {
  interface Window {
    electronAPI?: {
      getData: () => Promise<AppData>;
      saveData: (data: AppData) => Promise<{ success?: boolean; error?: string } | void>;
      selectFile: () => Promise<{ path: string; name: string } | null>; // legacy
      getResourcesDir: () => string | null;
      importResourceFile: () => Promise<{
        id: string;
        name: string;
        format?: string;
        absolutePath?: string;
        relativePath?: string;
        error?: string;
      } | null>;
      deleteResourceFile: (relativePath: string) => Promise<{ success: boolean; error?: string } | void>;
      openPath: (path: string) => Promise<string>;
    };
    // Legacy alias kept for backward compatibility with preload
    api?: Window['electronAPI'];
  }
}
