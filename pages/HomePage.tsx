import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
// import { Icon } from '../components/Icon'; // Removed as Material Symbols are used directly
// import { Plus, X, FolderPlus, Trash2 } from 'lucide-react'; // Removed as Material Symbols are used directly
import { Course } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { courses, addCourse, deleteCourse } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  // Icon selection is removed for simplicity, as it's not prominently featured in the mockup's course cards
  // const [newCourseIcon, setNewCourseIcon] = useState('Folder');

  const openModal = () => {
    setNewCourseName('');
    setNewCourseDesc('');
    // setNewCourseIcon('Folder');
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
      icon: "BookOpen", // Default icon, as selection is removed
      items: []
    };

    addCourse(newCourse);
    closeModal();
  };

  const handleDeleteCourse = (e: React.MouseEvent, courseId: string, courseName: string) => {
    e.stopPropagation(); // Prevents navigation
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le cours "${courseName}" ? Cette action est irréversible.`)) {
      deleteCourse(courseId);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-4 sm:px-6 md:px-10 py-3">
              <div className="flex items-center gap-4 text-slate-900 dark:text-slate-100">
                <div className="size-5 text-primary">
                  <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                  </svg>
                </div>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em]">Accueil - Mode Cours</h2>
              </div>
              <button
                onClick={() => navigate('/admin/courses')}
                className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </header>

            <main className="flex flex-col flex-1 mt-6">
              <div className="flex flex-wrap justify-between items-center gap-4 p-4">
                <div className="flex flex-col gap-1">
                  <p className="text-slate-900 dark:text-slate-50 text-4xl font-black leading-tight tracking-[-0.033em]">Vos Formations</p>
                  <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">Sélectionnez une formation pour commencer.</p>
                </div>
                <button
                  onClick={openModal}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-colors">
                  <span className="material-symbols-outlined text-base">add</span>
                  <span className="truncate">Ajouter une formation</span>
                </button>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 p-4">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => navigate(`/course/${course.id}`)}
                      className="group flex flex-col gap-3 p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
                    >
                      <p className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-normal">{course.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">{course.description}</p>
                      {/* Delete functionality moved to Admin page, or can be added with context menu */}
                      {/* <button
                          onClick={(e) => handleDeleteCourse(e, course.id, course.name)}
                          className="absolute top-2 right-2 p-2 text-slate-400 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all z-10"
                          title="Supprimer le cours"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button> */}
                    </div>
                  ))
                ) : (
                  <div className="p-4 mt-8 col-span-full">
                    <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 px-6 py-14 bg-white/50 dark:bg-slate-900/20">
                      <div className="flex max-w-[480px] flex-col items-center gap-2">
                        <p className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">Aucune formation n'a été créée</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-normal leading-normal max-w-[480px] text-center">Commencez par ajouter votre première formation pour organiser vos ressources pédagogiques.</p>
                      </div>
                      <button
                        onClick={openModal}
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-colors">
                        <span className="material-symbols-outlined text-base">add</span>
                        <span className="truncate">Créer une formation</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </main>

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
                      <span className="material-symbols-outlined text-primary">folder_open</span>
                      Nouveau Cours
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full p-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
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
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
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
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Icon selection removed as per mockup */}
                    {/* <div>
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
                              ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-500'
                              : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                              }`}
                            title={iconName}
                          >
                            <Icon name={iconName} size={20} />
                          </button>
                        ))}
                      </div>
                    </div> */}

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
                        className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                      >
                        Créer le cours
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
