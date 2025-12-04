export type RessourceType = 'ppt' | 'pdf' | 'video' | 'lien';
export type RessourceRole = 'principal' | 'annexe';
export type RessourceStockage = 'local' | 'cloud';

export interface Ressource {
  id: string;
  titre: string;
  type: RessourceType;
  role: RessourceRole;
  stockage: RessourceStockage;
  chemin?: string; // Chemin relatif si local
  url?: string; // URL si cloud/web
  notes?: string;
}

export interface Module {
  id: string;
  titre: string;
  description?: string;
  ressources: Ressource[];
}

export interface Formation {
  id: string;
  titre: string;
  description?: string;
  modules: Module[];
}

export interface Settings {
  rootDirectory: string; // Dossier racine absolu sur la machine
}

export interface AppData {
  formations: Formation[];
  settings: Settings;
}

// Type pour la réponse de l'API Electron
export interface ElectronAPIResponse {
  success: boolean;
  error?: string;
  data?: any;
}

declare global {
  interface Window {
    electronAPI: {
      getData: () => Promise<AppData>;
      saveData: (data: AppData) => Promise<ElectronAPIResponse>;
      selectDirectory: () => Promise<string | null>; // Pour choisir le dossier racine
      openPath: (path: string) => Promise<string>; // Ouvre un fichier ou une URL
      // Settings
      setRoot: (path: string) => Promise<{ success: boolean; error?: string }>;
      getRoot: () => Promise<string>;
      // Resources
      importFile: () => Promise<{ id: string; name: string; format: string; absolutePath: string; relativePath: string; error?: string } | null>;
      deleteResource: (relativePath: string) => Promise<{ success: boolean; error?: string }>;
      // Legacy / Utilitaires
      getAppVersion: () => Promise<string>;
    };
  }
}
