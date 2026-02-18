import React, { useState } from 'react';
import { BillItem, Person } from '../types';

interface Props {
  items: BillItem[];
  people: Person[];
  billTitle: string;
  setBillTitle: (title: string) => void;
  discountType: 'flat' | 'percent';
  setDiscountType: (type: 'flat' | 'percent') => void;
  discountValue: number;
  setDiscountValue: (value: number) => void;
  discountTarget: string;
  setDiscountTarget: (target: string) => void;
  onAddItem: (name: string, price: number) => void;
  onUpdateItem: (item: BillItem) => void;
  onRemoveItem: (id: string) => void;
  onBulkAdd: (items: { name: string; price: number }[]) => void;
  onClearAll: () => void;
}

const BillManager: React.FC<Props> = ({ 
  items, 
  people, 
  billTitle,
  setBillTitle,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  discountTarget,
  setDiscountTarget,
  onAddItem, 
  onUpdateItem, 
  onRemoveItem, 
  onClearAll
}) => {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(itemPrice);
    if (itemName.trim() && !isNaN(price)) {
      onAddItem(itemName.trim(), price);
      setItemName('');
      setItemPrice('');
    }
  };

  const togglePersonOnItem = (item: BillItem, personId: string) => {
    const isAssigned = item.assignedPersonIds.includes(personId);
    let newIds: string[];
    if (isAssigned) {
      newIds = item.assignedPersonIds.filter(id => id !== personId);
    } else {
      newIds = [...item.assignedPersonIds, personId];
    }
    onUpdateItem({ ...item, assignedPersonIds: newIds });
  };

  const subtotalBill = items.reduce((acc, item) => acc + item.price, 0);
  
  // Logic updated: Both modes treat discountValue as a flat amount.
  // The footer "Total Bill" preview now reflects this flat deduction.
  const actualDiscount = Math.min(discountValue, subtotalBill);
  const totalBill = Math.max(0, subtotalBill - actualDiscount);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Bill Content</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Assign items to people</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Bill Metadata */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 transition-all focus-within:border-indigo-500/30">
          <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-2 block pl-1">What are we splitting?</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
              <i className="fa-solid fa-file-invoice-dollar text-slate-400"></i>
            </div>
            <input 
              type="text"
              value={billTitle}
              onChange={(e) => setBillTitle(e.target.value)}
              placeholder="e.g. Dinner at Mary's Cafe"
              className="w-full bg-transparent border-none rounded-none pl-7 py-1 text-xl font-bold focus:ring-0 outline-none text-slate-900 dark:text-slate-50 placeholder-slate-300 dark:placeholder-slate-600 transition-all"
            />
          </div>
        </div>

        {/* Manual Item Entry */}
        <form onSubmit={handleAddItem} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-[2] relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-utensils text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
              </div>
              <input 
                type="text" 
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Item name (e.g. Burger)"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-50 placeholder-slate-400"
              />
            </div>
            <div className="flex-1 relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
              <input 
                type="number" 
                step="0.01"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-50 placeholder-slate-400"
              />
            </div>
            <button 
              type="submit"
              disabled={!itemName.trim() || !itemPrice}
              className="bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 px-8 py-3 rounded-xl text-sm font-black hover:opacity-90 disabled:opacity-30 transition-all active:scale-95"
            >
              Add
            </button>
          </div>
        </form>

        {/* Discount Section */}
        <div className="bg-indigo-50/30 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100/50 dark:border-indigo-900/30 transition-all overflow-hidden">
          <div className="p-5 pb-2">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2 pl-1">
                  <i className="fa-solid fa-tag text-indigo-500 text-xs"></i>
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Discount Breakdown</label>
               </div>
               <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <button 
                    onClick={() => setDiscountType('flat')}
                    title="Split Evenly"
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${discountType === 'flat' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
                  >₱</button>
                  <button 
                    onClick={() => setDiscountType('percent')}
                    title="Split Proportionally (By Amount)"
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${discountType === 'percent' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
                  >%</button>
               </div>
            </div>
            
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
              <input 
                type="number"
                value={discountValue || ''}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                placeholder="Total Discount Amount"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-8 pr-4 py-4 text-lg font-black focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-50 placeholder-slate-400 transition-all"
              />
            </div>
            <p className="text-[9px] font-bold text-slate-400 mt-2 pl-1">
              {discountType === 'percent' ? 'Selected: Proportional distribution split.' : 'Selected: Equal distribution split.'}
            </p>
          </div>

          <div className="px-5 pb-5 pt-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1 mb-3 block">Apply to</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDiscountTarget('everyone')}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black border transition-all active:scale-95 ${
                  discountTarget === 'everyone' 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white shadow-inner ${discountTarget === 'everyone' ? 'bg-white/30' : 'bg-slate-200 dark:bg-slate-700'}`}>
                   <i className={`fa-solid ${discountTarget === 'everyone' ? 'fa-check' : 'fa-users'} text-[7px]`}></i>
                </div>
                EVERYONE
              </button>
              
              {people.map(person => (
                <button
                  key={person.id}
                  onClick={() => setDiscountTarget(person.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black border transition-all active:scale-95 ${
                    discountTarget === person.id 
                      ? `${person.avatarColor} border-transparent text-white shadow-lg shadow-current/20 scale-[1.02]` 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white shadow-inner ${discountTarget === person.id ? 'bg-white/30' : person.avatarColor}`}>
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  {person.name.toUpperCase()}
                  {discountTarget === person.id && <i className="fa-solid fa-circle-check text-[10px] ml-auto"></i>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itemized List ({items.length})</h3>
            {items.length > 0 && (
              <button 
                onClick={onClearAll}
                className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/10 px-2 py-1 rounded transition-colors"
              >
                Reset All
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
            {items.length === 0 ? (
              <div className="text-center py-16 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <i className="fa-solid fa-receipt text-slate-200 dark:text-slate-700 text-4xl mb-3"></i>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">No items added yet</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all hover:shadow-lg hover:border-indigo-100 dark:hover:border-indigo-900 relative">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">{item.name}</h3>
                      <p className="text-indigo-600 dark:text-indigo-400 font-black text-sm">₱{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {people.map((person) => {
                      const active = item.assignedPersonIds.includes(person.id);
                      return (
                        <button
                          key={person.id}
                          onClick={() => togglePersonOnItem(item, person.id)}
                          className={`
                            flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] font-bold border transition-all active:scale-95
                            ${active 
                              ? `${person.avatarColor.replace('bg-', 'text-')} bg-white dark:bg-slate-900 border-current shadow-sm` 
                              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border-transparent'
                            }
                          `}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full ${person.avatarColor} flex items-center justify-center text-[7px] text-white shadow-inner`}>
                            {person.name.charAt(0).toUpperCase()}
                          </div>
                          {person.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-2">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
              <p className="text-indigo-600 dark:text-indigo-400 text-3xl font-black">₱{totalBill.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              {actualDiscount > 0 && (
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1 italic">
                  Saved ₱{actualDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({discountTarget === 'everyone' ? 'Everyone' : people.find(p => p.id === discountTarget)?.name})
                </p>
              )}
            </div>
            <i className="fa-solid fa-coins text-3xl text-slate-100 dark:text-slate-800"></i>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillManager;