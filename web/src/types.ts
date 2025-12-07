export interface Chat {
  id: string;
  listingId: string;
  listing: Listing;
  buyer: User;
  seller: User;
  lastMessage?: Message;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  sender: User;
  content: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  pictureUrl?: string;
}

export interface Listing {
  id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  condition: string;
  seller: User;
  createdAt: string;
}