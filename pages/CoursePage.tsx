import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ResourceBadge } from '../components/ResourceBadge';
import { ArrowLeft, BookOpen, Download, FileText, MonitorPlay, Layers, Plus, X, FilePlus, PlusCircle, Link as LinkIcon } from 'lucide-react';
import { CourseItem, Resource, ResourceType } from '../types';

const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { courses, addModule, addResource } = useStore();

  const initialCourse = courses.find(c => c.id === courseId);

  // État local pour gérer les items du cours (dérivé du store maintenant)
  const [items, setItems] = useState<CourseItem[]>(initialCourse ? initialCourse.items : []);

  // --- ÉTATS MODALE MODULE (Ajout d'une ligne) ---
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMainLabel, setNewMainLabel] = useState('Support de cours');
  const [newMainUrl, setNewMainUrl] = useState('');

  // --- ÉTATS MODALE RESSOURCE (Ajout dans une colonne) ---
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [targetItemId, setTargetItemId] = useState<string | null>(null);
  const [targetCategory, setTargetCategory] = useState<'pdfs' | 'videos' | 'extras' | null>(null);

  const [resLabel, setResLabel] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState<ResourceType>('pdf');

  // Mettre à jour les items si le cours change (navigation)
  useEffect(() => {
    if (initialCourse) {
      setItems(initialCourse.items);
    }
  }, [initialCourse]);

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
    setNewMainLabel('Support de cours');
    setNewMainUrl('');
    setIsModuleModalOpen(true);
  };

  const handleSelectMainFile = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.selectFile();
      if (result) {
        setNewMainUrl(result.path);
        // Auto-fill label if empty or default
        if (!newMainLabel || newMainLabel === 'Support de cours') {
          setNewMainLabel(result.name);
        }
      }
    } else {
      alert("Fonctionnalité disponible uniquement sur l'application de bureau.");
    }
  };

  const closeModuleModal = () => {
    setIsModuleModalOpen(false);
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: CourseItem = {
      id: `item-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      main: {
        label: newMainLabel || 'Support',
        type: 'ppt',
        url: newMainUrl || '#'
      },
      pdfs: [],
      videos: [],
      extras: []
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

    // Définir un type par défaut intelligent selon la colonne
    if (category === 'pdfs') setResType('pdf');
    else if (category === 'videos') setResType('video');
    else setResType('link');

    setIsResourceModalOpen(true);
  };

  const closeResourceModal = () => {
    setIsResourceModalOpen(false);
    setTargetItemId(null);
    setTargetCategory(null);
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resLabel.trim() || !targetItemId || !targetCategory) return;

    const newResource: Resource = {
      label: resLabel,
      url: resUrl || '#',
      type: resType
    };

    // Mise à jour via le store
    if (initialCourse && targetItemId && targetCategory) {
      addResource(initialCourse.id, targetItemId, targetCategory, newResource);
    }

    closeResourceModal();
  };

  const handleSelectResFile = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.selectFile();
      if (result) {
        setResUrl(result.path);
        // Auto-fill label if empty
        if (!resLabel) {
          setResLabel(result.name);
        }

        // Auto-detect type based on extension
        const ext = result.name.split('.').pop()?.toLowerCase();
        if (['pdf'].includes(ext || '')) setResType('pdf');
        else if (['ppt', 'pptx'].includes(ext || '')) setResType('ppt');
        else if (['mp4', 'mkv', 'avi'].includes(ext || '')) setResType('video');
        else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) setResType('image');
        else if (['zip', 'rar', '7z'].includes(ext || '')) setResType('zip');
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
            <div className="col-span-4 p-4 border-r border-slate-200 flex items-center gap-2">
              <BookOpen size={14} /> Titre / Support Principal
            </div>
            <div className="col-span-3 p-4 border-r border-slate-200 flex items-center gap-2">
              <FileText size={14} /> Documents & PDF
            </div>
            <div className="col-span-3 p-4 border-r border-slate-200 flex items-center gap-2">
              <MonitorPlay size={14} /> Vidéos
            </div>
            <div className="col-span-2 p-4 flex items-center gap-2">
              <Layers size={14} /> Autres Ressources
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div key={item.id} className="lg:grid lg:grid-cols-12 hover:bg-slate-50/50 transition-colors group">

                  {/* COL 1: Main Title & Support (Large) */}
                  <div className="col-span-4 p-6 lg:border-r border-slate-100">
                    <div className="flex items-start justify-between mb-2">
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
                            onClick={() => {
                              if (window.electronAPI) {
                                window.electronAPI.openPath(item.main.url);
                              } else {
                                window.open(item.main.url, '_blank');
                              }
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-50 text-brand-700 rounded-lg border border-brand-200 hover:bg-brand-100 hover:border-brand-300 hover:shadow-sm transition-all text-sm font-medium w-full sm:w-auto justify-center sm:justify-start"
                          >
                            <Download size={18} />
                            <span>{item.main.label}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COL 2: PDFs */}
                  <div className="col-span-3 p-4 lg:p-6 lg:border-r border-slate-100 bg-slate-50/30 lg:bg-transparent flex flex-col">
                    <div className="flex items-center justify-between lg:hidden mb-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase">Documents</h4>
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                      {item.pdfs.map((res, i) => (
                        <ResourceBadge key={i} resource={res} />
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
                      {item.videos.map((res, i) => (
                        <ResourceBadge key={i} resource={res} />
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
                      {item.extras.map((res, i) => (
                        <ResourceBadge key={i} resource={res} />
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
              ))
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
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Support Principal</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" value={newMainLabel} onChange={(e) => setNewMainLabel(e.target.value)} placeholder="Nom du fichier" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                  <div className="flex gap-2">
                    <input type="text" value={newMainUrl} onChange={(e) => setNewMainUrl(e.target.value)} placeholder="Lien / Chemin" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                    <button type="button" onClick={handleSelectMainFile} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-600">Parcourir</button>
                  </div>
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
                <input type="text" id="resLabel" value={resLabel} onChange={(e) => setResLabel(e.target.value)} placeholder="Ex: Fiche exercice..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" autoFocus required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="resType" className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    id="resType"
                    value={resType}
                    onChange={(e) => setResType(e.target.value as ResourceType)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="ppt">PowerPoint</option>
                    <option value="video">Vidéo</option>
                    <option value="image">Image</option>
                    <option value="zip">Archive ZIP</option>
                    <option value="link">Lien Web</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="resUrl" className="block text-sm font-medium text-slate-700 mb-1">Lien / Chemin fichier</label>
                <div className="flex gap-2">
                  <input type="text" id="resUrl" value={resUrl} onChange={(e) => setResUrl(e.target.value)} placeholder="https://... ou files/..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                  <button type="button" onClick={handleSelectResFile} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-600">Parcourir</button>
                </div>
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