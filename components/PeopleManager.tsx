
import React, { useState } from 'react';
import { Person } from '../types';

interface Props {
  people: Person[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

const PeopleManager: React.FC<Props> = ({ people, onAdd, onRemove }) => {
  const [newName, setNewName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName.trim());
      setNewName('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <i className="fa-solid fa-users text-indigo-500"></i>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">People</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add person name..."
          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500"
        />
        <button 
          type="submit"
          disabled={!newName.trim()}
          className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-10 h-10 flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none"
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      </form>

      <div className="flex flex-wrap gap-3">
        {people.map((person) => (
          <div 
            key={person.id} 
            className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full pl-1 pr-3 py-1 group hover:border-indigo-200 dark:hover:border-indigo-700 transition-all shadow-sm"
          >
            <div className={`w-8 h-8 rounded-full ${person.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
              {person.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{person.name}</span>
            {people.length > 1 && (
              <button 
                type="button"
                onClick={() => onRemove(person.id)}
                className="text-slate-300 hover:text-rose-500 transition-colors p-0.5 ml-1 active:scale-90"
                title="Remove"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeopleManager;
