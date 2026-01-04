
import React, { useRef } from 'react';
import { SplitResult } from '../types';
import * as htmlToImage from 'html-to-image';

interface Props {
  results: SplitResult[];
  totalItems: number;
  onTogglePaid: (personId: string) => void;
  onSave: () => void;
  onClear: () => void;
  isModal?: boolean;
}

const Summary: React.FC<Props> = ({ results, totalItems, onTogglePaid, onSave, onClear, isModal = false }) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const activeResults = results.filter(res => res.total > 0);
  const grandTotal = results.reduce((acc, r) => acc + r.total, 0);
  const totalPaid = activeResults.filter(r => r.isPaid).length;
  const isFullyPaid = activeResults.length > 0 && totalPaid === activeResults.length;
  const isPartiallyPaid = totalPaid > 0 && totalPaid < activeResults.length;

  const handleExportImage = async () => {
    if (!exportRef.current) return;
    
    try {
      const dataUrl = await htmlToImage.toPng(exportRef.current, {
        quality: 1,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f8fafc',
        pixelRatio: 2
      });
      
      const link = document.createElement('a');
      link.download = `bayad-buddy-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
      alert('Could not generate image. Please try taking a screenshot instead.');
    }
  };

  const handleShare = async () => {
    if (!exportRef.current) return;
    
    try {
      const dataUrl = await htmlToImage.toPng(exportRef.current, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f8fafc',
        pixelRatio: 2
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'bayad-buddy.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Bayad Buddy Split Overview',
          text: 'Here is the breakdown for our bill.'
        });
      } else {
        handleExportImage();
      }
    } catch (err) {
      console.error('Share failed', err);
      handleExportImage();
    }
  };

  if (activeResults.length === 0) {
    return (
      <div className={`${isModal ? '' : 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm'} p-6 text-center py-12 text-slate-400 italic transition-colors`}>
        Add items and assign them to see the split!
      </div>
    );
  }

  // Determine Overall Bill Status Color
  const statusClasses = isFullyPaid 
    ? 'bg-emerald-600 shadow-emerald-200 dark:shadow-none' 
    : isPartiallyPaid 
      ? 'bg-amber-500 shadow-amber-200 dark:shadow-none' 
      : 'bg-slate-900 dark:bg-slate-800 shadow-slate-200 dark:shadow-none';

  return (
    <div className={`${isModal ? '' : 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm'} p-6 transition-colors`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        {!isModal && (
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-indigo-500"></i>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Split Overview</h2>
          </div>
        )}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {!isModal && (
            <button 
              onClick={onClear}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 px-3 py-2 transition-colors"
            >
              Clear All
            </button>
          )}
          <button 
            onClick={handleShare}
            className="flex-1 sm:flex-none bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-share-nodes"></i>
            Share
          </button>
          <button 
            onClick={onSave}
            className="flex-1 sm:flex-none bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-check"></i>
            Save
          </button>
        </div>
      </div>

      <div ref={exportRef} className="p-4 rounded-3xl dark:bg-slate-950">
        <div className={`mb-8 p-6 text-white rounded-[2rem] shadow-xl transition-all duration-500 overflow-hidden relative ${statusClasses}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Total Bill</span>
              <p className="text-4xl font-black mt-1">₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-right">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-black border border-white/20 uppercase tracking-wider">
                {isFullyPaid ? 'ALL PAID' : isPartiallyPaid ? `${totalPaid}/${activeResults.length} PAID` : 'UNPAID'}
              </span>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider mt-2">Bayad Buddy</p>
            </div>
          </div>
          <div className="flex justify-between items-end relative z-10">
            <p className="text-white/70 text-xs font-medium italic">
              Breakdown for {activeResults.length} people
            </p>
            <i className={`fa-solid ${isFullyPaid ? 'fa-circle-check' : 'fa-receipt'} text-3xl text-white/30`}></i>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeResults.map((res) => (
            <button 
              key={res.person.id} 
              onClick={() => onTogglePaid(res.person.id)}
              className={`text-left bg-white dark:bg-slate-900 rounded-3xl border overflow-hidden flex flex-col shadow-sm border-b-4 transition-all duration-300 active:scale-[0.98] ${res.isPaid ? 'opacity-70 grayscale-[0.3]' : 'opacity-100'}`} 
              style={{ borderColor: res.isPaid ? '#10b981' : (AVATAR_COLORS_HEX[res.person.avatarColor] || '#cbd5e1') }}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${res.isPaid ? 'bg-emerald-500' : res.person.avatarColor} flex items-center justify-center text-white font-bold shadow-lg shadow-current/20 transition-colors`}>
                      {res.isPaid ? <i className="fa-solid fa-check text-xs"></i> : res.person.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className={`font-black text-sm leading-tight transition-colors ${res.isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}`}>
                        {res.person.name}
                      </h3>
                      <p className={`text-[9px] font-black uppercase tracking-[0.1em] mt-0.5 ${res.isPaid ? 'text-emerald-500/60' : 'text-slate-400 dark:text-slate-500'}`}>
                        {res.isPaid ? 'Has Paid' : 'Owes'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black transition-colors ${res.isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      ₱{res.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-slate-50 dark:border-slate-800 pt-3 mt-3">
                  {res.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span className="truncate flex-1 pr-2">{item.itemName}</span>
                      <span className={`${res.isPaid ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
                        ₱{item.share.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-2">
          <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">Generated via Bayad Buddy</p>
          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-600">{new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

const AVATAR_COLORS_HEX: Record<string, string> = {
  'bg-blue-500': '#3b82f6',
  'bg-purple-500': '#a855f7',
  'bg-pink-500': '#ec4899',
  'bg-emerald-500': '#10b981',
  'bg-orange-500': '#f97316',
  'bg-indigo-500': '#6366f1',
  'bg-rose-500': '#f43f5e',
  'bg-cyan-500': '#06b6d4'
};

export default Summary;
