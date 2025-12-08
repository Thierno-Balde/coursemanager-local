import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Formation, Module, Ressource, Settings, AppData, Group, ProgressStatus } from '../types';

interface StoreContextType {
  formations: Formation[];
  groups: Group[];
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
  reorderModules: (formationId: string, startIndex: number, endIndex: number) => void;
  reorderResources: (formationId: string, moduleId: string, startIndex: number, endIndex: number) => void;
  addGroup: (group: Group) => void;
  updateGroup: (groupId: string, updatedFields: Partial<Group>) => void;
  deleteGroup: (groupId: string) => Promise<void>;
  updateGroupProgress: (groupId: string, moduleId: string, status: ProgressStatus) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const defaultSettings: Settings = {
  rootDirectory: '',
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const loadData = async () => {
      if (window.electronAPI) {
        try {
          const [formationsData, groupsData, rootDir] = await Promise.all([
            window.electronAPI.getFormations(),
            window.electronAPI.getGroups(),
            window.electronAPI.getRoot()
          ]);

          if (formationsData) {
            setFormations(formationsData.formations || []);
            setSettings({
              ...(formationsData.settings || defaultSettings),
              rootDirectory: rootDir || ''
            });
          }
          if (groupsData) {
            setGroups(groupsData);
          }
        } catch (error) {
          console.error("Failed to load data:", error);
        }
      }
    };
    loadData();
  }, []);

  const saveFormations = async (newFormations: Formation[], newSettings: Settings) => {
    if (window.electronAPI) {
      await window.electronAPI.saveFormations({ formations: newFormations, settings: newSettings });
    }
  };

  const saveGroups = async (newGroups: Group[]) => {
    if (window.electronAPI) {
      await window.electronAPI.saveGroups(newGroups);
    }
  };

  const updateFormationsState = async (
    updater: (prevFormations: Formation[]) => Formation[]
  ) => {
    const newFormations = updater(formations);
    setFormations(newFormations);
    await saveFormations(newFormations, settings);
  };

  const addFormation = (formation: Formation) => {
    updateFormationsState((prevFormations) => [...prevFormations, formation]);
  };

  const updateFormation = (id: string, updatedFields: Partial<Formation>) => {
    updateFormationsState((prevFormations) =>
      prevFormations.map(f => f.id === id ? { ...f, ...updatedFields } : f)
    );
  };

  const deleteFormation = (id: string) => {
    updateFormationsState((prevFormations) => prevFormations.filter(f => f.id !== id));
  };

  const addModule = (formationId: string, module: Module) => {
    updateFormationsState((prevFormations) =>
      prevFormations.map(f => f.id === formationId ? { ...f, modules: [...f.modules, module] } : f)
    );
  };

  const updateModule = (formationId: string, moduleId: string, updatedFields: Partial<Module>) => {
    updateFormationsState((prevFormations) =>
      prevFormations.map(f =>
        f.id === formationId
          ? { ...f, modules: f.modules.map(m => m.id === moduleId ? { ...m, ...updatedFields } : m) }
          : f
      )
    );
  };

  const deleteModule = (formationId: string, moduleId: string) => {
    updateFormationsState((prevFormations) =>
      prevFormations.map(f =>
        f.id === formationId
          ? { ...f, modules: f.modules.filter(m => m.id !== moduleId) }
          : f
      )
    );
  };

  const reorderModules = (formationId: string, startIndex: number, endIndex: number) => {
    updateFormationsState((prevFormations) => {
      const newFormations = [...prevFormations];
      const formationIndex = newFormations.findIndex(f => f.id === formationId);
      if (formationIndex !== -1) {
        const newModules = Array.from(newFormations[formationIndex].modules);
        const [removed] = newModules.splice(startIndex, 1);
        newModules.splice(endIndex, 0, removed);
        newFormations[formationIndex] = {
          ...newFormations[formationIndex],
          modules: newModules,
        };
      }
      return newFormations;
    });
  };

  const addRessource = (formationId: string, moduleId: string, ressource: Ressource) => {
    updateFormationsState((prevFormations) =>
      prevFormations.map(f =>
        f.id === formationId
          ? { ...f, modules: f.modules.map(m => m.id === moduleId ? { ...m, ressources: [...m.ressources, ressource] } : m) }
          : f
      )
    );
  };

  const updateRessource = (formationId: string, moduleId: string, ressourceId: string, updatedFields: Partial<Ressource>) => {
    updateFormationsState((prevFormations) =>
      prevFormations.map(f =>
        f.id === formationId
          ? {
            ...f,
            modules: f.modules.map(m =>
              m.id === moduleId
                ? {
                  ...m,
                  ressources: m.ressources.map(r =>
                    r.id === ressourceId ? { ...r, ...updatedFields } : r
                  ),
                }
                : m
            ),
          }
          : f
      )
    );
  };

  const deleteRessource = (formationId: string, moduleId: string, ressourceId: string) => {
    updateFormationsState((prevFormations) =>
      prevFormations.map(f =>
        f.id === formationId
          ? {
            ...f,
            modules: f.modules.map(m =>
              m.id === moduleId
                ? {
                  ...m,
                  ressources: m.ressources.filter(r => r.id !== ressourceId),
                }
                : m
            ),
          }
          : f
      )
    );
  };

  const reorderResources = (formationId: string, moduleId: string, startIndex: number, endIndex: number) => {
    updateFormationsState((prevFormations) => {
      const newFormations = [...prevFormations];
      const formationIndex = newFormations.findIndex(f => f.id === formationId);
      if (formationIndex !== -1) {
        const formation = newFormations[formationIndex];
        const moduleIndex = formation.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex !== -1) {
          const newResources = Array.from(formation.modules[moduleIndex].ressources);
          const [removed] = newResources.splice(startIndex, 1);
          newResources.splice(endIndex, 0, removed);
          const newModules = [...formation.modules];
          newModules[moduleIndex] = {
            ...newModules[moduleIndex],
            ressources: newResources,
          };
          newFormations[formationIndex] = {
            ...formation,
            modules: newModules,
          };
        }
      }
      return newFormations;
    });
  };

  const addGroup = async (group: Group) => {
    setGroups(prev => [...prev, group]);
    await saveGroups([...groups, group]);
  };

  const updateGroup = async (groupId: string, updatedFields: Partial<Group>) => {
    const newGroups = groups.map(g => g.id === groupId ? { ...g, ...updatedFields } : g);
    setGroups(newGroups);
    await saveGroups(newGroups);
  };

  const deleteGroup = async (groupId: string) => {
    const newGroups = groups.filter(g => g.id !== groupId);
    setGroups(newGroups);
    await saveGroups(newGroups);
  };

  const updateGroupProgress = async (groupId: string, moduleId: string, status: ProgressStatus) => {
    const newGroups = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          progress: {
            ...g.progress,
            [moduleId]: status,
          },
        };
      }
      return g;
    });
    setGroups(newGroups);
    await saveGroups(newGroups);
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
        const data = await window.electronAPI.getFormations();
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
  };

  // New: Export data function
  const exportData = () => {
    return JSON.stringify({ formations, settings, groups }, null, 2);
  };

  // New: Import data function
  const importData = (jsonData: string) => {
    try {
      const imported: AppData = JSON.parse(jsonData);
      setFormations(imported.formations || []);
      setSettings(imported.settings || defaultSettings);
      setGroups(imported.groups || []);
      saveFormations(imported.formations || [], imported.settings || defaultSettings);
      saveGroups(imported.groups || []);
      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  };

  return (
    <StoreContext.Provider value={{
      formations,
      groups,
      settings,
      addFormation,
      updateFormation,
      deleteFormation,
      addModule,
      updateModule,
      deleteModule,
      reorderModules,
      addRessource,
      updateRessource,
      deleteRessource,
      reorderResources,
      addGroup,
      updateGroup,
      deleteGroup,
      updateGroupProgress,
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
