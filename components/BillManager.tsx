import React, { useState, useRef } from 'react';
import { BillItem, Person } from '../types';
import { parseReceiptImage } from '../services/geminiService';

interface Props {
  items: BillItem[];
  people: Person[];
  billTitle: string;
  setBillTitle: (title: string) => void;
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
  onAddItem, 
  onUpdateItem, 
  onRemoveItem, 
  onBulkAdd,
  onClearAll
}) => {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const parsedItems = await parseReceiptImage(base64);
        onBulkAdd(parsedItems);
        if (parsedItems.length > 0) {
          alert(`Successfully extracted ${parsedItems.length} items!`);
        }
      } catch (err) {
        console.error(err);
        alert("Scanning failed. Please ensure the photo is clear and try again.");
      } finally {
        setIsScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const totalBill = items.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-list-check text-indigo-500"></i>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Bill Details</h2>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className={`flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-xl ${
            isScanning 
              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-400 cursor-wait' 
              : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
          }`}
        >
          {isScanning ? (
            <><i className="fa-solid fa-circle-notch animate-spin"></i> Analyzing...</>
          ) : (
            <><i className="fa-solid fa-camera"></i> Scan Receipt</>
          )}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileUpload}
        />
      </div>

      <div className="space-y-4 mb-8">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className="fa-solid fa-tag text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
          </div>
          <input 
            type="text"
            value={billTitle}
            onChange={(e) => setBillTitle(e.target.value)}
            placeholder="What's this bill for? (e.g., Starbucks Coffee)"
            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-base focus:border-indigo-500 focus:ring-0 outline-none text-slate-900 dark:text-slate-50 font-medium placeholder-slate-400 transition-all"
          />
        </div>

        <form onSubmit={handleAddItem} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 transition-colors">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Manual Entry</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Item name (e.g., Burger)"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-50 placeholder-slate-400"
              />
            </div>
            <div className="w-full sm:w-32 relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">₱</span>
              <input 
                type="number" 
                step="0.01"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-7 pr-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-50 placeholder-slate-400"
              />
            </div>
            <button 
              type="submit"
              disabled={!itemName.trim() || !itemPrice}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale transition-all shadow-md shadow-indigo-100 dark:shadow-none active:scale-95"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Added Items ({items.length})</h3>
        {items.length > 0 && (
          <button 
            onClick={onClearAll}
            className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
          >
            Clear List
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
        {items.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-receipt text-slate-300 dark:text-slate-600 text-xl"></i>
            </div>
            <p className="text-slate-400 dark:text-slate-600 text-sm font-medium italic">
              Ready to split? Add items manually or scan a receipt.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900 relative">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">{item.name}</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-black text-sm">₱{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <button 
                  onClick={() => onRemoveItem(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <i className="fa-solid fa-xmark"></i>
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
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all active:scale-95
                        ${active 
                          ? `${person.avatarColor.replace('bg-', 'text-')} bg-white dark:bg-slate-900 border-current shadow-sm` 
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border-transparent opacity-60'
                        }
                      `}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full ${person.avatarColor} flex items-center justify-center text-[7px] text-white shadow-inner`}>
                        {person.name.charAt(0)}
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

      {items.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Running Total</p>
          <p className="text-indigo-600 dark:text-indigo-400 text-2xl font-black">₱{totalBill.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      )}
    </div>
  );
};

export default BillManager;