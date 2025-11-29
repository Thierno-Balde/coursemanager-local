import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ResourceBadge } from '../components/ResourceBadge';
import { ArrowLeft, BookOpen, Download, FileText, MonitorPlay, Layers, Plus, X, FilePlus, PlusCircle, Link as LinkIcon, Trash2, FolderPlus } from 'lucide-react';
import { CourseItem, Resource, ResourceCategory, ResourceKind } from '../types';

const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { courses, addModule, addResource, deleteResource, deleteModule } = useStore();

  const initialCourse = courses.find(c => c.id === courseId);
  const items = initialCourse?.items || [];

  // --- ÉTATS MODALE MODULE (Ajout d'une ligne) ---
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMainLabel, setNewMainLabel] = useState('Support de cours');
  const [newMainUrl, setNewMainUrl] = useState('');
  const [newMainFileInfo, setNewMainFileInfo] = useState<{
    absolutePath?: string;
    relativePath?: string;
    name?: string;
    format?: string;
  } | null>(null);

  // --- ÉTATS MODALE RESSOURCE (Ajout dans une colonne) ---
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [targetItemId, setTargetItemId] = useState<string | null>(null);
  const [targetCategory, setTargetCategory] = useState<ResourceCategory | null>(null);

  const [resLabel, setResLabel] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resFormat, setResFormat] = useState<string>('pdf');
  const [resFileInfo, setResFileInfo] = useState<{
    absolutePath?: string;
    relativePath?: string;
    name?: string;
    format?: string;
  } | null>(null);

  const guessFormat = (input?: string) => {
    if (!input) return 'other';
    const ext = input.split('.').pop()?.toLowerCase() || input.toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['ppt', 'pptx'].includes(ext)) return 'ppt';
    if (['mp4', 'mkv', 'avi', 'mov'].includes(ext)) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['zip', 'rar', '7z'].includes(ext)) return 'zip';
    if (ext.startsWith('http')) return 'link';
    return ext;
  };

  const isHttp = (value?: string) => (value ? value.startsWith('http') : false);

  const getResourcesByCategory = (item: CourseItem, category: ResourceCategory) =>
    (item.resources || []).filter(res => res.category === category);

  const handleDeleteResource = (itemId: string, resourceId: string, relativePath?: string) => {
    if (!initialCourse) return;
    deleteResource(initialCourse.id, itemId, resourceId, relativePath);
  };

  const handleDeleteModule = (moduleId: string) => {
    if (!initialCourse) return;
    deleteModule(initialCourse.id, moduleId);
  };

  const openResource = (resource?: Resource) => {
    if (!resource) return;
    if (resource.kind === 'file' && resource.path && window.electronAPI?.openPath) {
      window.electronAPI.openPath(resource.path);
      return;
    }
    if (resource.url) {
      window.open(resource.url, '_blank');
    } else if (resource.path && window.electronAPI?.openPath) {
      window.electronAPI.openPath(resource.path);
    }
  };

  if (!initialCourse) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Cours introuvable</h2>
        <p className="text-slate-500 mb-6">Le cours demandé n'existe pas ou a été déplacé.</p>
        <Link
          to="/"
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
        >
          Retour au portail
        </Link>
      </div>
    );
  }

  // --- GESTION MODULES ---
  const openModuleModal = () => {
    setNewTitle('');
    setNewDesc('');
    setNewMainLabel('Support de cours');
    setNewMainUrl('');
    setNewMainFileInfo(null);
    setIsModuleModalOpen(true);
  };

  const handleSelectMainFile = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.importResourceFile?.();
      if (result && !result.error) {
        setNewMainFileInfo(result);
        setNewMainUrl(result.absolutePath || result.relativePath || '');
        // Auto-fill label if empty or default
        if (!newMainLabel || newMainLabel === 'Support de cours') {
          setNewMainLabel(result.name);
        }
        if (result.format) {
          setResFormat(result.format);
        }
      } else if (result?.error) {
        console.error(result.error);
      }
    } else {
      alert("Fonctionnalité disponible uniquement sur l'application de bureau.");
    }
  };

  const closeModuleModal = () => {
    setIsModuleModalOpen(false);
    setNewMainFileInfo(null);
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const resources: Resource[] = [];
    const hasMain = newMainLabel.trim() || newMainUrl.trim() || newMainFileInfo;
    if (hasMain) {
      resources.push({
        id: crypto.randomUUID ? crypto.randomUUID() : `res-${Date.now()}`,
        label: newMainLabel || newMainFileInfo?.name || 'Support',
        kind: newMainFileInfo ? 'file' : isHttp(newMainUrl) ? 'link' : 'file',
        category: 'main',
        format: newMainFileInfo?.format || guessFormat(newMainFileInfo?.name || newMainUrl) || 'other',
        path: newMainFileInfo?.absolutePath || (!isHttp(newMainUrl) ? newMainUrl : undefined),
        relativePath: newMainFileInfo?.relativePath,
        url: isHttp(newMainUrl) ? newMainUrl : undefined,
        createdAt: new Date().toISOString(),
      });
    }

    const newItem: CourseItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      resources,
    };

    if (initialCourse) {
      addModule(initialCourse.id, newItem);
    }
    closeModuleModal();
  };

  // --- GESTION RESSOURCES ---
  const openResourceModal = (itemId: string, category: 'pdfs' | 'videos' | 'extras') => {
    setTargetItemId(itemId);
    setTargetCategory(category);
    setResLabel('');
    setResUrl('');
    setResFileInfo(null);

    // Définir un type par défaut intelligent selon la colonne
    if (category === 'pdfs') setResFormat('pdf');
    else if (category === 'videos') setResFormat('video');
    else setResFormat('link');

    setIsResourceModalOpen(true);
  };

  const closeResourceModal = () => {
    setIsResourceModalOpen(false);
    setTargetItemId(null);
    setTargetCategory(null);
    setResFileInfo(null);
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resLabel.trim() || !targetItemId || !targetCategory) return;

    const isFile = !!resFileInfo || (!isHttp(resUrl) && !!resUrl);
    const resourceInput = {
      label: resLabel,
      category: targetCategory,
      kind: (isFile ? 'file' : 'link') as ResourceKind,
      format: resFileInfo?.format || guessFormat(resFileInfo?.name || resUrl || resFormat),
      path: resFileInfo?.absolutePath || (isFile ? resUrl : undefined),
      relativePath: resFileInfo?.relativePath,
      url: !isFile && resUrl ? resUrl : undefined,
    };

    // Mise à jour via le store
    if (initialCourse && targetItemId && targetCategory) {
      addResource(initialCourse.id, targetItemId, resourceInput);
    }

    closeResourceModal();
  };

  const handleSelectResFile = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.importResourceFile?.();
      if (result && !result.error) {
        setResFileInfo(result);
        setResUrl(result.absolutePath || result.relativePath || '');
        // Auto-fill label if empty
        if (!resLabel) {
          setResLabel(result.name);
        }

        const guessed = guessFormat(result.format || result.name);
        setResFormat(guessed);
      } else if (result?.error) {
        console.error(result.error);
      }
    } else {
      alert("Fonctionnalité disponible uniquement sur l'application de bureau.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* Header Sticky */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 -ml-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              title="Retour à l'accueil"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen size={20} className="text-brand-600 hidden sm:block" />
                {initialCourse.name}
              </h1>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full hidden sm:block">
            {items.length} Modules
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">

        {/* Course Intro Card & Actions */}
        <div className="mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{initialCourse.name}</h2>
            <p className="text-slate-600 max-w-3xl">{initialCourse.description}</p>
          </div>
          <button
            onClick={openModuleModal}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 hover:shadow-md active:scale-95 transition-all shadow-sm"
          >
            <Plus size={18} />
            <span>Ajouter un module</span>
          </button>
        </div>

        {/* The 4-Column Table/Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Table Header (Hidden on small screens) */}
          <div className="hidden lg:grid grid-cols-12 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-16 z-10">
            <div className="col-span-4 px-6 py-4 border-r border-slate-200 flex items-center gap-2">
              <BookOpen size={14} /> Titre / Support Principal
            </div>
            <div className="col-span-3 px-6 py-4 border-r border-slate-200 flex items-center gap-2">
              <FileText size={14} /> Documents & PDF
            </div>
            <div className="col-span-3 px-6 py-4 border-r border-slate-200 flex items-center gap-2">
              <MonitorPlay size={14} /> Vidéos
            </div>
            <div className="col-span-2 px-6 py-4 flex items-center gap-2">
              <Layers size={14} /> Autres Ressources
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {items.length > 0 ? (
              items.map((item, index) => {
                const mainResource = getResourcesByCategory(item, 'main')[0];
                const pdfResources = getResourcesByCategory(item, 'pdfs');
                const videoResources = getResourcesByCategory(item, 'videos');
                const extraResources = getResourcesByCategory(item, 'extras');

                return (
                  <div key={item.id} className="lg:grid lg:grid-cols-12 hover:bg-slate-50/50 transition-colors group">

                    {/* COL 1: Main Title & Support (Large) */}
                    <div className="col-span-4 p-6 lg:border-r border-slate-100">
                      <div className="flex items-start justify-between mb-2 gap-3">
                        <div className="flex">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold mr-3 shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">
                              {item.title}
                            </h3>
                            {item.description && (
                              <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            {/* Main Action Button */}
                            <div className="mt-3">
                              <button
                                onClick={() => openResource(mainResource)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-50 text-brand-700 rounded-lg border border-brand-200 hover:bg-brand-100 hover:border-brand-300 hover:shadow-sm transition-all text-sm font-medium w-full sm:w-auto justify-center sm:justify-start"
                                disabled={!mainResource}
                              >
                                <Download size={18} />
                                <span>{mainResource ? mainResource.label : 'Support non défini'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteModule(item.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                          title="Supprimer ce module"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* COL 2: PDFs */}
                    <div className="col-span-3 p-4 lg:p-6 lg:border-r border-slate-100 bg-slate-50/30 lg:bg-transparent flex flex-col">
                      <div className="flex items-center justify-between lg:hidden mb-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase">Documents</h4>
                      </div>

                      <div className="flex flex-col gap-2 flex-1">
                        {pdfResources.map((res) => (
                          <ResourceBadge
                            key={res.id}
                            resource={res}
                            onOpen={() => openResource(res)}
                            onDelete={() => handleDeleteResource(item.id, res.id, res.relativePath)}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => openResourceModal(item.id, 'pdfs')}
                        className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-brand-600 transition-colors py-1 px-2 hover:bg-slate-100 rounded-md w-fit"
                        title="Ajouter un document"
                      >
                        <PlusCircle size={14} />
                        Ajouter PDF/Doc
                      </button>
                    </div>

                    {/* COL 3: Videos */}
                    <div className="col-span-3 p-4 lg:p-6 lg:border-r border-slate-100 flex flex-col">
                      <div className="flex items-center justify-between lg:hidden mb-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase">Vidéos</h4>
                      </div>

                      <div className="flex flex-col gap-2 flex-1">
                        {videoResources.map((res) => (
                          <ResourceBadge
                            key={res.id}
                            resource={res}
                            onOpen={() => openResource(res)}
                            onDelete={() => handleDeleteResource(item.id, res.id, res.relativePath)}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => openResourceModal(item.id, 'videos')}
                        className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-brand-600 transition-colors py-1 px-2 hover:bg-slate-100 rounded-md w-fit"
                        title="Ajouter une vidéo"
                      >
                        <PlusCircle size={14} />
                        Ajouter Vidéo
                      </button>
                    </div>

                    {/* COL 4: Extras */}
                    <div className="col-span-2 p-4 lg:p-6 bg-slate-50/30 lg:bg-transparent flex flex-col">
                      <div className="flex items-center justify-between lg:hidden mb-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase">Divers</h4>
                      </div>

                      <div className="flex flex-col gap-2 flex-1">
                        {extraResources.map((res) => (
                          <ResourceBadge
                            key={res.id}
                            resource={res}
                            onOpen={() => openResource(res)}
                            onDelete={() => handleDeleteResource(item.id, res.id, res.relativePath)}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => openResourceModal(item.id, 'extras')}
                        className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-brand-600 transition-colors py-1 px-2 hover:bg-slate-100 rounded-md w-fit"
                        title="Ajouter une ressource"
                      >
                        <PlusCircle size={14} />
                        Ajouter Autre
                      </button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <Layers size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Aucun module disponible</h3>
                <p className="text-slate-500 mt-1">Commencez par ajouter votre premier module de cours.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MODALE AJOUT MODULE --- */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeModuleModal}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FilePlus size={20} className="text-brand-600" />
                Nouveau Module
              </h3>
              <button onClick={closeModuleModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full p-1 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddModule} className="p-6 space-y-4">
              <div>
                <label htmlFor="itemTitle" className="block text-sm font-medium text-slate-700 mb-1">Titre du module <span className="text-red-500">*</span></label>
                <input type="text" id="itemTitle" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: UE3 - Sécurité" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" autoFocus required />
              </div>
              <div>
                <label htmlFor="itemDesc" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea id="itemDesc" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Détails..." rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none" />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-brand-600" />
                  Support Principal
                </h4>

                <div className="space-y-3">
                  {/* File Selection Area */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Fichier ou Lien</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMainUrl}
                          onChange={(e) => setNewMainUrl(e.target.value)}
                          placeholder="https://... ou chemin fichier"
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleSelectMainFile}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                          <FolderPlus size={16} />
                          Parcourir
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Label Input */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nom affiché</label>
                    <input
                      type="text"
                      value={newMainLabel}
                      onChange={(e) => setNewMainLabel(e.target.value)}
                      placeholder="Ex: Support de cours PDF"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    />
                  </div>

                  {/* File Info Badge */}
                  {newMainFileInfo && (
                    <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 flex items-center gap-3">
                      <div className="p-2 bg-white rounded-md text-brand-600 shadow-sm">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brand-900 truncate">{newMainFileInfo.name}</p>
                        <p className="text-xs text-brand-600 truncate">{newMainFileInfo.absolutePath}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewMainFileInfo(null);
                          setNewMainUrl('');
                        }}
                        className="text-brand-400 hover:text-brand-700 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModuleModal} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Annuler</button>
                <button type="submit" disabled={!newTitle.trim()} className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODALE AJOUT RESSOURCE --- */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeResourceModal}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <LinkIcon size={20} className="text-brand-600" />
                Ajouter une ressource
              </h3>
              <button onClick={closeResourceModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full p-1 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="p-6 space-y-4">
              <div className="text-sm text-slate-500 mb-4 bg-blue-50 text-blue-700 px-3 py-2 rounded-md border border-blue-100">
                Ajout dans la colonne : <strong>
                  {targetCategory === 'pdfs' ? 'Documents & PDF' :
                    targetCategory === 'videos' ? 'Vidéos' : 'Autres Ressources'}
                </strong>
              </div>

              <div>
                <label htmlFor="resLabel" className="block text-sm font-medium text-slate-700 mb-1">Nom affiché <span className="text-red-500">*</span></label>
                <input type="text" id="resLabel" value={resLabel} onChange={(e) => setResLabel(e.target.value)} placeholder="Ex: Fiche exercice..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type de ressource</label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { id: 'pdf', label: 'PDF', icon: FileText },
                    { id: 'ppt', label: 'PowerPoint', icon: MonitorPlay },
                    { id: 'video', label: 'Vidéo', icon: MonitorPlay },
                    { id: 'image', label: 'Image', icon: Layers },
                    { id: 'zip', label: 'Archive', icon: Layers },
                    { id: 'link', label: 'Lien Web', icon: LinkIcon },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setResFormat(type.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${resFormat === type.id
                        ? 'bg-brand-50 border-brand-500 text-brand-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      <type.icon size={20} className="mb-1" />
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="resUrl" className="block text-sm font-medium text-slate-700 mb-1">Fichier ou Lien</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="resUrl"
                    value={resUrl}
                    onChange={(e) => setResUrl(e.target.value)}
                    placeholder="https://... ou chemin fichier"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleSelectResFile}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                  >
                    <FolderPlus size={16} />
                    Parcourir
                  </button>
                </div>

                {/* File Info Badge for Resource */}
                {resFileInfo && (
                  <div className="mt-3 bg-brand-50 border border-brand-100 rounded-lg p-3 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-md text-brand-600 shadow-sm">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-900 truncate">{resFileInfo.name}</p>
                      <p className="text-xs text-brand-600 truncate">{resFileInfo.absolutePath}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setResFileInfo(null);
                        setResUrl('');
                      }}
                      className="text-brand-400 hover:text-brand-700 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeResourceModal} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Annuler</button>
                <button type="submit" disabled={!resLabel.trim()} className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePage;
