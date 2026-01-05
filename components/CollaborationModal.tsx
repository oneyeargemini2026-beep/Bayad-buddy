
import React, { useState, useEffect } from 'react';
import { RoomSession, UserProfile } from '../types';

interface Props {
  session: RoomSession;
  userProfile: UserProfile;
  onJoin: (code: string) => void;
  onCreate: () => void;
  onLeave: () => void;
  onClose: () => void;
}

const CollaborationModal: React.FC<Props> = ({ session, userProfile, onJoin, onCreate, onLeave, onClose }) => {
  const [inputCode, setInputCode] = useState('');
  const [view, setView] = useState<'selection' | 'join' | 'active'>(session.roomId ? 'active' : 'selection');
  const [isJoining, setIsJoining] = useState(false);

  // Synchronize internal view with external session state
  useEffect(() => {
    if (session.roomId) {
      setView('active');
      setIsJoining(false);
    } else {
      setView('selection');
    }
  }, [session.roomId]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.length === 6) {
      setIsJoining(true);
      // Small timeout to simulate network feel
      setTimeout(() => {
        onJoin(inputCode.toUpperCase());
      }, 600);
    }
  };

  const handleCreate = () => {
    setIsJoining(true);
    setTimeout(() => {
      onCreate();
    }, 500);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bayadbuddy://join/${session.roomId}`;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 flex flex-col relative overflow-hidden min-h-[400px]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {isJoining && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Establishing Link...</p>
          </div>
        )}

        {view === 'selection' && (
          <div className="text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-tower-broadcast text-indigo-600 dark:text-indigo-400 text-2xl animate-pulse"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Collaborate</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-8">Split bills in real-time with your friends. Everyone can add items simultaneously.</p>
            
            <div className="space-y-3">
              <button 
                onClick={handleCreate}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-plus-circle"></i>
                CREATE LIVE ROOM
              </button>
              <button 
                onClick={() => setView('join')}
                className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                JOIN WITH CODE
              </button>
            </div>
          </div>
        )}

        {view === 'join' && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <button onClick={() => setView('selection')} className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <i className="fa-solid fa-arrow-left"></i> Back
            </button>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight mb-2">Enter Room Code</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Ask your friend for their 6-digit room code.</p>
            
            <form onSubmit={handleJoin} className="space-y-6">
              <input 
                type="text"
                autoFocus
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="ABCDEF"
                maxLength={6}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-5 text-3xl font-black tracking-[0.5em] text-center focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-slate-900 dark:text-slate-50 transition-all uppercase"
              />
              <button 
                type="submit"
                disabled={inputCode.length !== 6 || isJoining}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
              >
                JOIN SESSION
              </button>
            </form>
          </div>
        )}

        {view === 'active' && (
          <div className="text-center animate-in fade-in duration-500">
            <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
              Live Session
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tighter mb-1">{session.roomId}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Share this code with friends</p>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 mb-8 flex flex-col items-center group">
               <div className="w-40 h-40 bg-white p-3 rounded-2xl shadow-inner mb-4 transition-transform group-hover:scale-105">
                  <img src={qrUrl} alt="Room QR Code" className="w-full h-full" />
               </div>
               <p className="text-xs font-bold text-slate-400">Scan to join room</p>
            </div>

            <div className="space-y-4 mb-8 text-left max-h-32 overflow-y-auto custom-scrollbar">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Participants ({session.participants.length})</h3>
              <div className="flex flex-wrap gap-2">
                {session.participants.map(p => (
                  <div key={p.id} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] font-black text-white">
                      {p.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {p.name} {p.id === 'local' && '(You)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={onClose}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                BACK TO BILL
              </button>
              <button 
                onClick={onLeave}
                className="flex-1 py-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl font-black hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all active:scale-95"
              >
                DISCONNECT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationModal;
