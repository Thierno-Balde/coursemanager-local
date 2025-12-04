import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, Folder, ChevronRight, FolderX, BookOpen } from 'lucide-react';

const FormationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { formations } = useStore();

    const formation = formations.find(f => f.id === id);

    if (!formation) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Formation introuvable</h2>
                <Link to="/" className="text-blue-600 hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Retour au tableau de bord
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{formation.titre}</h1>
                            {formation.description && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{formation.description}</p>
                            )}
                        </div>
                    </div>
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Retour</span>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 max-w-5xl mx-auto w-full p-6">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Modules de la formation</h2>
                    <p className="text-slate-500 dark:text-slate-400">Sélectionnez un module pour commencer ou continuer votre apprentissage.</p>
                </div>

                <div className="grid gap-4">
                    {formation.modules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                <FolderX className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Aucun module disponible</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                Cette formation ne contient pas encore de modules. Revenez plus tard ou contactez l'administrateur.
                            </p>
                        </div>
                    ) : (
                        formation.modules.map((module, index) => (
                            <Link
                                key={module.id}
                                to={`/formation/${formation.id}/module/${module.id}`}
                                className="group flex items-center gap-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
                            >
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                    <span className="font-bold text-lg">{index + 1}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {module.titre}
                                    </h3>
                                    {module.description && (
                                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">
                                            {module.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Folder className="w-3 h-3" />
                                            {module.ressources.length} Ressource{module.ressources.length > 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default FormationPage;
