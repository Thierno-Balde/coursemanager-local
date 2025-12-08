import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Plus } from 'lucide-react';

const ManageGroupsPage: React.FC = () => {
  const { groups, formations } = useStore();

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto p-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Admin</Link>
        <span className="text-slate-400 dark:text-slate-500">/</span>
        <span className="font-medium text-slate-900 dark:text-slate-100">Groupes</span>
      </div>

      {/* PageHeading */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Groupes</h1>
        <Link
          to="/admin/group/new" // This route will be created later
          className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="truncate">Créer un groupe</span>
        </Link>
      </div>

      <div className="space-y-4">
        {groups.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
            <p className="text-slate-500 dark:text-slate-400 mb-2">Aucun groupe n'a été créé.</p>
            <Link to="/admin/group/new" className="text-blue-600 hover:underline">
              Créer votre premier groupe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => {
              const linkedFormation = formations.find(f => f.id === group.formationId);
              return (
                <div key={group.id} className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{group.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ville: {group.city}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Session: {group.session}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Formation: {linkedFormation?.titre || 'Inconnue'}</p>
                  <div className="mt-3 flex gap-2">
                    <Link to={`/admin/group/${group.id}/edit`} className="text-blue-600 hover:underline text-sm">Modifier</Link>
                    {/* Add delete functionality later */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageGroupsPage;
