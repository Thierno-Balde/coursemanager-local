import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course, CourseItem, Resource, ResourceCategory, ResourceKind, AppData } from '../types';
import { COURSE_DATA } from '../data';
import { migrateData } from '../utils/migrate';
import { getResourcesDir } from '../utils/paths';

type NewResourceInput = {
  label: string;
  category: ResourceCategory;
  kind: ResourceKind;
  format?: string;
  path?: string;
  relativePath?: string;
  url?: string;
  provider?: string;
};

interface StoreContextType {
  courses: Course[];
  addCourse: (course: Course) => void;
  addModule: (courseId: string, module: CourseItem) => void;
  addResource: (courseId: string, moduleId: string, resource: NewResourceInput) => void;
  deleteResource: (courseId: string, moduleId: string, resourceId: string, relativePath?: string) => void;
  deleteModule: (courseId: string, moduleId: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const generateId = (prefix: string) => `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)}`;

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loadFallbackData = (): Course[] => {
    return migrateData(COURSE_DATA).courses;
  };

  // Start with seed data; hydrate from Electron after mount
  const [courses, setCourses] = useState<Course[]>(() => loadFallbackData());

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      if (typeof window !== 'undefined' && window.electronAPI?.getData) {
        try {
          const raw = await window.electronAPI.getData();
          const migrated = migrateData(raw);
          if (!cancelled) {
            setCourses(migrated.courses.length ? migrated.courses : loadFallbackData());
          }
          return;
        } catch (error) {
          console.error('Failed to load data from Electron store, falling back:', error);
        }
      }
      if (!cancelled) {
        setCourses(loadFallbackData());
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistCourses = (updater: (prev: Course[]) => Course[]) => {
    setCourses(prev => {
      const next = updater(prev);
      if (typeof window !== 'undefined' && window.electronAPI?.saveData) {
        window.electronAPI.saveData({ courses: next }).catch(error => {
          console.error('Failed to save data to Electron store:', error);
        });
      }
      return next;
    });
  };

  const addCourse = (course: Course) => {
    persistCourses(prev => [...prev, course]);
  };

  const addModule = (courseId: string, module: CourseItem) => {
    const normalizedModule: CourseItem = {
      ...module,
      resources: (module.resources || []).map(res => ({
        ...res,
        id: res.id || generateId('res'),
        createdAt: res.createdAt || new Date().toISOString(),
      })),
    };
    persistCourses(prev =>
      prev.map(course => {
        if (course.id === courseId) {
          return { ...course, items: [...course.items, normalizedModule] };
        }
        return course;
      })
    );
  };

  const addResource = (courseId: string, moduleId: string, resourceInput: NewResourceInput) => {
    const resourcesDir = getResourcesDir();

    // Fix: relativePath from fileManager includes "resources/", but resourcesDir ALREADY points to that folder.
    // We need to strip "resources/" from relativePath to avoid duplication (.../resources/resources/file.pdf).
    let cleanRelative = resourceInput.relativePath || '';
    if (cleanRelative.startsWith('resources/') || cleanRelative.startsWith('resources\\')) {
      cleanRelative = cleanRelative.substring(10); // Remove "resources/" (10 chars)
    }
    // Also remove leading slashes just in case
    cleanRelative = cleanRelative.replace(/^[/\\\\]+/, '');

    const rebuiltPath = resourceInput.relativePath && resourcesDir
      ? `${resourcesDir}/${cleanRelative}`
      : resourceInput.path;

    const resource: Resource = {
      ...resourceInput,
      path: rebuiltPath || resourceInput.path,
      id: generateId('res'),
      createdAt: new Date().toISOString(),
    };
    persistCourses(prev =>
      prev.map(course => {
        if (course.id === courseId) {
          const updatedItems = course.items.map(item => {
            if (item.id === moduleId) {
              return { ...item, resources: [...(item.resources || []), resource] };
            }
            return item;
          });
          return { ...course, items: updatedItems };
        }
        return course;
      })
    );
  };

  const deleteResource = (courseId: string, moduleId: string, resourceId: string, relativePath?: string) => {
    if (relativePath && window.electronAPI?.deleteResourceFile) {
      window.electronAPI.deleteResourceFile(relativePath).catch(error => {
        console.error('Failed to delete physical resource file:', error);
      });
    }

    persistCourses(prev =>
      prev.map(course => {
        if (course.id !== courseId) return course;
        const updatedItems = course.items.map(item => {
          if (item.id !== moduleId) return item;
          return { ...item, resources: (item.resources || []).filter(r => r.id !== resourceId) };
        });
        return { ...course, items: updatedItems };
      })
    );
  };

  const deleteModule = (courseId: string, moduleId: string) => {
    persistCourses(prev =>
      prev.map(course => {
        if (course.id !== courseId) return course;

        const moduleToDelete = course.items.find(item => item.id === moduleId);
        if (moduleToDelete && window.electronAPI?.deleteResourceFile) {
          moduleToDelete.resources?.forEach(res => {
            if (res.relativePath) {
              window.electronAPI!.deleteResourceFile(res.relativePath).catch(err => {
                console.error('Failed to delete resource during module removal:', err);
              });
            }
          });
        }

        const updatedItems = course.items.filter(item => item.id !== moduleId);
        return { ...course, items: updatedItems };
      })
    );
  };

  return (
    <StoreContext.Provider value={{ courses, addCourse, addModule, addResource, deleteResource, deleteModule }}>
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
