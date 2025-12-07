
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { Merchandise } from '@/types/Merchandise';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { addToCart } from '@/utils/cartManager';

interface MerchCardProps {
  item: Merchandise;
}

export function MerchCard({ item }: MerchCardProps) {
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  const getCategoryIcon = () => {
    switch (item.category) {
      case 't-shirt':
        return { ios: 'tshirt.fill', android: 'checkroom' };
      case 'hoodie':
        return { ios: 'person.fill', android: 'checkroom' };
      default:
        return { ios: 'bag.fill', android: 'shopping_bag' };
    }
  };

  const handleAddToCart = () => {
    if (item.sizes.length > 0 && !selectedSize) {
      setShowSizeModal(true);
      return;
    }

    const success = addToCart({
      type: 'merchandise',
      itemId: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.image_url,
      quantity: 1,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      category: item.category,
    });

    if (success) {
      Alert.alert(
        'Added to Cart',
        `${item.name} has been added to your cart!`,
        [{ text: 'OK' }]
      );
      setShowSizeModal(false);
      setSelectedSize('');
      setSelectedColor('');
    } else {
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  const handleSizeSelection = (size: string) => {
    setSelectedSize(size);
    if (item.colors.length === 0) {
      // If no colors, add to cart immediately
      setTimeout(() => {
        handleAddToCart();
      }, 100);
    }
  };

  const handleColorSelection = (color: string) => {
    setSelectedColor(color);
    // Add to cart after color selection
    setTimeout(() => {
      handleAddToCart();
    }, 100);
  };

  const icon = getCategoryIcon();

  return (
    <>
      <View style={styles.card}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Price Badge */}
        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>${item.price.toFixed(2)}</Text>
        </View>

        {item.stock_quantity < 10 && item.stock_quantity > 0 && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>Only {item.stock_quantity} left!</Text>
          </View>
        )}

        {item.stock_quantity === 0 && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <IconSymbol
              ios_icon_name={icon.ios}
              android_material_icon_name={icon.android}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.category}>{item.category.toUpperCase()}</Text>
          </View>

          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            
            <TouchableOpacity 
              style={[styles.buyButton, item.stock_quantity === 0 && styles.buyButtonDisabled]}
              disabled={item.stock_quantity === 0}
              onPress={handleAddToCart}
            >
              <IconSymbol
                ios_icon_name="cart.fill"
                android_material_icon_name="shopping_cart"
                size={16}
                color={item.stock_quantity === 0 ? colors.textSecondary : colors.text}
              />
              <Text style={[styles.buyButtonText, item.stock_quantity === 0 && styles.buyButtonTextDisabled]}>
                {item.stock_quantity === 0 ? 'Sold Out' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          </View>

          {item.sizes.length > 0 && (
            <View style={styles.sizesContainer}>
              <Text style={styles.sizesLabel}>Sizes:</Text>
              <Text style={styles.sizesText}>{item.sizes.join(', ')}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Size/Color Selection Modal */}
      <Modal
        visible={showSizeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSizeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSizeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Options</Text>
            
            {/* Size Selection */}
            {item.sizes.length > 0 && (
              <View style={styles.optionSection}>
                <Text style={styles.optionLabel}>Size:</Text>
                <View style={styles.optionButtons}>
                  {item.sizes.map((size, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        selectedSize === size && styles.optionButtonSelected,
                      ]}
                      onPress={() => handleSizeSelection(size)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          selectedSize === size && styles.optionButtonTextSelected,
                        ]}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Color Selection */}
            {item.colors.length > 0 && selectedSize && (
              <View style={styles.optionSection}>
                <Text style={styles.optionLabel}>Color:</Text>
                <View style={styles.optionButtons}>
                  {item.colors.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        selectedColor === color && styles.optionButtonSelected,
                      ]}
                      onPress={() => handleColorSelection(color)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          selectedColor === color && styles.optionButtonTextSelected,
                        ]}
                      >
                        {color}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSizeModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.5)',
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: colors.secondary,
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)',
    elevation: 4,
  },
  priceBadgeText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  lowStockBadge: {
    position: 'absolute',
    top: 60,
    right: 12,
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  lowStockText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#666',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  outOfStockText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buyButtonDisabled: {
    backgroundColor: colors.secondary,
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  buyButtonTextDisabled: {
    color: colors.textSecondary,
  },
  sizesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sizesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sizesText: {
    fontSize: 12,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionSection: {
    marginBottom: 24,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  optionButtonTextSelected: {
    color: colors.text,
  },
  modalCloseButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});
