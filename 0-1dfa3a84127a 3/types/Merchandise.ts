
export interface Merchandise {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: 't-shirt' | 'hoodie' | 'hat';
  sizes: string[];
  colors: string[];
  stock_quantity: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface MerchOrder {
  id: string;
  user_id: string;
  merchandise_id: string;
  quantity: number;
  size?: string;
  color?: string;
  total_price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address?: string;
  created_at: string;
  updated_at: string;
}
