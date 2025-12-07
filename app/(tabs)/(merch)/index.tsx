
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { MerchCard } from '@/components/MerchCard';
import { getAllMerchandise, getMerchandiseByCategory } from '@/utils/merchandiseManager';
import { Merchandise } from '@/types/Merchandise';
import { IconSymbol } from '@/components/IconSymbol';

export default function MerchScreen() {
  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 't-shirt' | 'hoodie'>('all');

  useEffect(() => {
    loadMerchandise();
  }, [selectedCategory]);

  const loadMerchandise = useCallback(async () => {
    try {
      console.log('Loading merchandise...');
      let items: Merchandise[];
      
      if (selectedCategory === 'all') {
        items = await getAllMerchandise();
        // Filter out hats
        items = items.filter(item => item.category !== 'hat');
      } else {
        items = await getMerchandiseByCategory(selectedCategory);
      }
      
      console.log('Merchandise loaded:', items.length);
      setMerchandise(items);
    } catch (error) {
      console.error('Error loading merchandise:', error);
    }
  }, [selectedCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMerchandise();
    setRefreshing(false);
  }, [loadMerchandise]);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Logo Header */}
        <View style={styles.logoHeader}>
          <Image
            source={require('@/assets/images/41ef1326-753f-4d5c-8e07-37101b3799e0.jpeg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <IconSymbol
            ios_icon_name="bag.fill"
            android_material_icon_name="shopping_bag"
            size={48}
            color={colors.primary}
          />
          <Text style={styles.headerTitle}>🌿 Afroman Merch 🌿</Text>
          <Text style={styles.headerSubtitle}>Official merchandise from the Grammy-nominated artist</Text>
        </View>

        {/* Category Filter */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <TouchableOpacity
              style={[styles.filterButton, selectedCategory === 'all' && styles.filterButtonActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.filterButtonText, selectedCategory === 'all' && styles.filterButtonTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedCategory === 't-shirt' && styles.filterButtonActive]}
              onPress={() => setSelectedCategory('t-shirt')}
            >
              <IconSymbol
                ios_icon_name="tshirt.fill"
                android_material_icon_name="checkroom"
                size={16}
                color={selectedCategory === 't-shirt' ? colors.background : colors.text}
              />
              <Text style={[styles.filterButtonText, selectedCategory === 't-shirt' && styles.filterButtonTextActive]}>
                T-Shirts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedCategory === 'hoodie' && styles.filterButtonActive]}
              onPress={() => setSelectedCategory('hoodie')}
            >
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="checkroom"
                size={16}
                color={selectedCategory === 'hoodie' ? colors.background : colors.text}
              />
              <Text style={[styles.filterButtonText, selectedCategory === 'hoodie' && styles.filterButtonTextActive]}>
                Hoodies
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Merchandise Grid */}
        <View style={styles.section}>
          {merchandise.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="bag.badge.questionmark"
                android_material_icon_name="shopping_bag"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyStateText}>No merchandise available</Text>
              <Text style={styles.emptyStateSubtext}>Check back soon for new items!</Text>
            </View>
          ) : (
            merchandise.map((item, index) => (
              <React.Fragment key={index}>
                <MerchCard item={item} />
              </React.Fragment>
            ))
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Why Shop With Us:</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>✓</Text>
            <Text style={styles.infoText}>100% Official Afroman merchandise</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>✓</Text>
            <Text style={styles.infoText}>Premium quality materials</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>✓</Text>
            <Text style={styles.infoText}>Fast shipping worldwide</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>✓</Text>
            <Text style={styles.infoText}>Support your favorite artist</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>✓</Text>
            <Text style={styles.infoText}>Add items to cart and checkout securely</Text>
          </View>
        </View>
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
  logoHeader: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  logoImage: {
    width: '100%',
    height: '100%',
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
    fontStyle: 'italic',
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: 24,
  },
  filterScroll: {
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.background,
  },
  section: {
    marginBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoBullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 12,
    fontWeight: 'bold',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
