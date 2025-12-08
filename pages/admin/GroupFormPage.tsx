import React from 'react';
import { Link } from 'react-router-dom';

const GroupFormPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">Formulaire de Groupe</h1>
      <p className="text-slate-700 dark:text-slate-300">Page de création/édition de groupe (en construction).</p>
      <Link to="/admin/groups" className="text-blue-600 hover:underline mt-4 block">Retour à la gestion des groupes</Link>
    </div>
  );
};

export default GroupFormPage;
