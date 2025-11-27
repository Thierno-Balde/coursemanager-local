export type ResourceType = 'ppt' | 'pdf' | 'video' | 'image' | 'link' | 'zip' | 'other';

export interface Resource {
  label: string;
  type: ResourceType;
  url: string; // Can be a local path "files/..." or a web URL "https://..."
  description?: string;
}

export interface CourseItem {
  id: string;
  title: string;
  description?: string;
  main: Resource;      // Column 1
  pdfs: Resource[];    // Column 2
  videos: Resource[];  // Column 3
  extras: Resource[];  // Column 4
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
    electronAPI: {
      selectFile: () => Promise<{ path: string; name: string } | null>;
      openPath: (path: string) => Promise<string>;
    };
  }
}