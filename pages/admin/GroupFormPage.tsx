import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Group, Formation } from '../../types';
import { Plus, Edit, Save, X, ChevronRight } from 'lucide-react';

const GroupFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { groups, formations, addGroup, updateGroup } = useStore(); // updateGroup needs to be added to StoreContext

  const isEditing = Boolean(id);
  const currentGroup = groups.find(group => group.id === id);

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [session, setSession] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formationId, setFormationId] = useState('');

  useEffect(() => {
    if (isEditing && currentGroup) {
      setName(currentGroup.name);
      setCity(currentGroup.city);
      setSession(currentGroup.session);
      setStartDate(currentGroup.startDate);
      setEndDate(currentGroup.endDate);
      setFormationId(currentGroup.formationId);
    } else if (isEditing && !currentGroup) {
      // Trying to edit a group that doesn't exist
      navigate('/admin/groups');
    }
  }, [isEditing, currentGroup, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !city || !session || !startDate || !endDate || !formationId) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (isEditing && currentGroup) {
      const updatedGroup: Partial<Group> = {
        name, city, session, startDate, endDate, formationId
      };
      await updateGroup(currentGroup.id, updatedGroup);
    } else {
      const newGroup: Group = {
        id: crypto.randomUUID(),
        name, city, session, startDate, endDate, formationId,
        createdAt: Date.now(),
        archived: false,
        progress: {},
      };
      await addGroup(newGroup);
    }
    navigate('/admin/groups');
  };

  const handleCancel = () => {
    navigate('/admin/groups');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-8 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/admin" className="hover:text-blue-600">Admin</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/admin/groups" className="hover:text-blue-600">Groupes</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-slate-900 dark:text-slate-100">{isEditing ? 'Modifier' : 'Nouveau'}</span>
      </div>
      
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {isEditing ? <Edit className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
            {isEditing ? 'Modifier le groupe' : 'Nouveau groupe'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="name">Nom du groupe</label>
            <input
              id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="Ex: Groupe Alternants B"
              className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="city">Ville</label>
            <input
              id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required
              placeholder="Ex: Lyon"
              className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="session">Session</label>
            <input
              id="session" type="text" value={session} onChange={(e) => setSession(e.target.value)} required
              placeholder="Ex: Hiver 2025"
              className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="startDate">Date de début</label>
              <input
                id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="endDate">Date de fin</label>
              <input
                id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required
                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="formation">Formation liée</label>
            <select
              id="formation" value={formationId} onChange={(e) => setFormationId(e.target.value)} required
              className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
            >
              <option value="">Sélectionnez une formation</option>
              {formations.map(f => (
                <option key={f.id} value={f.id}>{f.titre}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg">
              <X className="w-4 h-4" /> Annuler
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <Save className="w-4 h-4" /> {isEditing ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupFormPage;
