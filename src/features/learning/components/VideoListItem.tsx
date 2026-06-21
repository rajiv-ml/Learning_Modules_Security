/**
 * Learning Module SDK - VideoListItem
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProgressBar } from '@shared/components/ProgressBar/ProgressBar';
import type { VideoLesson } from '@shared/types/module';
import { colors } from '@shared/theme/colors';
import { spacing, borderRadius } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';

export interface VideoListItemProps {
  video: VideoLesson;
  index: number;
  onPress: (videoId: string) => void;
}

export const VideoListItem: React.FC<VideoListItemProps> = ({
  video,
  index,
  onPress,
}) => {
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(video.id)}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={styles.thumbnailContainer}>
        {/* Placeholder for thumbnail */}
        <View style={styles.thumbnailPlaceholder}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {index + 1}. {video.title}
        </Text>
        <View style={styles.progressRow}>
          <ProgressBar
            percentage={video.watchedPercentage}
            color={video.isCompleted ? colors.success : colors.primary}
            style={styles.progress}
            height={4}
          />
          {video.isCompleted && <Text style={styles.completedIcon}>✅</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  thumbnailContainer: {
    width: 80,
    height: 60,
    borderRadius: borderRadius.small,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
    position: 'relative',
    marginRight: spacing.md,
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 24,
    color: '#FFF',
    opacity: 0.8,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    ...typography.caption,
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.bodyMedium,
    color: colors.textMain,
    marginBottom: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progress: {
    flex: 1,
    marginRight: spacing.md,
  },
  completedIcon: {
    fontSize: 14,
  },
});
