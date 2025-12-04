import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { formations, addFormation } = useStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const openModal = () => {
        setNewTitle('');
        setNewDescription('');
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleCreateFormation = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        addFormation({
            id: crypto.randomUUID ? crypto.randomUUID() : `formation-${Date.now()}`,
            titre: newTitle.trim(),
            description: newDescription.trim(),
            modules: []
        });

        closeModal();
    };

    return (
        <div className="flex flex-col gap-6">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-4 sm:px-6 md:px-10 py-3">
                <div className="flex items-center gap-4 text-slate-900 dark:text-slate-100">
                    <div className="size-5 text-primary">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em]">Accueil - Mode Cours</h2>
                </div>
                <Link to="/admin/settings" className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-symbols-outlined">settings</span>
                </Link>
            </header>

            <div className="flex flex-wrap justify-between items-center gap-4 p-4">
                <div className="flex flex-col gap-1">
                    <p className="text-slate-900 dark:text-slate-50 text-4xl font-black leading-tight tracking-[-0.033em]">Vos Formations</p>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">Sélectionnez une formation pour commencer.</p>
                </div>
                <button onClick={openModal} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-colors">
                    <span className="material-symbols-outlined text-base">add</span>
                    <span className="truncate">Ajouter une formation</span>
                </button>
            </div>

            {formations.length === 0 ? (
                <div className="p-4">
                    <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 px-6 py-14 bg-white/50 dark:bg-slate-900/20">
                        <div className="flex max-w-[480px] flex-col items-center gap-2">
                            <p className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">Aucune formation n'a été créée</p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-normal leading-normal max-w-[480px] text-center">Commencez par ajouter votre première formation pour organiser vos ressources pédagogiques.</p>
                        </div>
                        <button onClick={openModal} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-colors">
                            <span className="material-symbols-outlined text-base">add</span>
                            <span className="truncate">Créer une formation</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 p-4">
                    {formations.map((formation) => (
                        <Link key={formation.id} to={`/formation/${formation.id}`} className="group flex flex-col gap-3 p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                            <p className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-normal">{formation.titre}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">{formation.description || "Aucune description"}</p>
                        </Link>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">book</span>
                                Nouvelle formation
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-1 transition-colors">
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateFormation} className="p-6 space-y-6">
                            <div>
                                <label htmlFor="formationTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Nom de la formation <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="formationTitle"
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Ex: Cybersécurité avancée"
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label htmlFor="formationDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Description courte
                                </label>
                                <textarea
                                    id="formationDescription"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="De quoi parle cette formation ?"
                                    rows={3}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newTitle.trim()}
                                    className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                                >
                                    Créer la formation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
