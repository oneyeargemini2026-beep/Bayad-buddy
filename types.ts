
export interface Person {
  id: string;
  name: string;
  avatarColor: string;
}

export interface BillItem {
  id: string;
  name: string;
  price: number;
  assignedPersonIds: string[];
}

export interface SplitResult {
  person: Person;
  items: { itemName: string; share: number }[];
  subtotal: number;
  total: number;
  isPaid: boolean;
}

export interface HistoryEntry {
  id: string;
  date: string;
  title: string;
  total: number;
  results: SplitResult[];
}
