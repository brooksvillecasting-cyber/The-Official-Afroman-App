
import { supabase } from '@/app/integrations/supabase/client';
import { Merchandise, MerchOrder } from '@/types/Merchandise';

export async function getAllMerchandise(): Promise<Merchandise[]> {
  try {
    const { data, error } = await supabase
      .from('merchandise')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching merchandise:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      image_url: item.image_url,
      category: item.category,
      sizes: item.sizes || [],
      colors: item.colors || [],
      stock_quantity: item.stock_quantity || 0,
      is_available: item.is_available,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  } catch (error) {
    console.error('Exception fetching merchandise:', error);
    return [];
  }
}

export async function getMerchandiseByCategory(category: string): Promise<Merchandise[]> {
  try {
    const { data, error } = await supabase
      .from('merchandise')
      .select('*')
      .eq('category', category)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching merchandise by category:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      image_url: item.image_url,
      category: item.category,
      sizes: item.sizes || [],
      colors: item.colors || [],
      stock_quantity: item.stock_quantity || 0,
      is_available: item.is_available,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  } catch (error) {
    console.error('Exception fetching merchandise by category:', error);
    return [];
  }
}

export async function createMerchOrder(
  merchandiseId: string,
  quantity: number,
  size?: string,
  color?: string,
  shippingAddress?: string
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get merchandise details
    const { data: merch, error: merchError } = await supabase
      .from('merchandise')
      .select('price, stock_quantity')
      .eq('id', merchandiseId)
      .single();

    if (merchError || !merch) {
      return { success: false, error: 'Merchandise not found' };
    }

    if (merch.stock_quantity < quantity) {
      return { success: false, error: 'Insufficient stock' };
    }

    const totalPrice = parseFloat(merch.price) * quantity;

    const { data, error } = await supabase
      .from('merch_orders')
      .insert({
        user_id: user.id,
        merchandise_id: merchandiseId,
        quantity,
        size,
        color,
        total_price: totalPrice,
        shipping_address: shippingAddress,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }

    return { success: true, orderId: data.id };
  } catch (error) {
    console.error('Exception creating order:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getUserOrders(): Promise<MerchOrder[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('merch_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return (data || []).map(order => ({
      id: order.id,
      user_id: order.user_id,
      merchandise_id: order.merchandise_id,
      quantity: order.quantity,
      size: order.size,
      color: order.color,
      total_price: parseFloat(order.total_price),
      status: order.status,
      shipping_address: order.shipping_address,
      created_at: order.created_at,
      updated_at: order.updated_at,
    }));
  } catch (error) {
    console.error('Exception fetching orders:', error);
    return [];
  }
}
