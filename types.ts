
export interface Person {
  id: string;
  name: string;
  avatarColor: string;
}

export interface UserProfile {
  name: string;
  paymentMethod: 'GCash' | 'Maya' | 'Bank' | 'Other' | '';
  paymentDetails: string;
  bankName?: string;
  accountNumber?: string;
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
  discountAmount: number;
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

// Added RoomParticipant and RoomSession interfaces to support collaboration features
export interface RoomParticipant {
  id: string;
  name: string;
}

export interface RoomSession {
  roomId: string | null;
  participants: RoomParticipant[];
}
