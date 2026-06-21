/**
 * Learning Module SDK - ModuleDetailScreen
 */

import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { Header } from '@shared/components/Header/Header';
import { Loader } from '@shared/components/Loader/Loader';
import { ErrorState } from '@shared/components/ErrorState/ErrorState';
import { Button } from '@shared/components/Button/Button';
import { VideoListItem } from './components/VideoListItem';
import { useGetModuleDetailsQuery } from '@data/datasources/moduleApi';
import { useAppDispatch } from '@app/store';
import { setCurrentVideo } from '@app/store/slices/progressSlice';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';
import type { ModuleDetailScreenProps } from '@shared/types/navigation';

export const ModuleDetailScreen: React.FC<ModuleDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { moduleId } = route.params;
  const dispatch = useAppDispatch();
  const { data: moduleDetail, isLoading, error, refetch } = useGetModuleDetailsQuery(
    moduleId
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleVideoPress = (videoId: string) => {
    dispatch(setCurrentVideo({ moduleId, videoId }));
    navigation.navigate('VideoPlayer', { moduleId, videoId });
  };

  const handleAssessmentPress = () => {
    if (moduleDetail?.assessment) {
      navigation.navigate('Assessment', {
        moduleId,
        assessmentId: moduleDetail.assessment.id,
      });
    }
  };

  if (isLoading) {
    return <Loader message="Loading module details..." />;
  }

  if (error || !moduleDetail) {
    return (
      <ErrorState
        type="server"
        message="Failed to load module details."
        onRetry={refetch}
      />
    );
  }

  const allVideosCompleted = moduleDetail.videos.every((v) => v.isCompleted);
  const isAssessmentUnlocked = moduleDetail.assessment?.isUnlocked || allVideosCompleted;

  return (
    <View style={styles.container}>
      <Header title={moduleDetail.title} onBack={handleBack} />

      <FlatList
        data={moduleDetail.videos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <View style={styles.coverImage}>
              <Text style={styles.coverEmoji}>👨‍💻</Text>
            </View>
            <View style={styles.headerRow}>
              <Text style={styles.sectionTitle}>Course Content</Text>
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>
                  {Math.round(moduleDetail.completionPercentage)}% Completed
                </Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <VideoListItem video={item} index={index} onPress={handleVideoPress} />
        )}
        ListFooterComponent={
          <View style={styles.footerSection}>
            <View style={styles.assessmentCard}>
              <Text style={styles.assessmentIcon}>📝</Text>
              <Text style={styles.assessmentTitle}>Final Assessment</Text>
              <Text style={styles.assessmentDesc}>
                Pass the assessment to complete this module and earn your certificate. Minimum score: {moduleDetail.assessment?.passingPercentage}%
              </Text>
              <Button
                title={isAssessmentUnlocked ? 'Start Assessment' : 'Locked'}
                onPress={handleAssessmentPress}
                disabled={!isAssessmentUnlocked}
                style={styles.assessmentButton}
              />
            </View>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  headerSection: {
    marginBottom: spacing.lg,
  },
  coverImage: {
    height: 180,
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  coverEmoji: {
    fontSize: 64,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textMain,
  },
  progressBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  footerSection: {
    marginTop: spacing.xl,
  },
  assessmentCard: {
    backgroundColor: '#E8EDFB',
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1DBF6',
  },
  assessmentIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  assessmentTitle: {
    ...typography.h3,
    color: colors.textMain,
    marginBottom: spacing.sm,
  },
  assessmentDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  assessmentButton: {
    width: '100%',
  },
});
