
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { colors } from '@/styles/commonStyles';
import { mockMovies } from '@/data/mockMovies';
import { IconSymbol } from '@/components/IconSymbol';
import { Movie } from '@/types/Movie';
import { supabase } from '@/app/integrations/supabase/client';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { hasPremiumAccess } from '@/utils/premiumAccessManager';
import { openPremiumPaymentLink } from '@/utils/paymentLinkManager';

export default function MovieScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | undefined>(undefined);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showControls, setShowControls] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load movie data
  useEffect(() => {
    const loadMovie = async () => {
      try {
        console.log('Loading movie with id:', id);
        
        // Check mock movies first
        let foundMovie = mockMovies.find(m => m.id === id);
        
        // If not found, check database
        if (!foundMovie) {
          const { data, error } = await supabase
            .from('movies')
            .select('*')
            .eq('id', id)
            .single();

          if (!error && data) {
            foundMovie = {
              id: data.id,
              title: data.title,
              description: data.description,
              thumbnailUrl: data.thumbnail_url,
              videoUrl: data.video_url,
              duration: data.duration,
              uploadDate: data.uploaded_at || data.created_at,
              isNew: data.is_new,
              category: data.category || 'movie',
              price: data.price ? parseFloat(data.price) : undefined,
              isFree: data.is_free,
              youtubeId: data.youtube_id,
            };
          }
        }
        
        if (foundMovie) {
          console.log('Movie found:', foundMovie.title);
          setMovie(foundMovie);
        } else {
          console.log('Movie not found with id:', id);
        }
      } catch (error) {
        console.error('Error loading movie:', error);
      }
    };
    
    loadMovie();
  }, [id]);

  // Only create video player for non-YouTube videos
  const shouldUseVideoPlayer = movie && !movie.youtubeId && movie.videoUrl;
  
  const player = useVideoPlayer(shouldUseVideoPlayer ? movie.videoUrl : '', player => {
    if (shouldUseVideoPlayer) {
      player.loop = false;
      player.play();
    }
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  // Check access status
  useEffect(() => {
    const checkAccess = async () => {
      if (movie) {
        setIsLoading(true);
        try {
          console.log('Checking access for movie:', movie.id);
          
          // Free videos don't need access check
          if (movie.isFree) {
            setHasAccess(true);
            setIsLoading(false);
            return;
          }
          
          // Check premium access
          const premiumAccess = await hasPremiumAccess();
          console.log('Premium access status:', premiumAccess);
          setHasAccess(premiumAccess);
          
          if (!premiumAccess && movie.price && !movie.youtubeId) {
            // If no access, pause the video and show alert
            try {
              player.pause();
            } catch (error) {
              console.error('Error pausing video:', error);
            }
            Alert.alert(
              'Premium Content',
              `This exclusive content requires premium access. Get lifetime access to ALL premium content for a one-time payment of $${movie.price.toFixed(2)}.`,
              [
                { text: 'Go Back', onPress: () => router.back() },
                {
                  text: 'Get Premium Access',
                  onPress: handleGetAccess,
                },
              ]
            );
          }
        } catch (error) {
          console.error('Error checking access:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    checkAccess();
  }, [movie?.id, movie?.isFree, movie?.price, movie?.youtubeId]);

  // Cleanup video player on unmount
  useEffect(() => {
    return () => {
      try {
        if (player && shouldUseVideoPlayer) {
          player.pause();
          player.release();
        }
      } catch (error) {
        console.error('Error cleaning up video player:', error);
      }
    };
  }, [player, shouldUseVideoPlayer]);

  const handleGetAccess = useCallback(async () => {
    try {
      await openPremiumPaymentLink();
      
      // Recheck access after payment
      const premiumAccess = await hasPremiumAccess();
      setHasAccess(premiumAccess);
    } catch (error) {
      console.error('Error getting access:', error);
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!hasAccess && movie?.price) {
      Alert.alert(
        'Premium Content',
        `Get premium access to watch this content.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Get Access',
            onPress: handleGetAccess,
          },
        ]
      );
      return;
    }
    
    try {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }, [hasAccess, movie?.price, isPlaying, player, handleGetAccess]);

  const handleSpeedChange = useCallback(() => {
    if (!hasAccess && movie?.price) {
      Alert.alert('Premium Content', 'Get premium access to use playback controls.');
      return;
    }
    
    try {
      const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
      const currentIndex = speeds.indexOf(playbackSpeed);
      const nextIndex = (currentIndex + 1) % speeds.length;
      const newSpeed = speeds[nextIndex];
      setPlaybackSpeed(newSpeed);
      player.playbackRate = newSpeed;
      console.log('Playback speed changed to:', newSpeed);
    } catch (error) {
      console.error('Error changing playback speed:', error);
    }
  }, [hasAccess, movie?.price, playbackSpeed, player]);

  const handleSkipBackward = useCallback(() => {
    if (!hasAccess && movie?.price) {
      Alert.alert('Premium Content', 'Get premium access to use playback controls.');
      return;
    }
    try {
      const newTime = Math.max(0, player.currentTime - 10);
      player.currentTime = newTime;
      console.log('Skipped backward to:', newTime);
    } catch (error) {
      console.error('Error skipping backward:', error);
    }
  }, [hasAccess, movie?.price, player]);

  const handleSkipForward = useCallback(() => {
    if (!hasAccess && movie?.price) {
      Alert.alert('Premium Content', 'Get premium access to use playback controls.');
      return;
    }
    try {
      const newTime = Math.min(player.duration, player.currentTime + 10);
      player.currentTime = newTime;
      console.log('Skipped forward to:', newTime);
    } catch (error) {
      console.error('Error skipping forward:', error);
    }
  }, [hasAccess, movie?.price, player]);

  if (!movie) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="error"
            size={64}
            color={colors.accent}
          />
          <Text style={styles.errorText}>Content not found</Text>
          <Text style={styles.errorSubtext}>The requested content could not be loaded.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButtonTop} onPress={() => router.back()}>
        <IconSymbol
          ios_icon_name="chevron.left"
          android_material_icon_name="arrow_back"
          size={24}
          color={colors.text}
        />
        <Text style={styles.backButtonTopText}>Back</Text>
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Video Player */}
        <View style={styles.videoContainer}>
          {movie.youtubeId ? (
            <YouTubePlayer videoId={movie.youtubeId} style={styles.video} />
          ) : (
            <>
              <VideoView
                style={styles.video}
                player={player}
                allowsFullscreen={hasAccess}
                allowsPictureInPicture={hasAccess}
                nativeControls={false}
                contentFit="contain"
              />
              
              {/* Lock Overlay for Premium Content */}
              {!hasAccess && movie.price && (
                <View style={styles.lockOverlay}>
                  <IconSymbol
                    ios_icon_name="lock.fill"
                    android_material_icon_name="lock"
                    size={64}
                    color={colors.text}
                  />
                  <Text style={styles.lockText}>Premium Content</Text>
                  <Text style={styles.lockSubtext}>Get Access to Watch</Text>
                  <TouchableOpacity style={styles.unlockButton} onPress={handleGetAccess}>
                    <Text style={styles.unlockButtonText}>Get Premium Access</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Custom Controls Overlay */}
              {showControls && hasAccess && !movie.youtubeId && (
                <View style={styles.controlsOverlay}>
                  <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
                    <IconSymbol
                      ios_icon_name={isPlaying ? 'pause.circle.fill' : 'play.circle.fill'}
                      android_material_icon_name={isPlaying ? 'pause_circle' : 'play_circle'}
                      size={64}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

        {/* Movie Info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{movie.title}</Text>
            {movie.isFree && (
              <View style={styles.freeBadge}>
                <IconSymbol
                  ios_icon_name="gift.fill"
                  android_material_icon_name="card_giftcard"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.freeText}>FREE</Text>
              </View>
            )}
            {hasAccess && !movie.isFree && (
              <View style={styles.ownedBadge}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.ownedText}>PREMIUM</Text>
              </View>
            )}
          </View>
          
          <View style={styles.metaContainer}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{movie.category.toUpperCase()}</Text>
            </View>
            <Text style={styles.uploadDate}>
              Released: {new Date(movie.uploadDate).toLocaleDateString()}
            </Text>
          </View>
          
          <Text style={styles.description}>{movie.description}</Text>

          {!hasAccess && movie.price && (
            <View style={styles.purchaseInfo}>
              <Text style={styles.purchaseInfoTitle}>Premium Access Required</Text>
              <Text style={styles.purchaseInfoPrice}>${movie.price.toFixed(2)}</Text>
              <Text style={styles.purchaseInfoText}>
                Get lifetime access to ALL premium content with a one-time payment. Watch anytime, anywhere.
              </Text>
              <TouchableOpacity style={styles.purchaseButton} onPress={handleGetAccess}>
                <IconSymbol
                  ios_icon_name="lock.open.fill"
                  android_material_icon_name="lock_open"
                  size={20}
                  color={colors.text}
                />
                <Text style={styles.purchaseButtonText}>Get Premium Access</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Buttons - Only show if has access and not YouTube */}
        {hasAccess && !movie.youtubeId && (
          <>
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleSpeedChange}>
                <IconSymbol
                  ios_icon_name="gauge"
                  android_material_icon_name="speed"
                  size={24}
                  color={colors.text}
                />
                <Text style={styles.actionButtonText}>Speed: {playbackSpeed}x</Text>
              </TouchableOpacity>
            </View>

            {/* Additional Controls */}
            <View style={styles.additionalControls}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleSkipBackward}
              >
                <IconSymbol
                  ios_icon_name="gobackward.10"
                  android_material_icon_name="replay_10"
                  size={28}
                  color={colors.text}
                />
                <Text style={styles.controlButtonText}>-10s</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handlePlayPause}
              >
                <IconSymbol
                  ios_icon_name={isPlaying ? 'pause.fill' : 'play.fill'}
                  android_material_icon_name={isPlaying ? 'pause' : 'play_arrow'}
                  size={28}
                  color={colors.text}
                />
                <Text style={styles.controlButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleSkipForward}
              >
                <IconSymbol
                  ios_icon_name="goforward.10"
                  android_material_icon_name="forward_10"
                  size={28}
                  color={colors.text}
                />
                <Text style={styles.controlButtonText}>+10s</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* YouTube Video Info */}
        {movie.youtubeId && (
          <View style={styles.youtubeInfo}>
            <IconSymbol
              ios_icon_name="play.rectangle.fill"
              android_material_icon_name="smart_display"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.youtubeInfoText}>
              This is a YouTube video. Use the YouTube player controls to play, pause, and adjust settings.
            </Text>
          </View>
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
    paddingBottom: 40,
  },
  backButtonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  backButtonTopText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 20,
  },
  lockText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  lockSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 24,
  },
  unlockButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    padding: 20,
  },
  infoContainer: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  freeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.background,
  },
  ownedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  ownedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background,
  },
  uploadDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  purchaseInfo: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: 8,
  },
  purchaseInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  purchaseInfoPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  purchaseInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  controlButton: {
    alignItems: 'center',
    gap: 4,
  },
  controlButtonText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  youtubeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  youtubeInfoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
