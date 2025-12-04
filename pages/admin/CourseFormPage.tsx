import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Formation } from '../../types';
import { ChevronRight, Save, X } from 'lucide-react';

const CourseFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { formations, addFormation, updateFormation } = useStore();

    const isEditing = !!id;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isEditing && id) {
            const formation = formations.find(f => f.id === id);
            if (formation) {
                setTitle(formation.titre);
                setDescription(formation.description || '');
            } else {
                // Handle not found
                navigate('/admin');
            }
        }
    }, [isEditing, id, formations, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && id) {
            updateFormation(id, { titre: title, description });
        } else {
            const newFormation: Formation = {
                id: crypto.randomUUID(),
                titre: title,
                description,
                modules: []
            };
            addFormation(newFormation);
        }

        navigate('/admin');
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-center gap-2 mb-6 text-sm text-slate-500 dark:text-slate-400">
                <Link to="/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Formations</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium text-slate-900 dark:text-slate-100">{isEditing ? 'Modifier' : 'Créer'}</span>
            </div>

            <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">{isEditing ? 'Modifier la formation' : 'Créer une nouvelle formation'}</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titre de la formation</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Ex: Introduction au JavaScript"
                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2.5 border transition-all"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        placeholder="Une brève description du contenu de la formation..."
                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2.5 border transition-all resize-none"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link
                        to="/admin"
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        {isEditing ? 'Mettre à jour' : 'Créer la formation'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CourseFormPage;
