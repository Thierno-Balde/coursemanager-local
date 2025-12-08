import React from 'react';
import { useStore } from '../context/StoreContext';
import { useSession } from '../context/SessionContext';
import { Group } from '../types';

interface SessionSelectorProps {
  formationId: string;
}

const SessionSelector: React.FC<SessionSelectorProps> = ({ formationId }) => {
  const { groups } = useStore();
  const { currentGroupId, setCurrentGroupId } = useSession();

  const relevantGroups = groups.filter(group => group.formationId === formationId && !group.archived);

  if (relevantGroups.length === 0) {
    return (
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Aucun groupe disponible pour cette formation.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">Session active :</span>
      <button
        onClick={() => setCurrentGroupId(null)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          currentGroupId === null
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
        }`}
      >
        Aucune (Mode Consultation)
      </button>
      {relevantGroups.map((group: Group) => (
        <button
          key={group.id}
          onClick={() => setCurrentGroupId(group.id)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            currentGroupId === group.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          {group.name} ({group.city})
        </button>
      ))}
    </div>
  );
};

export default SessionSelector;
