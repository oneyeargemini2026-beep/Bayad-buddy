import React from 'react';
import { APP_TITLE } from '../constants';

interface Props {
  onToggleHistory: () => void;
  onToggleTheme: () => void;
  onOpenProfile: () => void;
  darkMode: boolean;
  isHistoryVisible: boolean;
  profileName: string;
}

const Header: React.FC<Props> = ({ 
  onToggleHistory, 
  onToggleTheme, 
  onOpenProfile,
  darkMode, 
  isHistoryVisible,
  profileName
}) => {
  const logoUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Ccircle cx='256' cy='256' r='250' fill='%23ffffff'/%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23c8e8f2'/%3E%3Cstop offset='50%25' stop-color='%23d5f3d5'/%3E%3Cstop offset='100%25' stop-color='%23b5e5f0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='256' cy='256' r='235' fill='url(%23g)' stroke='%23e2e8f0' stroke-width='8'/%3E%3Ctext x='225' y='275' text-anchor='middle' font-family='-apple-system, BlinkMacSystemFont, Arial, sans-serif' font-weight='900' font-size='90' fill='%231e293b'%3EBAYA%3C/text%3E%3Cg transform='translate(365, 275)'%3E%3Ctext x='0' y='0' text-anchor='middle' font-family='-apple-system, BlinkMacSystemFont, Arial, sans-serif' font-weight='900' font-size='90' fill='%231e293b'%3ED%3C/text%3E%3Cpath d='M-15,-35 L0,-15 L35,-60' stroke='%2384cc16' stroke-width='16' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3Ctext x='256' y='345' text-anchor='middle' font-family='-apple-system, BlinkMacSystemFont, Arial, sans-serif' font-weight='900' font-size='70' fill='%2338bdf8'%3EBUDDY%3C/text%3E%3C/svg%3E";

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <img src={logoUrl} alt="Bayad Buddy Logo" className="w-full h-full object-cover" />
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
            title={isHistoryVisible ? "Go to Home" : "View Saved Bills"}
          >
            <i className={`fa-solid ${isHistoryVisible ? 'fa-house' : 'fa-bookmark'}`}></i>
          </button>
          
          <button 
            onClick={onOpenProfile}
            className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-400 transition-all ml-1"
            title="Your Profile"
          >
            <i className="fa-solid fa-user text-sm"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;