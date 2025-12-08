import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="relative flex min-h-screen w-full font-display bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200">
      {/* SideNavBar */}
      <aside className="flex-shrink-0 w-64 bg-white dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 flex flex-col gap-4 flex-grow">
          <div className="flex items-center gap-3">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-medium leading-normal text-slate-900 dark:text-white">Mode Admin</h1>
              <p className="text-sm font-normal leading-normal text-slate-500 dark:text-slate-400">Gestion</p>
            </div>
          </div>
          <nav className="flex flex-col gap-2 mt-4">
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin') && !isActive('/admin/settings') && !isActive('/admin/groups') ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/admin') && !isActive('/admin/settings') && !isActive('/admin/groups') ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
              <p className="text-sm font-medium leading-normal">Formations</p>
            </Link>
            <Link
              to="/admin/groups"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/groups') ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/admin/groups') ? "'FILL' 1" : "'FILL' 0" }}>group</span>
              <p className="text-sm font-medium leading-normal">Groupes</p>
            </Link>
            <Link
              to="/admin/settings"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/settings') ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/admin/settings') ? "'FILL' 1" : "'FILL' 0" }}>settings</span>
              <p className="text-sm font-medium leading-normal">Paramètres</p>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 mt-4 border-t border-slate-200 dark:border-slate-800 pt-4"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <p className="text-sm font-medium leading-normal">Retour au Mode Cours</p>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto min-h-full flex flex-col">
            <div className="flex-1">
              <Outlet />
            </div>
            <footer className="mt-auto pt-6 pb-2 border-t border-slate-200 dark:border-slate-800 mt-8">
              <div className="flex justify-center">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  &copy; 2025 - BALDE Thierno
                </p>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
