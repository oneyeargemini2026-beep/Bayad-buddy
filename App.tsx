
import React, { useState, useMemo, useEffect } from 'react';
import { Person, BillItem, SplitResult, HistoryEntry } from './types';
import { AVATAR_COLORS } from './constants';
import PeopleManager from './components/PeopleManager';
import BillManager from './components/BillManager';
import Summary from './components/Summary';
import Header from './components/Header';
import SavedBills from './components/SavedBills';

const App: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'Me', avatarColor: AVATAR_COLORS[0] }
  ]);
  const [items, setItems] = useState<BillItem[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [paidStatus, setPaidStatus] = useState<Record<string, boolean>>({});
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('splitwise_theme') === 'dark';
  });

  // Theme effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('splitwise_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('splitwise_theme', 'light');
    }
  }, [darkMode]);

  // Persistence for history
  useEffect(() => {
    const saved = localStorage.getItem('splitwise_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const toggleTheme = () => setDarkMode(!darkMode);

  const togglePersonPaid = (personId: string) => {
    setPaidStatus(prev => ({
      ...prev,
      [personId]: !prev[personId]
    }));
  };

  const togglePaidInHistory = (billId: string, personId: string) => {
    const updatedHistory = history.map(entry => {
      if (entry.id === billId) {
        return {
          ...entry,
          results: entry.results.map(res => 
            res.person.id === personId ? { ...res, isPaid: !res.isPaid } : res
          )
        };
      }
      return entry;
    });
    setHistory(updatedHistory);
    localStorage.setItem('splitwise_history', JSON.stringify(updatedHistory));
  };

  const removeBillFromHistory = (billId: string) => {
    // Immediate state update for snappy UI
    const updatedHistory = history.filter(entry => entry.id !== billId);
    setHistory(updatedHistory);
    localStorage.setItem('splitwise_history', JSON.stringify(updatedHistory));
  };

  const saveToHistory = (results: SplitResult[]) => {
    if (items.length === 0) return;
    
    const generateId = () => {
      try {
        return crypto.randomUUID();
      } catch (e) {
        return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      }
    };

    const total = items.reduce((acc, item) => acc + item.price, 0);
    const newEntry: HistoryEntry = {
      id: generateId(),
      date: new Date().toLocaleString(),
      title: items.length > 0 ? items[0].name + (items.length > 1 ? '...' : '') : 'Quick Split',
      total,
      results: JSON.parse(JSON.stringify(results)) 
    };
    
    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('splitwise_history', JSON.stringify(updatedHistory));
  };

  const clearCurrent = () => {
    setItems([]);
    setPeople([{ id: '1', name: 'Me', avatarColor: AVATAR_COLORS[0] }]);
    setPaidStatus({});
  };

  const addPerson = (name: string) => {
    const newPerson: Person = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      avatarColor: AVATAR_COLORS[people.length % AVATAR_COLORS.length]
    };
    setPeople([...people, newPerson]);
  };

  const removePerson = (id: string) => {
    if (people.length <= 1) return;
    setPeople(people.filter(p => p.id !== id));
    setItems(items.map(item => ({
      ...item,
      assignedPersonIds: item.assignedPersonIds.filter(pid => pid !== id)
    })));
    const newPaidStatus = { ...paidStatus };
    delete newPaidStatus[id];
    setPaidStatus(newPaidStatus);
  };

  const addItem = (name: string, price: number) => {
    const newItem: BillItem = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      price,
      assignedPersonIds: [people[0].id]
    };
    setItems([...items, newItem]);
  };

  const updateItem = (updatedItem: BillItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addBulkItems = (newItems: { name: string; price: number }[]) => {
    const itemsToAdd = newItems.map(ni => ({
      id: Math.random().toString(36).substring(2, 9),
      name: ni.name,
      price: ni.price,
      assignedPersonIds: [people[0].id]
    }));
    setItems([...items, ...itemsToAdd]);
  };

  const splitResults = useMemo(() => {
    const resultsMap: Record<string, SplitResult> = {};
    people.forEach(p => {
      resultsMap[p.id] = {
        person: p,
        items: [],
        subtotal: 0,
        total: 0,
        isPaid: !!paidStatus[p.id]
      };
    });

    items.forEach(item => {
      const numPeople = item.assignedPersonIds.length;
      if (numPeople === 0) return;
      
      const share = item.price / numPeople;

      item.assignedPersonIds.forEach(pid => {
        if (resultsMap[pid]) {
          resultsMap[pid].items.push({ itemName: item.name, share });
          resultsMap[pid].subtotal += share;
          resultsMap[pid].total += share;
        }
      });
    });

    return Object.values(resultsMap);
  }, [people, items, paidStatus]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-20">
      <Header 
        onToggleHistory={() => setShowHistory(!showHistory)} 
        onToggleTheme={toggleTheme}
        darkMode={darkMode}
      />
      
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-8">
        {showHistory ? (
          <SavedBills 
            history={history} 
            onClose={() => setShowHistory(false)} 
            onTogglePaid={togglePaidInHistory}
            onRemoveBill={removeBillFromHistory}
            onClearHistory={() => {
              if (window.confirm("Remove all saved bills from history?")) {
                setHistory([]);
                localStorage.removeItem('splitwise_history');
              }
            }}
          />
        ) : (
          <>
            <section>
              <PeopleManager 
                people={people} 
                onAdd={addPerson} 
                onRemove={removePerson} 
              />
            </section>

            <section>
              <BillManager 
                items={items} 
                people={people}
                onAddItem={addItem} 
                onUpdateItem={updateItem}
                onRemoveItem={removeItem}
                onBulkAdd={addBulkItems}
              />
            </section>

            <section>
              <Summary 
                results={splitResults} 
                totalItems={items.length}
                onTogglePaid={togglePersonPaid}
                onSave={() => {
                  saveToHistory(splitResults);
                  alert("Bill saved to history!");
                }}
                onClear={clearCurrent}
              />
            </section>
          </>
        )}
      </main>

      {/* Modal for viewing split details */}
      {showSplitModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Split Details</h2>
              <button 
                onClick={() => setShowSplitModal(false)}
                className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <Summary 
                results={splitResults} 
                totalItems={items.length}
                onTogglePaid={togglePersonPaid}
                onSave={() => saveToHistory(splitResults)}
                onClear={clearCurrent}
                isModal
              />
            </div>
          </div>
        </div>
      )}

      {!showHistory && !showSplitModal && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 md:hidden flex justify-between items-center shadow-lg z-50 transition-colors">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total: <span className="text-indigo-600 dark:text-indigo-400 font-bold">₱{splitResults.reduce((acc, r) => acc + r.total, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <button 
            onClick={() => setShowSplitModal(true)}
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95 transition-transform flex items-center gap-2"
          >
            <i className="fa-solid fa-expand text-xs"></i>
            View Split
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
