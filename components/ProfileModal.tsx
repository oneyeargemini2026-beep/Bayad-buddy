
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

const ProfileModal: React.FC<Props> = ({ profile, onSave, onClose }) => {
  const [name, setName] = useState(profile.name);
  const [method, setMethod] = useState(profile.paymentMethod);
  const [details, setDetails] = useState(profile.paymentDetails);
  const [bankName, setBankName] = useState(profile.bankName || '');
  const [accountNumber, setAccountNumber] = useState(profile.accountNumber || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      name, 
      paymentMethod: method, 
      paymentDetails: method === 'Bank' ? '' : details,
      bankName: method === 'Bank' ? bankName : '',
      accountNumber: method === 'Bank' ? accountNumber : ''
    });
  };

  const paymentOptions = [
    { id: 'GCash', label: 'GCash', color: 'bg-blue-600', icon: 'fa-mobile-screen' },
    { id: 'Maya', label: 'Maya', color: 'bg-emerald-500', icon: 'fa-wallet' },
    { id: 'Bank', label: 'Bank', color: 'bg-slate-700', icon: 'fa-building-columns' },
    { id: 'Other', label: 'Other', color: 'bg-indigo-500', icon: 'fa-ellipsis' },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 flex flex-col relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Your Profile</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Set how you want to be paid</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2 block pl-1">Display Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-50"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-3 block pl-1">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {paymentOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMethod(opt.id as any)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                    method === opt.id 
                      ? `${opt.color} border-transparent text-white shadow-lg scale-[1.02]` 
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500'
                  }`}
                >
                  <i className={`fa-solid ${opt.icon} text-sm`}></i>
                  <span className="text-xs font-black">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {method === 'Bank' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2 block pl-1">Bank Name</label>
                <input 
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. BPI, BDO, UnionBank"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-50"
                  required={method === 'Bank'}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2 block pl-1">Account Number</label>
                <input 
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="0000-0000-00"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-50"
                  required={method === 'Bank'}
                />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2 block pl-1">Payment Details</label>
              <input 
                type="text"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={method === 'Other' ? 'Payment link or ID' : 'Phone Number'}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-50"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 mt-4"
          >
            SAVE PROFILE
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
