import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { Folder, Search } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Dashboard: React.FC = () => {
    const { formations, groups } = useStore();
    const [searchTerm, setSearchTerm] = useState('');

    // Get IDs of formations that belong to at least one active group
    const activeFormationIds = new Set(
        groups
            .filter(g => !g.archived)
            .map(g => g.formationId)
    );

    const filteredFormations = formations
        .filter(f => activeFormationIds.has(f.id))
        .filter(f =>
            f.titre.toLowerCase().includes(searchTerm.toLowerCase())
        );

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
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Link to="/admin" className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                    </Link>
                </div>
            </header>

            <div className="flex flex-wrap justify-between items-center gap-4 p-4">
                <div className="flex flex-col gap-1">
                    <p className="text-slate-900 dark:text-slate-50 text-4xl font-black leading-tight tracking-[-0.033em]">Vos Formations</p>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">Sélectionnez une formation pour commencer.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une formation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {activeFormationIds.size === 0 ? (
                <div className="p-4">
                    <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 px-6 py-14 bg-white/50 dark:bg-slate-900/20">
                        <div className="flex max-w-[480px] flex-col items-center gap-2">
                            <p className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">Aucune formation active</p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-normal leading-normal max-w-[480px] text-center">Activez un groupe dans l'administration pour voir les formations associées ici.</p>
                        </div>
                    </div>
                </div>
            ) : filteredFormations.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                    Aucune formation trouvée pour "{searchTerm}"
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 p-4">
                    {filteredFormations.map((formation) => (
                        <Link key={formation.id} to={`/formation/${formation.id}`} className="group flex flex-col gap-4 p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                            <div className="flex-1">
                                <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-normal">{formation.titre}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal mt-2">{formation.description || "Aucune description"}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <Folder className="w-4 h-4" />
                                <span>{formation.modules.length} {formation.modules.length > 1 ? 'modules' : 'module'}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

        </div>
    );
};

export default Dashboard;
