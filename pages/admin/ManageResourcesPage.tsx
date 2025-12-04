import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Ressource, RessourceType, RessourceRole } from '../../types';
import {
  FileText, Video, Link as LinkIcon, PlusCircle, Trash2,
  ExternalLink, File, ChevronRight, UploadCloud, AlertCircle
} from 'lucide-react';

const ManageResourcesPage: React.FC = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const { formations, addRessource, deleteRessource } = useStore();

  const formation = formations.find(f => f.id === courseId);
  const module = formation?.modules.find(m => m.id === moduleId);

  const [newType, setNewType] = useState<RessourceType>('pdf');
  const [newRole, setNewRole] = useState<RessourceRole>('annexe');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!formation || !module) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Module introuvable</h2>
        <Link to="/admin" className="text-blue-600 hover:underline">Retourner à la liste</Link>
      </div>
    );
  }

  const pptPrincipal = module.ressources.find(r => r.role === 'principal' && r.type === 'ppt');
  const otherResources = module.ressources.filter(r => r.id !== pptPrincipal?.id);

  const handleFileSelect = async (role: RessourceRole, type: RessourceType) => {
    if (window.electronAPI) {
      setLoading(true);
      try {
        const result = await window.electronAPI.importFile();
        if (result) {
          if (result.error) {
            alert(`Erreur lors de l'import: ${result.error}`);
            return;
          }
          const newResource: Ressource = {
            id: result.id, // Use ID from backend
            titre: result.name,
            type: type, // User selected type (e.g. ppt, pdf, video)
            role: role,
            stockage: 'local',
            chemin: result.relativePath,
          };
          addRessource(formation.id, module.id, newResource);
        }
      } catch (error) {
        console.error("Import failed:", error);
        alert("Erreur lors de l'import du fichier.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Fonctionnalité disponible uniquement dans l'application Electron.");
    }
  };

  const handleDelete = async (resource: Ressource) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      if (resource.stockage === 'local' && resource.chemin && window.electronAPI) {
        try {
          const result = await window.electronAPI.deleteResource(resource.chemin);
          if (!result.success) {
            console.error("Failed to delete file:", result.error);
            // Optionally warn user, but we still remove from DB?
            // Better to warn but proceed with DB deletion to keep state clean if file is gone
          }
        } catch (error) {
          console.error("Error deleting resource file:", error);
        }
      }
      deleteRessource(formation.id, module.id, resource.id);
    }
  };

  const handleAddResource = async () => {
    if (newType === 'lien') {
      if (!linkUrl.trim()) return;
      const newResource: Ressource = {
        id: crypto.randomUUID(),
        titre: linkTitle.trim() || linkUrl.trim(),
        type: 'lien',
        role: newRole,
        stockage: 'cloud',
        url: linkUrl.trim(),
      };
      addRessource(formation.id, module.id, newResource);
      setLinkTitle('');
      setLinkUrl('');
      return;
    }

    // pdf / video / ppt additions rely on Electron file picker
    await handleFileSelect(newRole, newType);
  };

  const getIcon = (type: RessourceType) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'video': return <Video className="w-5 h-5 text-green-500" />;
      case 'ppt': return <File className="w-5 h-5 text-orange-500" />; // Lucide doesn't have specific PPT icon
      case 'lien': return <LinkIcon className="w-5 h-5 text-blue-500" />;
      default: return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto p-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Formations</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/admin/course/${formation.id}/modules`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{formation.titre}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-slate-900 dark:text-slate-100">{module.titre}</span>
      </div>

      {/* PageHeading */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Ressources</h1>

        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 px-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ajouter :</span>
          </div>
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as RessourceType)}
            className="rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-blue-500 focus:border-blue-500 py-2"
          >
            <option value="pdf">PDF</option>
            <option value="video">Vidéo</option>
            <option value="ppt">PPT</option>
            <option value="lien">Lien Web</option>
          </select>

          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as RessourceRole)}
            className="rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-blue-500 focus:border-blue-500 py-2"
          >
            <option value="annexe">Annexe</option>
            <option value="principal">Principal</option>
          </select>

          {newType === 'lien' && (
            <div className="flex gap-2">
              <input
                type="text"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="Titre"
                className="rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm px-3 py-2 w-32"
              />
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm px-3 py-2 w-48"
              />
            </div>
          )}

          <button
            onClick={handleAddResource}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? <UploadCloud className="w-4 h-4 animate-bounce" /> : <PlusCircle className="w-4 h-4" />}
            <span className="truncate">Ajouter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main PPT */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <File className="w-5 h-5 text-orange-500" />
            Support Principal
          </h2>

          <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-full">
            {pptPrincipal ? (
              <div className="flex flex-col gap-6 h-full justify-between">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <File className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white line-clamp-2">{pptPrincipal.titre}</p>
                    <p className="text-xs text-slate-500 mt-1">Format PPT • Principal</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(pptPrincipal)}
                  className="w-full py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-8">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-slate-900 dark:text-white">Aucun support principal</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Ajoutez un fichier PPT ou PDF comme support de cours principal.</p>
                </div>
                <button
                  onClick={() => handleFileSelect('principal', 'ppt')}
                  disabled={loading}
                  className="mt-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Sélectionner un fichier
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Resource List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-blue-500" />
            Ressources Complémentaires
          </h2>

          <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {otherResources.length > 0 ? (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {otherResources.map(resource => (
                  <div key={resource.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {getIcon(resource.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">{resource.titre}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="uppercase">{resource.type}</span>
                          <span>•</span>
                          <span className="capitalize">{resource.stockage}</span>
                          {resource.url && (
                            <>
                              <span>•</span>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 flex items-center gap-1">
                                {resource.url} <ExternalLink className="w-3 h-3" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(resource)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-slate-500 dark:text-slate-400">Aucune ressource complémentaire.</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Ajoutez des PDF, vidéos ou liens pour enrichir ce module.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageResourcesPage;
