import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Module } from '../../types';
import { Plus, Edit, Save, X, ChevronRight } from 'lucide-react';

const ModuleFormPage: React.FC = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId?: string }>();
  const { formations, addModule, updateModule } = useStore();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const formation = formations.find(f => f.id === courseId);
  const isEditing = Boolean(moduleId);

  useEffect(() => {
    if (isEditing && formation) {
      const module = formation.modules.find(m => m.id === moduleId);
      if (module) {
        setTitle(module.titre);
        setDescription(module.description || '');
      } else {
        // Module not found, navigate back
        navigate(`/admin/course/${courseId}/modules`);
      }
    }
  }, [isEditing, courseId, moduleId, formation, navigate]);

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
      updateModule(formation.id, moduleId, { titre: title, description });
    } else {
      const newModule: Module = {
        id: crypto.randomUUID(),
        titre: title,
        description,
        ressources: []
      };
      addModule(formation.id, newModule);
    }
    navigate(`/admin/course/${courseId}/modules`);
  };

  const handleCancel = () => {
    navigate(`/admin/course/${courseId}/modules`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-8 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Formations</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/admin/course/${courseId}/modules`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{formation.titre}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-slate-900 dark:text-slate-100">{isEditing ? 'Modifier' : 'Nouveau'}</span>
      </div>
      
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {isEditing ? <Edit className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
            {isEditing ? 'Modifier le module' : 'Nouveau module'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
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
  );
};

export default ModuleFormPage;
