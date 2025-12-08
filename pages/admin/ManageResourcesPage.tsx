import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Ressource, RessourceType } from '../../types';
import {
  FileText, Video, Link as LinkIcon, Plus, Trash2, Edit,
  ExternalLink, File, ChevronRight, UploadCloud, GripVertical
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const ManageResourcesPage: React.FC = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const { formations, deleteRessource, reorderResources } = useStore();

  const formation = formations.find(f => f.id === courseId);
  const module = formation?.modules.find(m => m.id === moduleId);

  if (!formation || !module) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Module introuvable</h2>
        <Link to="/admin" className="text-blue-600 hover:underline">Retourner à la liste</Link>
      </div>
    );
  }

  const pptPrincipal = module.ressources.find(r => r.role === 'principal');
  const otherResources = module.ressources.filter(r => r.id !== pptPrincipal?.id);

  const handleDelete = async (resource: Ressource) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      if (resource.stockage === 'local' && resource.chemin && window.electronAPI) {
        try {
          const result = await window.electronAPI.deleteResource(resource.chemin);
          if (!result.success) {
            console.error("Failed to delete file:", result.error);
          }
        } catch (error) {
          console.error("Error deleting resource file:", error);
        }
      }
      deleteRessource(formation.id, module.id, resource.id);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) {
      return;
    }
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    reorderResources(formation.id, module.id, source.index, destination.index);
  };

  const getIcon = (type: RessourceType) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'video': return <Video className="w-5 h-5 text-green-500" />;
      case 'ppt': return <File className="w-5 h-5 text-orange-500" />;
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
        <Link
          to={`/admin/course/${courseId}/module/${moduleId}/resource/new`}
          className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="truncate">Ajouter une ressource</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Resource */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <File className="w-5 h-5 text-orange-500" />
            Support Principal
          </h2>
          <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-full">
            {pptPrincipal ? (
              <div className="flex flex-col gap-4 h-full">
                <div className="flex-1 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    {getIcon(pptPrincipal.type)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white line-clamp-2">{pptPrincipal.titre}</p>
                    <p className="text-xs text-slate-500 mt-1">Format {pptPrincipal.type.toUpperCase()} • Principal</p>
                  </div>
                </div>
                <div className="flex justify-center gap-2">
                    <Link to={`/admin/course/${courseId}/module/${moduleId}/resource/${pptPrincipal.id}/edit`} className="flex-1 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2">
                        <Edit className="w-4 h-4" /> Modifier
                    </Link>
                    <button onClick={() => handleDelete(pptPrincipal)} className="flex-1 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" /> Supprimer
                    </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-8">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-slate-900 dark:text-white">Aucun support principal</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Ajoutez une ressource marquée comme "Principale".</p>
                </div>
                <Link to={`/admin/course/${courseId}/module/${moduleId}/resource/new`} className="mt-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
                  Ajouter un support
                </Link>
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
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="resources">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  {otherResources.length > 0 ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {otherResources.map((resource, index) => (
                        <Draggable key={resource.id} draggableId={resource.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`p-4 flex items-center justify-between group transition-shadow ${snapshot.isDragging ? 'shadow-lg bg-slate-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <button {...provided.dragHandleProps} className="text-slate-400 dark:text-slate-600 cursor-grab active:cursor-grabbing">
                                  <GripVertical className="w-5 h-5" />
                                </button>
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
                              <div className="flex items-center gap-1">
                                  <Link to={`/admin/course/${courseId}/module/${moduleId}/resource/${resource.id}/edit`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                      <Edit className="w-4 h-4" />
                                  </Link>
                                  <button onClick={() => handleDelete(resource)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-slate-500 dark:text-slate-400">Aucune ressource complémentaire.</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Ajoutez des PDF, vidéos ou liens pour enrichir ce module.</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default ManageResourcesPage;
