import React, { useState, useEffect } from 'react';
import { Folder, Save, AlertCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
    const [rootPath, setRootPath] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const path = await window.electronAPI.getRoot();
            setRootPath(path);
        } catch (err) {
            setError('Impossible de charger la configuration.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectDirectory = async () => {
        try {
            const path = await window.electronAPI.selectDirectory();
            if (path) {
                setRootPath(path);
                // Auto-save on selection? Or wait for save button?
                // Let's wait for save button to be explicit, or maybe auto-save is better for UX here?
                // Given the requirement, let's make it explicit save or auto-save.
                // Actually, changing root is a big deal, let's do it immediately but warn.
                await handleSave(path);
            }
        } catch (err) {
            setError('Erreur lors de la sélection du dossier.');
            console.error(err);
        }
    };

    const handleSave = async (path: string) => {
        setLoading(true);
        setError(null);
        setSuccessMsg(null);
        try {
            const result = await window.electronAPI.setRoot(path);
            if (result.success) {
                setSuccessMsg('Dossier racine mis à jour avec succès ! L\'application va recharger les données.');
                // Optionally reload data context if we have one
            } else {
                setError(result.error || 'Erreur inconnue lors de la sauvegarde.');
            }
        } catch (err) {
            setError('Erreur lors de la sauvegarde.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Paramètres</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-blue-600" />
                    Emplacement des données
                </h2>

                <p className="text-gray-600 mb-6">
                    Choisissez le dossier où seront stockés tous vos cours et ressources.
                    Cela vous permet de sauvegarder vos données sur un disque externe ou un dossier synchronisé (Dropbox, OneDrive, etc.).
                </p>

                <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={rootPath}
                            readOnly
                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSelectDirectory}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Folder className="w-4 h-4" />
                            Parcourir...
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                            <Save className="w-5 h-5" />
                            {successMsg}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
