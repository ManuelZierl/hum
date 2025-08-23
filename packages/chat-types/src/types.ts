export interface Media {
  id: string;
  kind: 'image' | 'video' | 'audio' | 'file';
  url: string;
  thumbnailUrl?: string;
}

export interface Reaction {
  userId: string;
  emoji: string;
  timestamp: number;
}

export interface Receipt {
  userId: string;
  type: 'delivered' | 'read';
  timestamp: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  timestamp: number;
  text?: string;
  media?: Media[];
  reactions?: Reaction[];
  receipts?: Receipt[];
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
}
