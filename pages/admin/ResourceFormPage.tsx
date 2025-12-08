import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Ressource, RessourceType, RessourceRole } from '../../types';
import { Plus, Edit, Save, X, ChevronRight, UploadCloud } from 'lucide-react';

const ResourceFormPage: React.FC = () => {
    const { courseId, moduleId, resourceId } = useParams<{ courseId: string; moduleId: string; resourceId?: string }>();
    const { formations, addRessource, updateRessource } = useStore();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [role, setRole] = useState<RessourceRole>('annexe');
    const [type, setType] = useState<RessourceType>('pdf');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const formation = formations.find(f => f.id === courseId);
    const module = formation?.modules.find(m => m.id === moduleId);
    const isEditing = Boolean(resourceId);

    useEffect(() => {
        if (isEditing && module) {
            const resource = module.ressources.find(r => r.id === resourceId);
            if (resource) {
                setTitle(resource.titre);
                setRole(resource.role);
                setType(resource.type);
                if (resource.type === 'lien') {
                    setUrl(resource.url || '');
                }
            } else {
                navigate(`/admin/course/${courseId}/module/${moduleId}/resources`);
            }
        }
    }, [isEditing, courseId, moduleId, resourceId, module, navigate]);

    if (!formation || !module) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Module introuvable</h2>
                <Link to="/admin" className="text-blue-600 hover:underline">Retourner à la liste</Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (type === 'lien') {
                const resourceData: Partial<Ressource> = {
                    titre: title.trim() || url.trim(),
                    type: 'lien',
                    role,
                    stockage: 'cloud',
                    url: url.trim(),
                };
                if (isEditing) {
                    updateRessource(formation.id, module.id, resourceId!, resourceData);
                } else {
                    addRessource(formation.id, module.id, { ...resourceData, id: crypto.randomUUID() } as Ressource);
                }
            } else { // File-based resource
                if (!isEditing) { // Only handle file selection on create
                    if (window.electronAPI) {
                        const result = await window.electronAPI.importFile();
                        if (result && !result.error) {
                            const newResource: Ressource = {
                                id: result.id,
                                titre: title.trim() || result.name,
                                type,
                                role,
                                stockage: 'local',
                                chemin: result.relativePath,
                            };
                            addRessource(formation.id, module.id, newResource);
                        } else if (result.error) {
                            alert(`Erreur: ${result.error}`);
                        }
                    } else {
                        alert("Fonctionnalité d'upload disponible uniquement dans l'application Electron.");
                    }
                } else { // On edit, we just update metadata
                    updateRessource(formation.id, module.id, resourceId!, { titre: title, role });
                }
            }
            navigate(`/admin/course/${courseId}/module/${moduleId}/resources`);
        } catch (error) {
            console.error("Submit failed:", error);
            alert("Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(`/admin/course/${courseId}/module/${moduleId}/resources`);
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex items-center gap-2 mb-8 text-sm text-slate-500 dark:text-slate-400">
                <Link to="/admin" className="hover:text-blue-600">Formations</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to={`/admin/course/${courseId}/modules`} className="hover:text-blue-600">{formation.titre}</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to={`/admin/course/${courseId}/module/${moduleId}/resources`} className="hover:text-blue-600">{module.titre}</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium text-slate-900 dark:text-slate-100">{isEditing ? 'Modifier' : 'Nouvelle'}</span>
            </div>

            <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {isEditing ? <Edit className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                        {isEditing ? 'Modifier la ressource' : 'Nouvelle ressource'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="title">Titre</label>
                        <input
                            id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                            placeholder="Ex: Introduction à React"
                            className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="type">Type</label>
                            <select id="type" value={type} onChange={(e) => setType(e.target.value as RessourceType)} disabled={isEditing}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 disabled:opacity-50">
                                <option value="pdf">PDF</option>
                                <option value="video">Vidéo</option>
                                <option value="ppt">PPT</option>
                                <option value="lien">Lien Web</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="role">Rôle</label>
                            <select id="role" value={role} onChange={(e) => setRole(e.target.value as RessourceRole)}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                <option value="annexe">Annexe</option>
                                <option value="principal">Principal</option>
                            </select>
                        </div>
                    </div>

                    {type === 'lien' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="url">URL</label>
                            <input
                                id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required
                                placeholder="https://example.com"
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                            />
                        </div>
                    )}
                    
                    {type !== 'lien' && !isEditing && (
                        <div className="p-4 text-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                           <p className="text-sm text-slate-500 dark:text-slate-400">La sélection du fichier se fera après avoir cliqué sur "Enregistrer".</p>
                        </div>
                    )}


                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg">
                            Annuler
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {loading ? <UploadCloud className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isEditing ? 'Mettre à jour' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResourceFormPage;
