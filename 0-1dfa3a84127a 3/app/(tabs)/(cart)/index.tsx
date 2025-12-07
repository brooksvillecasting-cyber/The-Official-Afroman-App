
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Linking } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { getCart, removeFromCart, updateCartItemQuantity, clearCart } from '@/utils/cartManager';
import { Cart, CartItem } from '@/types/Cart';
import { IconSymbol } from '@/components/IconSymbol';

export default function CartScreen() {
  const [cart, setCart] = useState<Cart>({ items: [], totalItems: 0, totalPrice: 0 });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = useCallback(async () => {
    try {
      console.log('Loading cart...');
      const cartData = await getCart();
      console.log('Cart loaded:', cartData.items.length, 'items');
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, []);

  const handleRemoveItem = async (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await removeFromCart(itemId);
            if (success) {
              await loadCart();
            }
          },
        },
      ]
    );
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    const success = await updateCartItemQuantity(itemId, newQuantity);
    if (success) {
      await loadCart();
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            const success = await clearCart();
            if (success) {
              await loadCart();
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checking out.');
      return;
    }

    // Separate items by type
    const merchandiseItems = cart.items.filter(item => item.type === 'merchandise');
    const subscriptionItems = cart.items.filter(item => item.type === 'subscription');
    const movieItems = cart.items.filter(item => item.type === 'movie');

    // Determine which payment link to use
    if (movieItems.length > 0 || subscriptionItems.length > 0) {
      // Premium content (movies) and subscription payment link
      Alert.alert(
        'Checkout - Premium Content',
        'You will be redirected to complete your purchase for premium content.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => {
              Linking.openURL('https://buy.stripe.com/7sYdRb1Nj5xCfSlfKd6Na07');
            },
          },
        ]
      );
    } else if (merchandiseItems.length > 0) {
      // Merchandise payment link
      Alert.alert(
        'Checkout - Merchandise',
        'You will be redirected to complete your merchandise purchase.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => {
              Linking.openURL('https://buy.stripe.com/6oU3cx77D1hmcG92Xr6Na02');
            },
          },
        ]
      );
    }
  };

  const renderCartItem = (item: CartItem) => {
    return (
      <View key={item.id} style={styles.cartItem}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          
          {item.type === 'merchandise' && (
            <View style={styles.itemOptions}>
              {item.size && (
                <Text style={styles.itemOption}>Size: {item.size}</Text>
              )}
              {item.color && (
                <Text style={styles.itemOption}>Color: {item.color}</Text>
              )}
            </View>
          )}
          
          {item.type === 'movie' && item.duration && (
            <Text style={styles.itemOption}>
              Duration: {Math.floor(item.duration / 60)}m
            </Text>
          )}
          
          <View style={styles.itemFooter}>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            
            {item.type === 'merchandise' && (
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                >
                  <IconSymbol
                    ios_icon_name="minus"
                    android_material_icon_name="remove"
                    size={16}
                    color={colors.text}
                  />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{item.quantity}</Text>
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <IconSymbol
                    ios_icon_name="plus"
                    android_material_icon_name="add"
                    size={16}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <IconSymbol
            ios_icon_name="trash.fill"
            android_material_icon_name="delete"
            size={20}
            color={colors.accent}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconSymbol
            ios_icon_name="cart.fill"
            android_material_icon_name="shopping_cart"
            size={48}
            color={colors.primary}
          />
          <Text style={styles.headerTitle}>🌿 Shopping Cart 🌿</Text>
          <Text style={styles.headerSubtitle}>
            {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your cart
          </Text>
        </View>

        {cart.items.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="cart.badge.questionmark"
              android_material_icon_name="shopping_cart"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>Your cart is empty</Text>
            <Text style={styles.emptyStateSubtext}>
              Add some items to get started!
            </Text>
          </View>
        ) : (
          <>
            {/* Cart Items */}
            <View style={styles.section}>
              {cart.items.map((item) => (
                <React.Fragment key={item.id}>
                  {renderCartItem(item)}
                </React.Fragment>
              ))}
            </View>

            {/* Clear Cart Button */}
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearCart}
            >
              <IconSymbol
                ios_icon_name="trash"
                android_material_icon_name="delete_outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.clearButtonText}>Clear Cart</Text>
            </TouchableOpacity>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>${cart.totalPrice.toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items:</Text>
                <Text style={styles.summaryValue}>{cart.totalItems}</Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total:</Text>
                <Text style={styles.summaryTotalValue}>${cart.totalPrice.toFixed(2)}</Text>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <IconSymbol
                ios_icon_name="creditcard.fill"
                android_material_icon_name="payment"
                size={20}
                color={colors.text}
              />
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>

            {/* Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                🔒 Secure checkout powered by Stripe
              </Text>
              <Text style={styles.infoText}>
                📦 Fast shipping on all merchandise
              </Text>
              <Text style={styles.infoText}>
                🎬 Instant access to digital content
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.secondary,
    padding: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  itemOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  itemOption: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    backgroundColor: colors.secondary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    justifyContent: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 24,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.secondary,
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
});
