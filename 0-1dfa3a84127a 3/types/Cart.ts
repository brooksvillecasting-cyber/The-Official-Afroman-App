
export interface CartItem {
  id: string;
  type: 'merchandise' | 'movie' | 'subscription';
  itemId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  quantity: number;
  
  // Merchandise specific
  size?: string;
  color?: string;
  category?: string;
  
  // Movie specific
  duration?: number;
  
  // Subscription specific
  subscriptionType?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}
