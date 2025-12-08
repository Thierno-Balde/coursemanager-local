import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useSession } from '../context/SessionContext';
import { Ressource, ProgressStatus } from '../types';
import TrackingModal from '../components/TrackingModal';
import {
  ArrowLeft, Presentation, FileText, Video, Link as LinkIcon,
  ExternalLink, Play, ChevronRight, Folder
} from 'lucide-react';

const ModulePage: React.FC = () => {
  const { id, moduleId } = useParams<{ id: string; moduleId: string }>();
  const { formations, groups, updateGroupProgress } = useStore();
  const { currentGroupId } = useSession();
  const navigate = useNavigate();
  const [rootDirectory, setRootDirectory] = useState<string>('');
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [returnPath, setReturnPath] = useState('');

  const formation = formations.find(f => f.id === id);
  const module = formation?.modules.find(m => m.id === moduleId);
  const currentGroup = groups.find(g => g.id === currentGroupId);

  useEffect(() => {
    const fetchRoot = async () => {
      if (window.electronAPI) {
        const root = await window.electronAPI.getRoot();
        setRootDirectory(root);
      }
    };
    fetchRoot();
  }, []);

  if (!formation || !module) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Module introuvable</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const pptPrincipal = module.ressources.find(r => r.role === 'principal' && r.type === 'ppt');
  const documents = module.ressources.filter(r => r.type === 'pdf');
  const videos = module.ressources.filter(r => r.type === 'video');
  const liens = module.ressources.filter(r => r.type === 'lien');

  const handleOpenResource = async (resource: Ressource) => {
    if (window.electronAPI) {
      if (resource.stockage === 'local' && resource.chemin) {
        // Construct absolute path using the fetched root directory
        // resource.chemin is relative (e.g. "resources/file.pdf")
        // We need to ensure we have the correct separator
        const separator = rootDirectory.includes('\\') ? '\\' : '/';
        const absolutePath = `${rootDirectory}${separator}${resource.chemin}`;

        await window.electronAPI.openPath(absolutePath);
      } else if (resource.url) {
        await window.electronAPI.openPath(resource.url);
      }
    } else {
      console.warn("Electron API not available");
      if (resource.url) window.open(resource.url, '_blank');
    }
  };

  const handleReturnClick = (path: string) => {
    setReturnPath(path); // Store path for navigation after modal
    if (currentGroupId && currentGroup) {
      setShowTrackingModal(true);
    } else {
      navigate(path);
    }
  };

  const handleConfirmTracking = async (status: ProgressStatus) => {
    if (currentGroupId && moduleId) {
      await updateGroupProgress(currentGroupId, moduleId, status);
    }
    setShowTrackingModal(false);
    navigate(returnPath);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link to={`/formation/${formation.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
              <Folder className="w-4 h-4" />
              <span className="hidden sm:inline">{formation.titre}</span>
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">{module.titre}</span>
          </div>
          <button
            onClick={() => handleReturnClick(`/formation/${formation.id}`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Retour</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-8">
        {/* Page Heading */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{module.titre}</h1>
          {module.description && (
            <p className="text-slate-500 dark:text-slate-400 text-lg">{module.description}</p>
          )}
        </div>

        {/* Bloc 1: Main Presentation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-500">
              <Presentation className="w-12 h-12" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {pptPrincipal ? pptPrincipal.titre : "Aucune présentation principale"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                {pptPrincipal ? "Support de cours principal pour ce module." : "Ce module ne contient pas encore de support principal."}
              </p>
              {pptPrincipal && (
                <div className="pt-2">
                  <button
                    onClick={() => handleOpenResource(pptPrincipal)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm hover:shadow-md"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Ouvrir la présentation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bloc 2: Ancillary Resources */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Documents Section */}
          {documents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                Documents
              </h3>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => handleOpenResource(doc)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                  >
                    <FileText className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                    <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors line-clamp-2">
                      {doc.titre}
                    </span>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Videos Section */}
          {videos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-green-500" />
                Vidéos
              </h3>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                {videos.map(video => (
                  <button
                    key={video.id}
                    onClick={() => handleOpenResource(video)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                  >
                    <Video className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                    <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors line-clamp-2">
                      {video.titre}
                    </span>
                    <Play className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Liens Utiles Section */}
          {liens.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-500" />
                Liens Utiles
              </h3>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                {liens.map(lien => (
                  <button
                    key={lien.id}
                    onClick={() => handleOpenResource(lien)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                  >
                    <LinkIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors line-clamp-2">
                      {lien.titre}
                    </span>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-center">
          <button
            onClick={() => handleReturnClick(`/formation/${formation.id}`)}
            className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
          >
            Retour au sommaire de la formation
          </button>
        </div>
      </main>

      {currentGroup && module && (
        <TrackingModal
          show={showTrackingModal}
          onClose={() => setShowTrackingModal(false)}
          group={currentGroup}
          moduleTitle={module.titre}
          onConfirm={handleConfirmTracking}
        />
      )}
    </div>
  );
};

export default ModulePage;
