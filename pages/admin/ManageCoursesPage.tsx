import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Link } from 'react-router-dom';
import { PlusCircle, School, Edit, Trash2, Layers } from 'lucide-react';

const ManageCoursesPage: React.FC = () => {
  const { formations, deleteFormation } = useStore();

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      deleteFormation(id);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Formations</h1>
          <p className="text-slate-500 dark:text-slate-400">Centralisez, organisez et ouvrez toutes les ressources pédagogiques.</p>
        </div>
        <Link to="/admin/formation/new" className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">
          <PlusCircle className="w-5 h-5" />
          <span className="truncate">Créer une formation</span>
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {formations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-12 text-center mt-8">
            <div className="rounded-full bg-blue-50 dark:bg-blue-900/20 p-4 text-blue-600 dark:text-blue-400">
              <School className="w-12 h-12" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Aucune formation pour le moment</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Commencez par ajouter votre première formation pour la gérer ici.</p>
            </div>
            <Link to="/admin/formation/new" className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">
              <PlusCircle className="w-5 h-5" />
              <span className="truncate">Créer votre première formation</span>
            </Link>
          </div>
        ) : (
          formations.map((formation) => (
            <div key={formation.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{formation.titre}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{formation.description || "Aucune description"}</p>
                  </div>
                  <Link to={`/admin/course/${formation.id}/modules`} className="flex w-fit items-center justify-center gap-2 rounded-lg h-9 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <Layers className="w-4 h-4" />
                    <span className="truncate">Gérer les modules ({formation.modules.length})</span>
                  </Link>
                </div>
                <div className="w-full md:w-auto flex items-center justify-start md:justify-end gap-2">
                  <Link to={`/admin/formation/edit/${formation.id}`} className="flex h-9 min-w-[84px] items-center justify-center gap-2 rounded-lg px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <Edit className="w-4 h-4" />
                    <span className="truncate">Modifier</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(formation.id)}
                    className="flex h-9 min-w-[84px] items-center justify-center gap-2 rounded-lg px-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="truncate">Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageCoursesPage;
