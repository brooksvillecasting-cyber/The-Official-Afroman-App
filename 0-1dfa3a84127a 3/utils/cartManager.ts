
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Cart } from '@/types/Cart';

const CART_KEY = 'afroman_cart';

export async function getCart(): Promise<Cart> {
  try {
    const cartData = await AsyncStorage.getItem(CART_KEY);
    if (cartData) {
      const cart = JSON.parse(cartData);
      return cart;
    }
    return { items: [], totalItems: 0, totalPrice: 0 };
  } catch (error) {
    console.error('Error getting cart:', error);
    return { items: [], totalItems: 0, totalPrice: 0 };
  }
}

export async function addToCart(item: Omit<CartItem, 'id'>): Promise<boolean> {
  try {
    const cart = await getCart();
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (cartItem) => 
        cartItem.itemId === item.itemId && 
        cartItem.type === item.type &&
        cartItem.size === item.size &&
        cartItem.color === item.color
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        ...item,
        id: `${item.type}_${item.itemId}_${Date.now()}`,
      };
      cart.items.push(newItem);
    }

    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
    console.log('Item added to cart:', item.name);
    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return false;
  }
}

export async function removeFromCart(cartItemId: string): Promise<boolean> {
  try {
    const cart = await getCart();
    cart.items = cart.items.filter(item => item.id !== cartItemId);
    
    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
    console.log('Item removed from cart');
    return true;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return false;
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<boolean> {
  try {
    if (quantity <= 0) {
      return await removeFromCart(cartItemId);
    }

    const cart = await getCart();
    const itemIndex = cart.items.findIndex(item => item.id === cartItemId);
    
    if (itemIndex !== -1) {
      cart.items[itemIndex].quantity = quantity;
      
      // Recalculate totals
      cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
      console.log('Cart item quantity updated');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return false;
  }
}

export async function clearCart(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(CART_KEY);
    console.log('Cart cleared');
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    return false;
  }
}

export async function getCartItemCount(): Promise<number> {
  try {
    const cart = await getCart();
    return cart.totalItems;
  } catch (error) {
    console.error('Error getting cart item count:', error);
    return 0;
  }
}
