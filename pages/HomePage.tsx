import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Icon } from '../components/Icon';
import { Plus, X, FolderPlus } from 'lucide-react';
import { Course } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  // Utilisation du store global
  const { courses, addCourse } = useStore();

  // États pour la modale et le formulaire
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseIcon, setNewCourseIcon] = useState('Folder');

  const openModal = () => {
    setNewCourseName('');
    setNewCourseDesc('');
    setNewCourseIcon('Folder');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCourseName.trim()) return;

    const newCourse: Course = {
      id: crypto.randomUUID ? crypto.randomUUID() : `course-${Date.now()}`,
      name: newCourseName,
      description: newCourseDesc || "Aucune description.",
      icon: newCourseIcon,
      items: []
    };

    addCourse(newCourse);
    closeModal();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Portail de Formation
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          Accédez à tous vos supports de cours, vidéos et exercices organisés par matière.
        </p>

        {/* Bouton d'action principal */}
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-medium rounded-full hover:bg-brand-700 hover:shadow-lg active:scale-95 transition-all shadow-md"
        >
          <Plus size={20} />
          <span>Ajouter un cours</span>
        </button>
      </div>

      {/* Grid des cours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => navigate(`/course/${course.id}`)}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-brand-500 transition-all duration-300 cursor-pointer group"
          >
            <div className="h-32 bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-brand-50 group-hover:to-brand-100 transition-colors">
              <div className="p-4 bg-white rounded-full shadow-sm text-slate-700 group-hover:text-brand-600 group-hover:scale-110 transition-transform">
                <Icon name={course.icon || 'BookOpen'} size={32} />
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                {course.name}
              </h2>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                {course.description}
              </p>
              <div className="flex items-center justify-between mt-4 text-xs text-slate-400 font-medium uppercase tracking-wider">
                <span>{course.items.length} Modules</span>
                <span className="group-hover:translate-x-1 transition-transform">Accéder &rarr;</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'ajout de cours */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FolderPlus size={20} className="text-brand-600" />
                Nouveau Cours
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-6 space-y-6">
              <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-slate-700 mb-1">
                  Nom du cours <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="courseName"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Ex: Domotique..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label htmlFor="courseDesc" className="block text-sm font-medium text-slate-700 mb-1">
                  Description courte
                </label>
                <textarea
                  id="courseDesc"
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  placeholder="De quoi parle ce cours ?"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Icône
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {['Folder', 'BookOpen', 'Zap', 'Cpu', 'Code', 'Database', 'Globe', 'PenTool', 'Activity', 'Layers', 'Box', 'Terminal'].map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setNewCourseIcon(iconName)}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all ${newCourseIcon === iconName
                        ? 'bg-brand-100 text-brand-600 ring-2 ring-brand-500'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                      title={iconName}
                    >
                      <Icon name={iconName} size={20} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newCourseName.trim()}
                  className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  Créer le cours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
