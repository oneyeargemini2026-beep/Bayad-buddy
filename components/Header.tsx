
import React from 'react';
import { APP_TITLE } from '../constants';

interface Props {
  onToggleHistory: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
}

const Header: React.FC<Props> = ({ onToggleHistory, onToggleTheme, darkMode }) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-indigo-200 dark:shadow-none shadow-lg">
            <i className="fa-solid fa-receipt text-xl"></i>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{APP_TITLE}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleTheme}
            className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-400 transition-all"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          <button 
            onClick={onToggleHistory}
            className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-400 transition-all"
            title="View Saved Bills"
          >
            <i className="fa-solid fa-bookmark"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
