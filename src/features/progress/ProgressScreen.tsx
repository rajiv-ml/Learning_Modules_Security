/**
 * Learning Module SDK - ProgressScreen (Analytics Tab)
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  StatusBar,
} from 'react-native';
import { ProgressBar } from '@shared/components/ProgressBar/ProgressBar';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';

const WEEKLY_DATA = [
  { day: 'Mon', hours: 1.5 },
  { day: 'Tue', hours: 2 },
  { day: 'Wed', hours: 0.5 },
  { day: 'Thu', hours: 3 },
  { day: 'Fri', hours: 1 },
  { day: 'Sat', hours: 0 },
  { day: 'Sun', hours: 0.5 },
];

const SKILLS = [
  { name: 'React Native', progress: 90 },
  { name: 'Redux', progress: 75 },
  { name: 'TypeScript', progress: 60 },
  { name: 'Testing', progress: 40 },
];

const MAX_BAR_HEIGHT = 120;

export const ProgressScreen: React.FC = () => {
  const maxHours = Math.max(...WEEKLY_DATA.map((d) => d.hours), 1);
  const totalHours = WEEKLY_DATA.reduce((sum, d) => sum + d.hours, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Learning Journey Card */}
        <View style={styles.journeyCard}>
          <Text style={styles.journeyLabel}>Learning Journey</Text>
          <View style={styles.journeyMainRow}>
            <Text style={styles.journeyPercentage}>72%</Text>
            <Text style={styles.journeySubLabel}>Overall Completed</Text>
          </View>
          <ProgressBar
            percentage={72}
            color="#FFFFFF"
            trackColor="rgba(255,255,255,0.3)"
            height={8}
            style={styles.journeyProgress}
          />
          <View style={styles.journeyFooter}>
            <Text style={styles.journeyFooterIcon}>⏱</Text>
            <Text style={styles.journeyFooterText}>
              {totalHours.toFixed(1)} hours learned this week
            </Text>
          </View>
        </View>

        {/* Weekly Activity */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <View style={styles.chartContainer}>
            {WEEKLY_DATA.map((item, index) => {
              const barHeight = item.hours > 0
                ? Math.max((item.hours / maxHours) * MAX_BAR_HEIGHT, 8)
                : 0;
              return (
                <View key={index} style={styles.chartBarWrapper}>
                  <Text style={styles.chartBarLabel}>
                    {item.hours > 0 ? item.hours : ''}
                  </Text>
                  <View style={styles.chartBarTrack}>
                    <View
                      style={[
                        styles.chartBarFill,
                        {
                          height: barHeight,
                          backgroundColor: item.hours > 0 ? colors.primary : 'transparent',
                        },
                      ]}
                    />
                    {/* Dot on top */}
                    {item.hours > 0 && (
                      <View style={styles.chartBarDot} />
                    )}
                  </View>
                  <Text style={styles.chartDayLabel}>{item.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Skill Growth */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Skill Growth</Text>
          {SKILLS.map((skill) => (
            <View key={skill.name} style={styles.skillRow}>
              <Text style={styles.skillName}>{skill.name}</Text>
              <View style={styles.skillBarContainer}>
                <ProgressBar
                  percentage={skill.progress}
                  color={colors.primary}
                  trackColor="#E8EDFB"
                  height={8}
                />
              </View>
              <Text style={[
                styles.skillPercent,
                skill.progress >= 75 && styles.skillPercentHigh,
              ]}>
                {skill.progress}%
              </Text>
            </View>
          ))}
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
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textMain,
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: 100,
  },
  // Journey Card
  journeyCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.base,
  },
  journeyLabel: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  journeyMainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
    gap: 8,
  },
  journeyPercentage: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  journeySubLabel: {
    ...typography.bodyMedium,
    color: 'rgba(255,255,255,0.9)',
  },
  journeyProgress: {
    marginBottom: spacing.md,
  },
  journeyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  journeyFooterIcon: {
    fontSize: 16,
  },
  journeyFooterText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
  },
  // Section Card
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.base,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textMain,
    marginBottom: spacing.lg,
  },
  // Chart
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: MAX_BAR_HEIGHT + 50,
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
    height: 16,
  },
  chartBarTrack: {
    width: 24,
    height: MAX_BAR_HEIGHT,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'visible',
  },
  chartBarFill: {
    width: 24,
    borderRadius: 12,
  },
  chartBarDot: {
    position: 'absolute',
    top: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  chartDayLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 8,
  },
  // Skills
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skillName: {
    ...typography.bodyMedium,
    color: colors.textMain,
    width: 100,
  },
  skillBarContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  skillPercent: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    width: 40,
    textAlign: 'right',
  },
  skillPercentHigh: {
    color: colors.primary,
    fontWeight: '700',
  },
});
