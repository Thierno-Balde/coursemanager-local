import React from 'react';
import { Group, ProgressStatus } from '../types';

interface TrackingModalProps {
  show: boolean;
  onClose: () => void;
  group: Group;
  moduleTitle: string;
  onConfirm: (status: ProgressStatus) => void;
}

const TrackingModal: React.FC<TrackingModalProps> = ({ show, onClose, group, moduleTitle, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Mise à jour de la progression</h3>
        <p className="text-slate-700 dark:text-slate-300 mb-6">
          Avez-vous terminé le module <span className="font-semibold">"{moduleTitle}"</span> avec le groupe <span className="font-semibold">"{group.name}"</span> ?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => onConfirm('IN_PROGRESS')}
            className="px-4 py-2 text-sm font-medium rounded-lg text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Non, en cours
          </button>
          <button
            onClick={() => onConfirm('DONE')}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            Oui, terminé
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;
