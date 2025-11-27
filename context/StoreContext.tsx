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
  // Initialize state from localStorage or fallback to default data
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData: AppData = JSON.parse(storedData);
        // Basic validation to ensure we have an array
        if (Array.isArray(parsedData.courses)) {
          return parsedData.courses;
        }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
    }
    return COURSE_DATA.courses;
  });

  // Persist to localStorage whenever courses change
  useEffect(() => {
    try {
      const dataToSave: AppData = { courses };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
    }
  }, [courses]);

  const addCourse = (course: Course) => {
    setCourses(prev => [...prev, course]);
  };

  const addModule = (courseId: string, module: CourseItem) => {
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        return { ...course, items: [...course.items, module] };
      }
      return course;
    }));
  };

  const addResource = (courseId: string, moduleId: string, category: 'pdfs' | 'videos' | 'extras', resource: Resource) => {
    setCourses(prev => prev.map(course => {
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
