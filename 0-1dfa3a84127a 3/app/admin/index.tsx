
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { signIn, signOut, getCurrentUser, AuthUser } from '@/utils/supabaseAuth';
import { supabase } from '@/app/integrations/supabase/client';

interface MovieData {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  category: string;
  is_free: boolean;
  youtube_id: string | null;
  price: string | null;
  is_new: boolean;
  is_premium: boolean;
}

export default function AdminScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showEditList, setShowEditList] = useState(true);
  const [existingMovies, setExistingMovies] = useState<MovieData[]>([]);
  const [editingMovie, setEditingMovie] = useState<MovieData | null>(null);

  // Upload/Edit form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState<'movie' | 'project' | 'music-video'>('movie');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [youtubeId, setYoutubeId] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadExistingMovies();
    }
  }, [isLoggedIn]);

  const checkAuth = async () => {
    const user = await getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
  };

  const loadExistingMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading movies:', error);
        return;
      }

      setExistingMovies(data || []);
    } catch (error) {
      console.error('Error loading movies:', error);
    }
  };

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success && result.user) {
      setCurrentUser(result.user);
      setIsLoggedIn(true);
      Alert.alert('Success', 'Welcome, Admin! 🌿');
    } else {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
    }
  }, [email, password]);

  const handleEditMovie = (movie: MovieData) => {
    setEditingMovie(movie);
    setTitle(movie.title);
    setDescription(movie.description);
    setVideoUrl(movie.video_url);
    setThumbnailUrl(movie.thumbnail_url);
    setDuration(movie.duration.toString());
    setCategory(movie.category as 'movie' | 'project' | 'music-video');
    setPrice(movie.price || '');
    setIsFree(movie.is_free);
    setYoutubeId(movie.youtube_id || '');
    setShowUploadForm(true);
    setShowEditList(false);
  };

  const handleCancelEdit = () => {
    setEditingMovie(null);
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setThumbnailUrl('');
    setDuration('');
    setCategory('movie');
    setPrice('');
    setIsFree(false);
    setYoutubeId('');
    setShowUploadForm(false);
    setShowEditList(true);
  };

  const handleDeleteMovie = async (movieId: string, movieTitle: string) => {
    Alert.alert(
      'Delete Content',
      `Are you sure you want to delete "${movieTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('movies')
                .delete()
                .eq('id', movieId);

              if (error) {
                console.error('Delete error:', error);
                Alert.alert('Error', `Failed to delete: ${error.message}`);
              } else {
                Alert.alert('Success', 'Content deleted successfully!');
                loadExistingMovies();
              }
            } catch (error) {
              console.error('Delete exception:', error);
              Alert.alert('Error', 'Failed to delete content. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleUpload = useCallback(async () => {
    if (!title || !description || !thumbnailUrl || !duration) {
      Alert.alert('Error', 'Please fill in all required fields (title, description, thumbnail, duration)');
      return;
    }

    if (!videoUrl && !youtubeId) {
      Alert.alert('Error', 'Please provide either a Video URL or YouTube Video ID');
      return;
    }

    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('Error', 'Duration must be a positive number (in seconds)');
      return;
    }

    const priceNum = price ? parseFloat(price) : 0;
    if (price && (isNaN(priceNum) || priceNum < 0)) {
      Alert.alert('Error', 'Price must be a valid number');
      return;
    }

    const finalPrice = isFree ? 0 : priceNum;

    const actionText = editingMovie ? 'Update' : 'Upload';
    Alert.alert(
      `${actionText} Content`,
      `Are you sure you want to ${actionText.toLowerCase()} "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText,
          onPress: async () => {
            setLoading(true);
            try {
              console.log(`${actionText}ing movie to database:`, title);
              
              const finalVideoUrl = youtubeId 
                ? `https://www.youtube.com/watch?v=${youtubeId}`
                : videoUrl;

              const movieData = {
                title,
                description,
                video_url: finalVideoUrl,
                thumbnail_url: thumbnailUrl,
                duration: durationNum,
                category,
                is_free: isFree,
                youtube_id: youtubeId || null,
                price: finalPrice,
                is_new: editingMovie ? editingMovie.is_new : true,
                is_premium: !isFree,
                updated_at: new Date().toISOString(),
              };

              let error;
              if (editingMovie) {
                // Update existing movie
                const result = await supabase
                  .from('movies')
                  .update(movieData)
                  .eq('id', editingMovie.id);
                error = result.error;
              } else {
                // Insert new movie
                const result = await supabase
                  .from('movies')
                  .insert(movieData);
                error = result.error;
              }

              if (error) {
                console.error(`${actionText} error:`, error);
                Alert.alert('Error', `Failed to ${actionText.toLowerCase()}: ${error.message}`);
              } else {
                Alert.alert('Success', `Content ${actionText.toLowerCase()}ed successfully! 🎉`);
                handleCancelEdit();
                loadExistingMovies();
              }
            } catch (error) {
              console.error(`${actionText} exception:`, error);
              Alert.alert('Error', `Failed to ${actionText.toLowerCase()} content. Please try again.`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [title, description, videoUrl, thumbnailUrl, duration, category, price, isFree, youtubeId, editingMovie]);

  const handleLogout = useCallback(async () => {
    const result = await signOut();
    if (result.success) {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setEmail('');
      setPassword('');
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow_back"
            size={24}
            color={colors.text}
          />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.loginScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoHeader}>
            <Image
              source={require('@/assets/images/41ef1326-753f-4d5c-8e07-37101b3799e0.jpeg')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.loginHeader}>
            <IconSymbol
              ios_icon_name="lock.shield.fill"
              android_material_icon_name="admin_panel_settings"
              size={64}
              color={colors.primary}
            />
            <Text style={styles.loginTitle}>Admin Portal</Text>
            <Text style={styles.loginSubtitle}>Secure access for content management</Text>
          </View>

          <View style={styles.loginForm}>
            <View style={styles.inputContainer}>
              <IconSymbol
                ios_icon_name="envelope.fill"
                android_material_icon_name="email"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Admin Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <IconSymbol
                ios_icon_name="lock.fill"
                android_material_icon_name="lock"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>Admin access only</Text>
              <Text style={styles.hintText}>Contact support for credentials</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow_back"
            size={24}
            color={colors.text}
          />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol
            ios_icon_name="rectangle.portrait.and.arrow.right"
            android_material_icon_name="logout"
            size={20}
            color={colors.text}
          />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoHeaderSmall}>
          <Image
            source={require('@/assets/images/41ef1326-753f-4d5c-8e07-37101b3799e0.jpeg')}
            style={styles.logoImageSmall}
            resizeMode="contain"
          />
        </View>

        <View style={styles.uploadHeader}>
          <IconSymbol
            ios_icon_name="square.and.arrow.up.fill"
            android_material_icon_name="upload"
            size={48}
            color={colors.primary}
          />
          <Text style={styles.uploadTitle}>Content Management</Text>
          <Text style={styles.uploadSubtitle}>Upload new content or edit existing</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, showEditList && styles.actionButtonActive]}
            onPress={() => {
              setShowEditList(true);
              setShowUploadForm(false);
              handleCancelEdit();
            }}
          >
            <IconSymbol
              ios_icon_name="list.bullet"
              android_material_icon_name="list"
              size={20}
              color={colors.text}
            />
            <Text style={styles.actionButtonText}>Edit Content</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, showUploadForm && !editingMovie && styles.actionButtonActive]}
            onPress={() => {
              setShowUploadForm(true);
              setShowEditList(false);
              handleCancelEdit();
            }}
          >
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add_circle"
              size={20}
              color={colors.text}
            />
            <Text style={styles.actionButtonText}>Upload New</Text>
          </TouchableOpacity>
        </View>

        {/* Edit List */}
        {showEditList && (
          <View style={styles.editListContainer}>
            <Text style={styles.sectionTitle}>Existing Content ({existingMovies.length})</Text>
            {existingMovies.map((movie, index) => (
              <View key={index} style={styles.movieItem}>
                <View style={styles.movieItemHeader}>
                  <Text style={styles.movieItemTitle}>{movie.title}</Text>
                  <View style={styles.movieItemBadges}>
                    {movie.is_free ? (
                      <View style={styles.freeBadgeSmall}>
                        <Text style={styles.badgeTextSmall}>FREE</Text>
                      </View>
                    ) : (
                      <View style={styles.premiumBadgeSmall}>
                        <Text style={styles.badgeTextSmall}>PREMIUM</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.movieItemCategory}>{movie.category.toUpperCase()}</Text>
                <View style={styles.movieItemActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditMovie(movie)}
                  >
                    <IconSymbol
                      ios_icon_name="pencil"
                      android_material_icon_name="edit"
                      size={16}
                      color={colors.text}
                    />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteMovie(movie.id, movie.title)}
                  >
                    <IconSymbol
                      ios_icon_name="trash.fill"
                      android_material_icon_name="delete"
                      size={16}
                      color={colors.text}
                    />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Upload/Edit Form */}
        {showUploadForm && (
          <View style={styles.form}>
            {editingMovie && (
              <View style={styles.editingBanner}>
                <IconSymbol
                  ios_icon_name="pencil.circle.fill"
                  android_material_icon_name="edit"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.editingBannerText}>Editing: {editingMovie.title}</Text>
                <TouchableOpacity onPress={handleCancelEdit}>
                  <IconSymbol
                    ios_icon_name="xmark.circle.fill"
                    android_material_icon_name="cancel"
                    size={24}
                    color={colors.accent}
                  />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter content title"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Enter content description"
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>YouTube Video ID (for YouTube videos)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., dQw4w9WgXcQ"
                placeholderTextColor={colors.textSecondary}
                value={youtubeId}
                onChangeText={setYoutubeId}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Video URL (for non-YouTube videos)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://example.com/video.mp4"
                placeholderTextColor={colors.textSecondary}
                value={videoUrl}
                onChangeText={setVideoUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Thumbnail URL *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg"
                placeholderTextColor={colors.textSecondary}
                value={thumbnailUrl}
                onChangeText={setThumbnailUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Duration (seconds) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="180"
                placeholderTextColor={colors.textSecondary}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.categoryButtons}>
                <TouchableOpacity
                  style={[styles.categoryButton, category === 'movie' && styles.categoryButtonActive]}
                  onPress={() => setCategory('movie')}
                >
                  <Text style={[styles.categoryButtonText, category === 'movie' && styles.categoryButtonTextActive]}>
                    Movie
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.categoryButton, category === 'project' && styles.categoryButtonActive]}
                  onPress={() => setCategory('project')}
                >
                  <Text style={[styles.categoryButtonText, category === 'project' && styles.categoryButtonTextActive]}>
                    Project
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.categoryButton, category === 'music-video' && styles.categoryButtonActive]}
                  onPress={() => setCategory('music-video')}
                >
                  <Text style={[styles.categoryButtonText, category === 'music-video' && styles.categoryButtonTextActive]}>
                    Music Video
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setIsFree(!isFree)}
            >
              <View style={[styles.checkbox, isFree && styles.checkboxChecked]}>
                {isFree && (
                  <IconSymbol
                    ios_icon_name="checkmark"
                    android_material_icon_name="check"
                    size={16}
                    color={colors.text}
                  />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Make this content FREE</Text>
            </TouchableOpacity>

            {!isFree && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Price (USD)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="19.99"
                  placeholderTextColor={colors.textSecondary}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.helperText}>
                  This is for display only. All premium content uses the same payment link.
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.uploadButton, loading && styles.uploadButtonDisabled]} 
              onPress={handleUpload}
              disabled={loading}
            >
              <IconSymbol
                ios_icon_name={editingMovie ? "checkmark.circle.fill" : "square.and.arrow.up.fill"}
                android_material_icon_name={editingMovie ? "check_circle" : "upload"}
                size={24}
                color={colors.text}
              />
              <Text style={styles.uploadButtonText}>
                {loading ? (editingMovie ? 'Updating...' : 'Uploading...') : (editingMovie ? 'Update Content' : 'Upload Content')}
              </Text>
            </TouchableOpacity>

            {editingMovie && (
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  loginScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoHeader: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: '90%',
    height: '100%',
  },
  logoHeaderSmall: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImageSmall: {
    width: '80%',
    height: '100%',
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loginForm: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  hintContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  hintText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  uploadHeader: {
    alignItems: 'center',
    marginVertical: 24,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  actionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  editListContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  movieItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  movieItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  movieItemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  movieItemBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  freeBadgeSmall: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  premiumBadgeSmall: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeTextSmall: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
  },
  movieItemCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  movieItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    paddingVertical: 10,
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  form: {
    width: '100%',
  },
  editingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  editingBannerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.secondary,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryButtonTextActive: {
    color: colors.background,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.secondary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: colors.card,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
