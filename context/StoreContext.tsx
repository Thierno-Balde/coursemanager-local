import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Formation, Module, Ressource, Settings, AppData } from '../types';

interface StoreContextType {
  formations: Formation[];
  settings: Settings;
  addFormation: (formation: Formation) => void;
  updateFormation: (id: string, formation: Partial<Formation>) => void;
  deleteFormation: (id: string) => void;
  addModule: (formationId: string, module: Module) => void;
  updateModule: (formationId: string, moduleId: string, module: Partial<Module>) => void;
  deleteModule: (formationId: string, moduleId: string) => void;
  addRessource: (formationId: string, moduleId: string, ressource: Ressource) => void;
  updateRessource: (formationId: string, moduleId: string, ressourceId: string, ressource: Partial<Ressource>) => void;
  deleteRessource: (formationId: string, moduleId: string, ressourceId: string) => void;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  exportData: () => string; // New method for exporting data
  importData: (data: string) => void; // New method for importing data
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const defaultSettings: Settings = {
  rootDirectory: '',
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const loadData = async () => {
      if (window.electronAPI) {
        try {
          const [data, rootDir] = await Promise.all([
            window.electronAPI.getData(),
            window.electronAPI.getRoot()
          ]);

          if (data) {
            setFormations(data.formations || []);
            setSettings({
              ...(data.settings || defaultSettings),
              rootDirectory: rootDir || ''
            });
          }
        } catch (error) {
          console.error("Failed to load data:", error);
        }
      }
    };
    loadData();
  }, []);

  const saveData = async (newFormations: Formation[], newSettings: Settings) => {
    if (window.electronAPI) {
      await window.electronAPI.saveData({ formations: newFormations, settings: newSettings });
    }
  };

  const updateState = (
    updater: (prevFormations: Formation[], prevSettings: Settings) => { formations: Formation[], settings: Settings }
  ) => {
    const { formations: newFormations, settings: newSettings } = updater(formations, settings);
    setFormations(newFormations);
    setSettings(newSettings);
    saveData(newFormations, newSettings);
  };

  const addFormation = (formation: Formation) => {
    updateState((prevFormations, prevSettings) => ({
      formations: [...prevFormations, formation],
      settings: prevSettings
    }));
  };

  const updateFormation = (id: string, updatedFields: Partial<Formation>) => {
    updateState((prevFormations, prevSettings) => ({
      formations: prevFormations.map(f => f.id === id ? { ...f, ...updatedFields } : f),
      settings: prevSettings
    }));
  };

  const deleteFormation = (id: string) => {
    updateState((prevFormations, prevSettings) => ({
      formations: prevFormations.filter(f => f.id !== id),
      settings: prevSettings
    }));
  };

  const addModule = (formationId: string, module: Module) => {
    updateState((prevFormations, prevSettings) => ({
      formations: prevFormations.map(f => {
        if (f.id === formationId) {
          return { ...f, modules: [...f.modules, module] };
        }
        return f;
      }),
      settings: prevSettings
    }));
  };

  const updateModule = (formationId: string, moduleId: string, updatedFields: Partial<Module>) => {
    updateState((prevFormations, prevSettings) => ({
      formations: prevFormations.map(f => {
        if (f.id === formationId) {
          return {
            ...f,
            modules: f.modules.map(m => m.id === moduleId ? { ...m, ...updatedFields } : m)
          };
        }
        return f;
      }),
      settings: prevSettings
    }));
  };

  const deleteModule = (formationId: string, moduleId: string) => {
    updateState((prevFormations, prevSettings) => ({
      formations: prevFormations.map(f => {
        if (f.id === formationId) {
          return {
            ...f,
            modules: f.modules.filter(m => m.id !== moduleId)
          };
        }
        return f;
      }),
      settings: prevSettings
    }));
  };

  const addRessource = (formationId: string, moduleId: string, ressource: Ressource) => {
    updateState((prevFormations, prevSettings) => ({
      formations: prevFormations.map(f => {
        if (f.id === formationId) {
          return {
            ...f,
            modules: f.modules.map(m => {
              if (m.id === moduleId) {
                return { ...m, ressources: [...m.ressources, ressource] };
              }
              return m;
            })
          };
        }
        return f;
      }),
      settings: prevSettings
    }));
  };

  const updateRessource = (formationId: string, moduleId: string, ressourceId: string, updatedFields: Partial<Ressource>) => {
    updateState((prevFormations, prevSettings) => ({
      formations: prevFormations.map(f => {
        if (f.id === formationId) {
          return {
            ...f,
            modules: f.modules.map(m => {
              if (m.id === moduleId) {
                return {
                  ...m,
                  ressources: m.ressources.map(r => r.id === ressourceId ? { ...r, ...updatedFields } : r)
                };
              }
              return m;
            })
          };
        }
        return f;
      }),
      settings: prevSettings
    }));
  };

  const deleteRessource = (formationId: string, moduleId: string, ressourceId: string) => {
    updateState((prevFormations, prevSettings) => ({
      formations: prevFormations.map(f => {
        if (f.id === formationId) {
          return {
            ...f,
            modules: f.modules.map(m => {
              if (m.id === moduleId) {
                return {
                  ...m,
                  ressources: m.ressources.filter(r => r.id !== ressourceId)
                };
              }
              return m;
            })
          };
        }
        return f;
      }),
      settings: prevSettings
    }));
  };

  const updateSettings = async (updatedFields: Partial<Settings>) => {
    // Handle root directory change separately
    if (updatedFields.rootDirectory !== undefined && window.electronAPI) {
      try {
        const result = await window.electronAPI.setRoot(updatedFields.rootDirectory);
        if (!result.success) {
          console.error("Failed to set root directory:", result.error);
          return; // Don't update state if failed
        }
        // Reload data after changing root
        const data = await window.electronAPI.getData();
        if (data) {
          setFormations(data.formations || []);
          // Keep the new root directory in settings
          setSettings(prev => ({ ...prev, ...(data.settings || defaultSettings), rootDirectory: updatedFields.rootDirectory! }));
        }
        return;
      } catch (error) {
        console.error("Error setting root directory:", error);
        return;
      }
    }

    updateState((prevFormations, prevSettings) => ({
      formations: prevFormations,
      settings: { ...prevSettings, ...updatedFields }
    }));
  };

  // New: Export data function
  const exportData = () => {
    return JSON.stringify({ formations, settings }, null, 2);
  };

  // New: Import data function
  const importData = (jsonData: string) => {
    try {
      const imported: AppData = JSON.parse(jsonData);
      setFormations(imported.formations || []);
      setSettings(imported.settings || defaultSettings);
      saveData(imported.formations || [], imported.settings || defaultSettings);
      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  };


  return (
    <StoreContext.Provider value={{
      formations,
      settings,
      addFormation,
      updateFormation,
      deleteFormation,
      addModule,
      updateModule,
      deleteModule,
      addRessource,
      updateRessource,
      deleteRessource,
      updateSettings,
      exportData, // Add to provider value
      importData, // Add to provider value
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
