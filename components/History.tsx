
import React from 'react';
import { HistoryEntry } from '../types';

interface Props {
  history: HistoryEntry[];
  onClose: () => void;
  onClearHistory: () => void;
}

const History: React.FC<Props> = ({ history, onClose, onClearHistory }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-clock-rotate-left text-indigo-500"></i>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Split History</h2>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onClearHistory}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
          >
            Clear All
          </button>
          <button 
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-ghost text-slate-300 dark:text-slate-600 text-2xl"></i>
          </div>
          <p className="text-slate-400 dark:text-slate-600 italic">No history yet. Start splitting!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all hover:border-indigo-200 dark:hover:border-indigo-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">{entry.title}</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{entry.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">₱{entry.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {entry.results.map((res) => (
                  <div key={res.person.id} className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-full border border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    <div className={`w-3 h-3 rounded-full ${res.person.avatarColor}`}></div>
                    {res.person.name}: ₱{res.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
