import React, { useState, useMemo, useEffect } from 'react';
import { Person, BillItem, SplitResult, HistoryEntry } from './types';
import { AVATAR_COLORS } from './constants';
import PeopleManager from './components/PeopleManager';
import BillManager from './components/BillManager';
import Summary from './components/Summary';
import Header from './components/Header';
import SavedBills from './components/SavedBills';

const App: React.FC = () => {
  // Initialize state from LocalStorage or defaults
  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem('splitwise_people');
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'Me', avatarColor: AVATAR_COLORS[0] }];
  });

  const [items, setItems] = useState<BillItem[]>(() => {
    const saved = localStorage.getItem('splitwise_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [billTitle, setBillTitle] = useState(() => {
    return localStorage.getItem('splitwise_bill_title') || '';
  });

  const [paidStatus, setPaidStatus] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('splitwise_paid_status');
    return saved ? JSON.parse(saved) : {};
  });

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [viewingHistoryEntry, setViewingHistoryEntry] = useState<HistoryEntry | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('splitwise_theme') === 'dark';
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('splitwise_people', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem('splitwise_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('splitwise_bill_title', billTitle);
  }, [billTitle]);

  useEffect(() => {
    localStorage.setItem('splitwise_paid_status', JSON.stringify(paidStatus));
  }, [paidStatus]);

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
        const updatedEntry = {
          ...entry,
          results: entry.results.map(res => 
            res.person.id === personId ? { ...res, isPaid: !res.isPaid } : res
          )
        };
        if (viewingHistoryEntry?.id === billId) {
          setViewingHistoryEntry(updatedEntry);
        }
        return updatedEntry;
      }
      return entry;
    });
    setHistory(updatedHistory);
    localStorage.setItem('splitwise_history', JSON.stringify(updatedHistory));
  };

  const removeBillFromHistory = (billId: string) => {
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
      title: billTitle.trim() || (items.length > 0 ? items[0].name + (items.length > 1 ? '...' : '') : 'Quick Split'),
      total,
      results: JSON.parse(JSON.stringify(results)) 
    };
    
    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('splitwise_history', JSON.stringify(updatedHistory));
  };

  const clearCurrent = () => {
    if (window.confirm("Clear all items and people?")) {
      setItems([]);
      setBillTitle('');
      setPeople([{ id: '1', name: 'Me', avatarColor: AVATAR_COLORS[0] }]);
      setPaidStatus({});
      // Ensure LocalStorage is also cleaned up
      localStorage.removeItem('splitwise_items');
      localStorage.removeItem('splitwise_bill_title');
      localStorage.removeItem('splitwise_people');
      localStorage.removeItem('splitwise_paid_status');
    }
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
      assignedPersonIds: people.length > 0 ? [people[0].id] : []
    };
    setItems([...items, newItem]);
  };

  const updateItem = (updatedItem: BillItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
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
        isHistoryVisible={showHistory}
      />
      
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-8">
        {showHistory ? (
          <SavedBills 
            history={history} 
            onClose={() => setShowHistory(false)} 
            onTogglePaid={togglePaidInHistory}
            onRemoveBill={removeBillFromHistory}
            onViewBill={(entry) => setViewingHistoryEntry(entry)}
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
                billTitle={billTitle}
                setBillTitle={setBillTitle}
                onAddItem={addItem} 
                onUpdateItem={updateItem}
                onRemoveItem={removeItem}
                onBulkAdd={() => {}} // Legacy
                onClearAll={() => setItems([])}
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

      {/* Modal for viewing active split details */}
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

      {/* Modal for viewing saved bill details from history */}
      {viewingHistoryEntry && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{viewingHistoryEntry.title}</h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{viewingHistoryEntry.date}</p>
              </div>
              <button 
                onClick={() => setViewingHistoryEntry(null)}
                className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <Summary 
                results={viewingHistoryEntry.results} 
                totalItems={viewingHistoryEntry.results.reduce((acc, r) => acc + r.items.length, 0)}
                onTogglePaid={(personId) => togglePaidInHistory(viewingHistoryEntry.id, personId)}
                onSave={() => {}} 
                onClear={() => {}} 
                isModal
                isHistoryView
              />
            </div>
          </div>
        </div>
      )}

      {!showHistory && !showSplitModal && !viewingHistoryEntry && (
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