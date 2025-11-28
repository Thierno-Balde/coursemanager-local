import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course, CourseItem, Resource, AppData } from '../types';
import { COURSE_DATA } from '../data';

interface StoreContextType {
  courses: Course[];
  addCourse: (course: Course) => void;
  addModule: (courseId: string, module: CourseItem) => void;
  addResource: (courseId: string, moduleId: string, category: 'pdfs' | 'videos' | 'extras', resource: Resource) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'course_manager_data';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loadFallbackData = (): Course[] => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsedData: AppData = JSON.parse(storedData);
          if (Array.isArray(parsedData.courses)) {
            return parsedData.courses;
          }
        }
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      }
    }
    return COURSE_DATA.courses;
  };

  // Start with seed data; hydrate from Electron or localStorage after mount
  const [courses, setCourses] = useState<Course[]>(() => loadFallbackData());

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      if (typeof window !== 'undefined' && window.electronAPI?.getData) {
        try {
          const data = await window.electronAPI.getData();
          if (!cancelled) {
            setCourses(Array.isArray(data?.courses) ? data.courses : COURSE_DATA.courses);
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
      } else if (typeof localStorage !== 'undefined') {
        try {
          const dataToSave: AppData = { courses: next };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (error) {
          console.error('Failed to save data to localStorage:', error);
        }
      }
      return next;
    });
  };

  const addCourse = (course: Course) => {
    persistCourses(prev => [...prev, course]);
  };

  const addModule = (courseId: string, module: CourseItem) => {
    persistCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        return { ...course, items: [...course.items, module] };
      }
      return course;
    }));
  };

  const addResource = (courseId: string, moduleId: string, category: 'pdfs' | 'videos' | 'extras', resource: Resource) => {
    persistCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const updatedItems = course.items.map(item => {
          if (item.id === moduleId) {
            return {
              ...item,
              [category]: [...item[category], resource]
            };
          }
          return item;
        });
        return { ...course, items: updatedItems };
      }
      return course;
    }));
  };

  return (
    <StoreContext.Provider value={{ courses, addCourse, addModule, addResource }}>
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
