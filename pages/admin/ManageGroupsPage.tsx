import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Plus, Archive, Trash2, Undo2, AlertCircle } from 'lucide-react';

const ManageGroupsPage: React.FC = () => {
  const { groups, formations, updateGroup, deleteGroup } = useStore();
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  // Filter groups based on active tab
  const displayedGroups = groups.filter(g =>
    activeTab === 'active' ? !g.archived : g.archived
  );

  const handleArchive = async (groupId: string) => {
    if (window.confirm("Voulez-vous vraiment archiver ce groupe ?")) {
      await updateGroup(groupId, { archived: true });
    }
  };

  const handleUnarchive = async (groupId: string) => {
    await updateGroup(groupId, { archived: false });
  };

  const handleDelete = async (groupId: string) => {
    if (window.confirm("ATTENTION : Cette action est irréversible. Voulez-vous vraiment supprimer définitivement ce groupe ?")) {
      await deleteGroup(groupId);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto p-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Admin</Link>
        <span className="text-slate-400 dark:text-slate-500">/</span>
        <span className="font-medium text-slate-900 dark:text-slate-100">Groupes</span>
      </div>

      {/* PageHeading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Groupes</h1>
        <Link
          to="/admin/group/new"
          className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="truncate">Créer un groupe</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          onClick={() => setActiveTab('active')}
        >
          Actifs
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'archived'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          onClick={() => setActiveTab('archived')}
        >
          Archivés
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {displayedGroups.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
            <p className="text-slate-500 dark:text-slate-400 mb-2">
              {activeTab === 'active' ? "Aucun groupe actif." : "Aucun groupe archivé."}
            </p>
            {activeTab === 'active' && (
              <Link to="/admin/group/new" className="text-blue-600 hover:underline">
                Créer votre premier groupe
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedGroups.map((group) => {
              const linkedFormation = formations.find(f => f.id === group.formationId);
              return (
                <div key={group.id} className="flex flex-col bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate" title={group.name}>{group.name}</h2>
                      {group.archived && <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">Archivé</span>}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ville: {group.city}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Session: {group.session}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Formation: {linkedFormation?.titre || 'Inconnue'}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <Link to={`/admin/group/${group.id}/edit`} className="text-blue-600 hover:underline text-sm font-medium">Modifier</Link>

                    <div className="flex items-center gap-1">
                      {activeTab === 'active' ? (
                        <button
                          onClick={() => handleArchive(group.id)}
                          className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors"
                          title="Archiver"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnarchive(group.id)}
                          className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                          title="Désarchiver"
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(group.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Supprimer définitivement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageGroupsPage;
