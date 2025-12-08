import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Folder, Save, AlertCircle, Database, Upload, Download } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const { settings, updateSettings, exportData, importData } = useStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSelectDirectory = async () => {
        if (!window.electronAPI) {
            setError("Fonctionnalité disponible uniquement dans l'application Electron.");
            return;
        }

        try {
            const path = await window.electronAPI.selectDirectory();
            if (path) {
                setLoading(true);
                setError(null);
                setSuccessMsg(null);

                await updateSettings({ rootDirectory: path });

                setSuccessMsg('Dossier racine mis à jour avec succès !');
            }
        } catch (err) {
            setError('Erreur lors de la sélection ou de la sauvegarde du dossier.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = () => {
        try {
            const data = exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `coursemanager_data_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setSuccessMsg('Données exportées avec succès !');
            setError(null);
        } catch (err) {
            setError('Erreur lors de l\'exportation des données.');
            setSuccessMsg(null);
            console.error(err);
        }
    };

    const handleImportButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = e.target?.result as string;
                    const success = importData(jsonData);
                    if (success) {
                        setSuccessMsg('Données importées avec succès !');
                        setError(null);
                    } else {
                        setError('Format de données invalide ou échec de l\'importation.');
                        setSuccessMsg(null);
                    }
                } catch (err) {
                    setError('Erreur lors du traitement du fichier.');
                    setSuccessMsg(null);
                    console.error(err);
                }
            };
            reader.readAsText(file);
        }
        // Clear the file input after use to allow re-importing the same file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">Paramètres</h1>

            <div className="bg-white dark:bg-slate-900/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                    <Folder className="w-5 h-5 text-blue-600" />
                    Emplacement des données
                </h2>

                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Choisissez le dossier où seront stockés tous vos cours et ressources.
                    Cela vous permet de sauvegarder vos données sur un disque externe ou un dossier synchronisé.
                </p>

                <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={settings.rootDirectory || "Aucun dossier sélectionné"}
                            readOnly
                            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
                        />
                        <button
                            onClick={handleSelectDirectory}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Folder className="w-4 h-4" />
                            {loading ? 'Mise à jour...' : 'Parcourir...'}
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
                            <Save className="w-5 h-5" />
                            {successMsg}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                    <Database className="w-5 h-5 text-blue-600" />
                    Maintenance des données
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Options avancées pour la gestion de vos données.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={handleExportData}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Exporter les données
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImportData}
                        accept="application/json"
                        className="hidden"
                    />
                    <button
                        onClick={handleImportButtonClick}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Importer les données
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        {successMsg}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
