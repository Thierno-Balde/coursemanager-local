import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Module } from '../../types';
import { Plus, GripVertical, FolderOpen, Edit, Trash2, Save, X, ChevronRight } from 'lucide-react';

const ManageModulesPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { formations, addModule, deleteModule, updateModule } = useStore();
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const formation = formations.find(f => f.id === courseId);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!formation) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Formation introuvable</h2>
        <Link to="/admin" className="text-blue-600 hover:underline">Retourner à la liste</Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateModule(formation.id, isEditing, { titre: title, description });
      setIsEditing(null);
    } else {
      const newModule: Module = {
        id: crypto.randomUUID(),
        titre: title,
        description,
        ressources: []
      };
      addModule(formation.id, newModule);
    }
    setTitle('');
    setDescription('');
  };

  const handleEdit = (module: Module) => {
    setIsEditing(module.id);
    setTitle(module.titre);
    setDescription(module.description || '');
    scrollToForm();
  };

  const handleDelete = (moduleId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      deleteModule(formation.id, moduleId);
    }
  };

  const handleCancel = () => {
    setIsEditing(null);
    setTitle('');
    setDescription('');
  };

  const scrollToForm = () => {
    const target = document.getElementById('module-form');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto p-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Formations</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-slate-900 dark:text-slate-100">{formation.titre}</span>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-slate-900 dark:text-slate-100">Modules</span>
      </div>

      {/* PageHeading */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Modules</h1>
        <button
          onClick={scrollToForm}
          className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="truncate">{isEditing ? 'Modifier le module' : 'Ajouter un module'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Module List Panel */}
        <div className="lg:col-span-2 space-y-4">
          {formation.modules.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
              <p className="text-slate-500 dark:text-slate-400 mb-2">Aucun module dans cette formation.</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Utilisez le formulaire pour ajouter votre premier module.</p>
            </div>
          ) : (
            formation.modules.map((module, index) => (
              <div key={module.id} className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex items-center gap-4 justify-between group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button className="text-slate-400 dark:text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                    <GripVertical className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col justify-center min-w-0">
                    <p className="text-slate-900 dark:text-white font-semibold truncate">
                      <span className="text-slate-400 dark:text-slate-500 mr-2">#{index + 1}</span>
                      {module.titre}
                    </p>
                    {module.description && (
                      <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{module.description}</p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  <Link
                    to={`/admin/course/${formation.id}/module/${module.id}/resources`}
                    className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Gérer les ressources"
                  >
                    <FolderOpen className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleEdit(module)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(module.id)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Side Panel */}
        <div id="module-form" className="lg:col-span-1 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6 sticky top-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {isEditing ? <Edit className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
            {isEditing ? 'Modifier le module' : 'Nouveau module'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="title">Titre du module</label>
              <input
                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2.5 border transition-all"
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex: Chapitre 1: Les bases"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="description">Description</label>
              <textarea
                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2.5 border transition-all resize-none"
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description optionnelle..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors gap-2"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
              )}
              <button
                type="submit"
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                {isEditing ? 'Mettre à jour' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageModulesPage;
