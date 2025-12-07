
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Movie } from '@/types/Movie';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { hasPremiumAccess } from '@/utils/premiumAccessManager';
import { openPremiumPaymentLink } from '@/utils/paymentLinkManager';

interface MovieCardProps {
  movie: Movie;
  onPurchaseComplete?: () => void;
}

export function MovieCard({ movie, onPurchaseComplete }: MovieCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, []);

  const handlePress = useCallback(async () => {
    // Free content - watch directly
    if (movie.isFree) {
      router.push(`/movie/${movie.id}`);
      return;
    }

    // Premium content - check access
    if (movie.price) {
      setLoading(true);
      const hasAccess = await hasPremiumAccess();
      setLoading(false);

      if (hasAccess) {
        // User has premium access - watch directly
        router.push(`/movie/${movie.id}`);
      } else {
        // Show purchase dialog
        Alert.alert(
          'Premium Content',
          `"${movie.title}" is premium content. Get lifetime access to ALL premium content with a one-time payment of $${movie.price.toFixed(2)}.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Get Premium Access',
              onPress: handlePurchase,
            },
          ]
        );
      }
    } else {
      // No price, just watch
      router.push(`/movie/${movie.id}`);
    }
  }, [movie.isFree, movie.price, movie.title, movie.id]);

  const handlePurchase = useCallback(async () => {
    try {
      await openPremiumPaymentLink();
      
      // Refresh after payment
      if (onPurchaseComplete) {
        onPurchaseComplete();
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      Alert.alert('Error', 'Failed to open payment page. Please try again.');
    }
  }, [onPurchaseComplete]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={loading}
    >
      <Image
        source={{ uri: movie.thumbnailUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      
      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      {/* Price Badge or Free Badge */}
      {movie.price && !movie.isFree && (
        <View style={styles.priceBadge}>
          <IconSymbol
            ios_icon_name="lock.fill"
            android_material_icon_name="lock"
            size={16}
            color={colors.text}
          />
          <Text style={styles.priceBadgeText}>PREMIUM</Text>
        </View>
      )}

      {movie.isFree && (
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>FREE</Text>
        </View>
      )}

      {movie.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {movie.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.durationContainer}>
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="schedule"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.duration}>{formatDuration(movie.duration)}</Text>
          </View>
          
          {movie.isFree ? (
            <View style={styles.watchButton}>
              <IconSymbol
                ios_icon_name="play.circle.fill"
                android_material_icon_name="play_circle"
                size={16}
                color={colors.text}
              />
              <Text style={styles.watchButtonText}>Watch Free</Text>
            </View>
          ) : (
            <View style={styles.buyButton}>
              <IconSymbol
                ios_icon_name="lock.fill"
                android_material_icon_name="lock"
                size={16}
                color={colors.text}
              />
              <Text style={styles.buyButtonText}>Get Access</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
  thumbnail: {
    width: '100%',
    height: 220,
    backgroundColor: colors.secondary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)',
    elevation: 4,
  },
  priceBadgeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  freeBadge: {
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
  freeBadgeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  newBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
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
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  watchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
