
import React from 'react';
import { HistoryEntry } from '../types';

interface Props {
  history: HistoryEntry[];
  onClose: () => void;
  onClearHistory: () => void;
  onTogglePaid: (billId: string, personId: string) => void;
  onRemoveBill: (billId: string) => void;
}

const SavedBills: React.FC<Props> = ({ history, onClose, onClearHistory, onTogglePaid, onRemoveBill }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
            <i className="fa-solid fa-bookmark text-indigo-600 dark:text-indigo-400"></i>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Saved History</h2>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onClearHistory}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors px-2 py-1"
          >
            Remove All
          </button>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-full transition-colors"
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
          <p className="text-slate-400 dark:text-slate-600 italic">No saved bills yet. Start splitting!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => {
            const totalPeople = entry.results.length;
            const paidPeople = entry.results.filter(r => r.isPaid).length;
            const isFullyPaid = totalPeople > 0 && paidPeople === totalPeople;
            const isPartiallyPaid = paidPeople > 0 && paidPeople < totalPeople;

            return (
              <div 
                key={entry.id} 
                className={`p-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border transition-all relative ${
                  isFullyPaid 
                    ? 'border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/5' 
                    : 'border-slate-100 dark:border-slate-800'
                } hover:border-indigo-200 dark:hover:border-indigo-700 group`}
              >
                {/* Remove Button - Using an 'X' icon for "Remove" vibe */}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBill(entry.id);
                  }}
                  className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 active:scale-90"
                  title="Remove"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>

                <div className="flex justify-between items-start mb-4 pr-10">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${
                      isFullyPaid ? 'bg-emerald-500' : isPartiallyPaid ? 'bg-amber-500' : 'bg-slate-300'
                    } shadow-sm`}></div>
                    <div className="max-w-[150px] sm:max-w-none">
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">{entry.title}</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">{entry.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black transition-colors ${isFullyPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      ₱{entry.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-[9px] font-black uppercase mt-0.5 ${isFullyPaid ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {paidPeople}/{totalPeople} Paid
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {entry.results.map((res) => (
                    <button 
                      key={res.person.id} 
                      type="button"
                      onClick={() => onTogglePaid(entry.id, res.person.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold transition-all active:scale-95 ${
                        res.isPaid 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] text-white shadow-sm ${res.isPaid ? 'bg-emerald-500' : res.person.avatarColor}`}>
                        {res.isPaid && <i className="fa-solid fa-check"></i>}
                      </div>
                      {res.person.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedBills;
