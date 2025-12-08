import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FormationPage from './pages/FormationPage';
import ModulePage from './pages/ModulePage';
import AdminLayout from './components/admin/AdminLayout';
import ManageCoursesPage from './pages/admin/ManageCoursesPage';
import CourseFormPage from './pages/admin/CourseFormPage';
import ManageModulesPage from './pages/admin/ManageModulesPage';
import ModuleFormPage from './pages/admin/ModuleFormPage';
import ManageResourcesPage from './pages/admin/ManageResourcesPage';
import ResourceFormPage from './pages/admin/ResourceFormPage';
import SettingsPage from './pages/admin/SettingsPage';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <div className="min-h-screen font-display bg-background-light dark:bg-background-dark text-[#212529] dark:text-slate-200">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />

              {/* Mode Cours */}
              <Route path="formation/:id" element={<FormationPage />} />
              <Route path="formation/:id/module/:moduleId" element={<ModulePage />} />
            </Route>

            {/* Mode Admin */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<ManageCoursesPage />} />
              <Route path="formation/new" element={<CourseFormPage />} />
              <Route path="formation/edit/:id" element={<CourseFormPage />} />
              <Route path="course/:courseId/modules" element={<ManageModulesPage />} />
              <Route path="course/:courseId/module/new" element={<ModuleFormPage />} />
              <Route path="course/:courseId/module/:moduleId/edit" element={<ModuleFormPage />} />
              <Route path="course/:courseId/module/:moduleId/resources" element={<ManageResourcesPage />} />
              <Route path="course/:courseId/module/:moduleId/resource/new" element={<ResourceFormPage />} />
              <Route path="course/:courseId/module/:moduleId/resource/:resourceId/edit" element={<ResourceFormPage />} />

              {/* Settings */}
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;