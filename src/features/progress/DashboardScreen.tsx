/**
 * Learning Module SDK - DashboardScreen (Home Tab)
 */

import React, { useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Loader } from '@shared/components/Loader/Loader';
import { ErrorState } from '@shared/components/ErrorState/ErrorState';
import { ProgressBar } from '@shared/components/ProgressBar/ProgressBar';
import { useGetModulesQuery } from '@data/datasources/moduleApi';
import { useAppDispatch } from '@app/store';
import { setModules, setSelectedModule } from '@app/store/slices/moduleSlice';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';
import type { DashboardScreenProps } from '@shared/types/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { data: modules, isLoading, error, refetch } = useGetModulesQuery();

  useEffect(() => {
    if (modules) {
      dispatch(setModules(modules));
    }
  }, [modules, dispatch]);

  const handleModulePress = (moduleId: string) => {
    const module = modules?.find((m) => m.id === moduleId);
    if (module) {
      dispatch(setSelectedModule(module));
      navigation.navigate('ModuleDetail', { moduleId });
    }
  };

  const { completedCount, overallProgress, inProgressModule, testsCompleted, avgScore } = useMemo(() => {
    if (!modules || modules.length === 0) {
      return { completedCount: 0, overallProgress: 0, inProgressModule: null, testsCompleted: 0, avgScore: 0 };
    }
    const completed = modules.filter((m) => m.isCompleted).length;
    const progress =
      modules.reduce((sum, m) => sum + m.completionPercentage, 0) / modules.length;
    const inProgress = modules.find((m) => !m.isCompleted && !m.isLocked && m.completionPercentage > 0);

    return {
      completedCount: completed,
      overallProgress: progress,
      inProgressModule: inProgress || modules.find((m) => !m.isLocked && !m.isCompleted) || null,
      testsCompleted: 0,
      avgScore: 67,
    };
  }, [modules]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading) {
    return <Loader message="Loading modules..." />;
  }

  if (error) {
    return (
      <ErrorState
        type="server"
        message="Failed to load modules."
        onRetry={refetch}
      />
    );
  }

  const recommendedModules = modules?.filter((m) => !m.isCompleted && !m.isLocked) || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Header */}
        <View style={styles.greetingRow}>
          <View style={styles.greetingTextContainer}>
            <Text style={styles.greetingText}>
              👋 {getGreeting()}, Learner
            </Text>
            <Text style={styles.greetingSubtext}>
              Keep learning. You're {Math.round(overallProgress)}% through!
            </Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        </View>

        {/* Hero Card - Current Module */}
        {inProgressModule && (
          <TouchableOpacity
            style={styles.heroCard}
            activeOpacity={0.9}
            onPress={() => handleModulePress(inProgressModule.id)}
          >
            <View style={styles.heroGradient}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>In Progress</Text>
              </View>
              <Text style={styles.heroTitle}>{inProgressModule.title}</Text>
              <Text style={styles.heroMeta}>
                {inProgressModule.duration} • Module
              </Text>
              <View style={styles.heroProgressRow}>
                <ProgressBar
                  percentage={inProgressModule.completionPercentage}
                  color="#FFFFFF"
                  trackColor="rgba(255,255,255,0.3)"
                  height={6}
                  style={styles.heroProgressBar}
                />
              </View>
              <View style={styles.heroContinueRow}>
                <View style={{flex: 1}} />
                <TouchableOpacity
                  style={styles.heroContinueButton}
                  onPress={() => handleModulePress(inProgressModule.id)}
                >
                  <Text style={styles.heroContinueText}>▶ Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakTitle}>1 Day Streak!</Text>
          <Text style={styles.streakSubtext}>You're on fire. Keep it up!</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statLabel}>MODULES</Text>
            <Text style={styles.statValue}>{modules?.length || 0}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>📝</Text>
            <Text style={styles.statLabel}>TESTS</Text>
            <Text style={styles.statValue}>{testsCompleted}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statLabel}>AVG SCORE</Text>
            <Text style={styles.statValue}>{avgScore}%</Text>
          </View>
        </View>

        {/* Recommended Next */}
        {recommendedModules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Next</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedScroll}
            >
              {recommendedModules.map((mod) => (
                <TouchableOpacity
                  key={mod.id}
                  style={styles.recommendedCard}
                  activeOpacity={0.8}
                  onPress={() => handleModulePress(mod.id)}
                >
                  <View style={styles.recommendedImagePlaceholder}>
                    <Text style={styles.recommendedImageEmoji}>💻</Text>
                  </View>
                  <View style={styles.recommendedInfo}>
                    <Text style={styles.recommendedTitle} numberOfLines={2}>
                      {mod.title}
                    </Text>
                    <Text style={styles.recommendedMeta}>
                      ⏱ {mod.duration}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityIcon}>📖</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Started React Native Fundamentals</Text>
              <Text style={styles.activityTime}>Today</Text>
            </View>
          </View>
          <View style={styles.activityCard}>
            <Text style={styles.activityIcon}>✅</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Completed "What is React Native?"</Text>
              <Text style={styles.activityTime}>Today</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Greeting
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  greetingTextContainer: {
    flex: 1,
  },
  greetingText: {
    ...typography.h2,
    color: colors.textMain,
  },
  greetingSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
  },
  // Hero Card
  heroCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroGradient: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    paddingBottom: spacing.base,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  heroBadgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  heroTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroMeta: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.md,
  },
  heroProgressRow: {
    marginBottom: spacing.sm,
  },
  heroProgressBar: {
    flex: 1,
  },
  heroContinueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroContinueButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  heroContinueText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  // Streak Card
  streakCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  streakTitle: {
    ...typography.h3,
    color: '#D97706',
    marginBottom: 4,
  },
  streakSubtext: {
    ...typography.body,
    color: '#92400E',
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.base,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    ...typography.h2,
    color: colors.textMain,
  },
  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textMain,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  // Recommended
  recommendedScroll: {
    paddingHorizontal: spacing.base,
    gap: 12,
  },
  recommendedCard: {
    width: SCREEN_WIDTH * 0.55,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  recommendedImagePlaceholder: {
    height: 100,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedImageEmoji: {
    fontSize: 36,
  },
  recommendedInfo: {
    padding: 12,
  },
  recommendedTitle: {
    ...typography.bodyMedium,
    color: colors.textMain,
    marginBottom: 4,
  },
  recommendedMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  // Activity
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.base,
    marginBottom: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.base,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body,
    color: colors.textMain,
  },
  activityTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
