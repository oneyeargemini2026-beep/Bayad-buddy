
import React, { useState, useRef } from 'react';
import { BillItem, Person } from '../types';
import { parseReceiptImage } from '../services/geminiService';

interface Props {
  items: BillItem[];
  people: Person[];
  onAddItem: (name: string, price: number) => void;
  onUpdateItem: (item: BillItem) => void;
  onRemoveItem: (id: string) => void;
  onBulkAdd: (items: { name: string; price: number }[]) => void;
}

const BillManager: React.FC<Props> = ({ 
  items, 
  people, 
  onAddItem, 
  onUpdateItem, 
  onRemoveItem, 
  onBulkAdd
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
      } catch (err) {
        alert("Scanning failed. Please try again or enter manually.");
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
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Items & Splits</h2>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 disabled:opacity-50 transition-colors"
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

      <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-8 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 transition-colors">
        <div className="sm:col-span-7">
          <input 
            type="text" 
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item name (e.g., Sisig)"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-50 placeholder-slate-400"
          />
        </div>
        <div className="sm:col-span-3 relative">
          <span className="absolute left-3 top-2 text-slate-400 text-sm">₱</span>
          <input 
            type="number" 
            step="0.01"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            placeholder="0.00"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-6 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-50 placeholder-slate-400"
          />
        </div>
        <div className="sm:col-span-2">
          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {items.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-600 italic">
            No items added yet. Try scanning a receipt!
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group transition-all hover:bg-slate-100/50 dark:hover:bg-slate-800">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">₱{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <button 
                  onClick={() => onRemoveItem(item.id)}
                  className="text-slate-300 dark:text-slate-700 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                >
                  <i className="fa-solid fa-trash-can text-sm"></i>
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
                        flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border transition-all
                        ${active 
                          ? `${person.avatarColor.replace('bg-', 'text-')} bg-white dark:bg-slate-900 border-current ring-1 ring-current` 
                          : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700 grayscale opacity-60'
                        }
                      `}
                    >
                      <div className={`w-4 h-4 rounded-full ${person.avatarColor} flex items-center justify-center text-[8px] text-white`}>
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
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center">
          <p className="text-indigo-600 dark:text-indigo-400 text-lg font-bold">Total: ₱{totalBill.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      )}
    </div>
  );
};

export default BillManager;
