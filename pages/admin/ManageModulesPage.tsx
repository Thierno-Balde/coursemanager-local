import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Plus, GripVertical, FolderOpen, Edit, Trash2, ChevronRight } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const ManageModulesPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { formations, deleteModule, reorderModules } = useStore();

  const formation = formations.find(f => f.id === courseId);

  if (!formation) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Formation introuvable</h2>
        <Link to="/admin" className="text-blue-600 hover:underline">Retourner à la liste</Link>
      </div>
    );
  }

  const handleDelete = (moduleId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      deleteModule(formation.id, moduleId);
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
    reorderModules(formation.id, source.index, destination.index);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto p-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Formations</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-slate-900 dark:text-slate-100">{formation.titre}</span>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-slate-900 dark:text-slate-100">Modules</span>
      </div>

      {/* PageHeading */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Modules</h1>
        <Link
          to={`/admin/course/${courseId}/module/new`}
          className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="truncate">Ajouter un module</span>
        </Link>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="modules">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {formation.modules.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
                  <p className="text-slate-500 dark:text-slate-400 mb-2">Aucun module dans cette formation.</p>
                  <Link to={`/admin/course/${courseId}/module/new`} className="text-blue-600 hover:underline">
                    Ajouter le premier module
                  </Link>
                </div>
              ) : (
                formation.modules.map((module, index) => (
                  <Draggable key={module.id} draggableId={module.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex items-center gap-4 justify-between group transition-shadow ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <button {...provided.dragHandleProps} className="text-slate-400 dark:text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                            <GripVertical className="w-5 h-5" />
                          </button>
                          <div className="flex flex-col justify-center min-w-0">
                            <p className="text-slate-900 dark:text-white font-semibold truncate">
                              <span className="text-slate-400 dark:text-slate-500 mr-2">#{index + 1}</span>
                              {module.titre}
                            </p>
                            {module.description && (
                              <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{module.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-1">
                          <Link
                            to={`/admin/course/${formation.id}/module/${module.id}/resources`}
                            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Gérer les ressources"
                          >
                            <FolderOpen className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/admin/course/${courseId}/module/${module.id}/edit`}
                            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(module.id)}
                            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ManageModulesPage;
