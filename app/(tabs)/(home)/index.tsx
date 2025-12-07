
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { MovieCard } from '@/components/MovieCard';
import { mockMovies } from '@/data/mockMovies';
import { Movie } from '@/types/Movie';
import { supabase } from '@/app/integrations/supabase/client';
import { IconSymbol } from '@/components/IconSymbol';
import { hasPremiumAccess } from '@/utils/premiumAccessManager';
import { confirmPaymentManually } from '@/utils/paymentLinkManager';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [freeVideos, setFreeVideos] = useState<Movie[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadMovies();
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    const premium = await hasPremiumAccess();
    setIsPremium(premium);
  };

  const loadMovies = useCallback(async () => {
    try {
      console.log('Loading movies from database...');
      
      // Fetch movies from Supabase
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching movies:', error);
        setMovies(mockMovies);
        return;
      }

      // Transform database movies to Movie type
      const dbMovies: Movie[] = (data || []).map(movie => ({
        id: movie.id,
        title: movie.title,
        description: movie.description,
        thumbnailUrl: movie.thumbnail_url,
        videoUrl: movie.video_url,
        duration: movie.duration,
        uploadDate: movie.uploaded_at || movie.created_at,
        isNew: movie.is_new,
        category: movie.category || 'movie',
        price: movie.price ? parseFloat(movie.price) : undefined,
        isFree: movie.is_free,
        youtubeId: movie.youtube_id,
      }));

      // Separate free videos from paid content
      const free = dbMovies.filter(m => m.isFree);
      const paid = dbMovies.filter(m => !m.isFree);

      // Combine with mock movies
      const allPaidMovies = [...mockMovies, ...paid];
      
      console.log('Movies loaded:', allPaidMovies.length, 'paid,', free.length, 'free');
      setMovies(allPaidMovies);
      setFreeVideos(free);
    } catch (error) {
      console.error('Error loading movies:', error);
      setMovies(mockMovies);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMovies();
    await checkPremiumStatus();
    setRefreshing(false);
  }, [loadMovies]);

  const handleConfirmPayment = async () => {
    await confirmPaymentManually();
    await checkPremiumStatus();
    await loadMovies();
  };

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

        {/* Hero Section with Afroman Images */}
        <View style={styles.heroSection}>
          <Image
            source={require('@/assets/images/60424274-97cc-49bf-9e5f-153952633a54.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>🌿 AFROMAN 🌿</Text>
            <Text style={styles.heroSubtitle}>Grammy Nominated Artist</Text>
            <Text style={styles.heroTagline}>Official Content & Merchandise</Text>
          </View>
        </View>

        {/* Secondary Hero Image */}
        <View style={styles.secondaryHero}>
          <Image
            source={require('@/assets/images/581307f6-4d5e-4570-9a15-e706da126626.png')}
            style={styles.secondaryImage}
            resizeMode="cover"
          />
        </View>

        {/* Admin Button */}
        <TouchableOpacity 
          style={styles.adminButton}
          onPress={() => router.push('/admin')}
        >
          <IconSymbol
            ios_icon_name="lock.shield.fill"
            android_material_icon_name="admin_panel_settings"
            size={20}
            color={colors.text}
          />
          <Text style={styles.adminButtonText}>Admin Portal</Text>
        </TouchableOpacity>

        {/* Premium Status Card */}
        {isPremium ? (
          <View style={styles.premiumStatusCard}>
            <IconSymbol
              ios_icon_name="checkmark.seal.fill"
              android_material_icon_name="verified"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.premiumStatusTitle}>Premium Access Active</Text>
            <Text style={styles.premiumStatusText}>
              You have lifetime access to all premium content!
            </Text>
          </View>
        ) : (
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <IconSymbol
                ios_icon_name="crown.fill"
                android_material_icon_name="workspace_premium"
                size={32}
                color={colors.primary}
              />
              <Text style={styles.subscriptionTitle}>Get Premium Access</Text>
            </View>
            
            <Text style={styles.subscriptionPrice}>$19.99 One-Time</Text>
            
            <View style={styles.subscriptionFeatures}>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>Lifetime access to ALL premium content</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>Exclusive videos and behind-the-scenes</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>Watch anytime, anywhere</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>No recurring fees</Text>
              </View>
            </View>

            <Text style={styles.paymentNote}>
              Click on any premium content below to get access
            </Text>

            <TouchableOpacity
              style={styles.confirmPaymentButton}
              onPress={handleConfirmPayment}
            >
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={18}
                color={colors.text}
              />
              <Text style={styles.confirmPaymentButtonText}>Already Paid? Activate Access</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Free Music Videos Section */}
        {freeVideos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol
                ios_icon_name="music.note"
                android_material_icon_name="music_note"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.sectionTitle}>Free Music Videos</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Watch these iconic hits for free! No purchase required.
            </Text>
            {freeVideos.map((video, index) => (
              <React.Fragment key={index}>
                <MovieCard movie={video} onPurchaseComplete={onRefresh} />
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Premium Content Section */}
        {movies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.sectionTitle}>Premium Content</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Get lifetime access to exclusive content with a one-time payment
            </Text>
            {movies.map((movie, index) => (
              <React.Fragment key={index}>
                <MovieCard movie={movie} onPurchaseComplete={onRefresh} />
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What You Get:</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>✓</Text>
            <Text style={styles.infoText}>Free music videos from Grammy-nominated hits</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>✓</Text>
            <Text style={styles.infoText}>Lifetime access to all premium content</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>✓</Text>
            <Text style={styles.infoText}>High-quality video streaming</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>✓</Text>
            <Text style={styles.infoText}>Playback speed control</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>✓</Text>
            <Text style={styles.infoText}>Watch anytime, anywhere</Text>
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
    paddingBottom: 120,
  },
  logoHeader: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  heroSection: {
    width: '100%',
    height: 400,
    position: 'relative',
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  heroTagline: {
    fontSize: 16,
    color: '#CCCCCC',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  secondaryHero: {
    width: '100%',
    height: 300,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    width: width - 32,
  },
  secondaryImage: {
    width: '100%',
    height: '100%',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 24,
    alignSelf: 'center',
    marginHorizontal: 16,
  },
  adminButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  premiumStatusCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(60, 179, 113, 0.3)',
    elevation: 6,
  },
  premiumStatusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  premiumStatusText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  subscriptionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    boxShadow: '0px 4px 12px rgba(60, 179, 113, 0.3)',
    elevation: 6,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  subscriptionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subscriptionPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  subscriptionFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureBullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 12,
    fontWeight: 'bold',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  paymentNote: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  confirmPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  confirmPaymentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    marginHorizontal: 16,
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
