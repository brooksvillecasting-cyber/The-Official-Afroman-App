
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface YouTubePlayerProps {
  videoId: string;
  style?: any;
}

export function YouTubePlayer({ videoId, style }: YouTubePlayerProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0`;

  return (
    <View style={[styles.container, style]}>
      <iframe
        src={embedUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
});
