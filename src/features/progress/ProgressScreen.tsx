import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from '@shared/components/ProgressBar/ProgressBar';
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
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header Background */}
      <View style={styles.headerBackground}>
        <View style={styles.headerGlow} />
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerSafeArea}>
          <Text style={styles.headerTitle}>Your Progress</Text>
          <Text style={styles.headerSubtitle}>Track your learning analytics and skills.</Text>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Learning Journey Card */}
        <View style={styles.journeyCard}>
          <View style={styles.journeyGlow} />
          <View style={styles.journeyContent}>
            <Text style={styles.journeyLabel}>Learning Journey</Text>
            <View style={styles.journeyMainRow}>
              <Text style={styles.journeyPercentage}>72%</Text>
              <Text style={styles.journeySubLabel}>Overall Completed</Text>
            </View>
            <ProgressBar
              percentage={72}
              color="#60A5FA"
              trackColor="rgba(255,255,255,0.1)"
              height={8}
              style={styles.journeyProgress}
            />
            <View style={styles.journeyFooter}>
              <View style={styles.journeyFooterBadge}>
                <Text style={styles.journeyFooterIcon}>⏱</Text>
              </View>
              <Text style={styles.journeyFooterText}>
                {totalHours.toFixed(1)} hours learned this week
              </Text>
            </View>
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
                          backgroundColor: item.hours > 0 ? '#3B82F6' : 'transparent',
                        },
                      ]}
                    />
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
              <View style={styles.skillInfo}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={[
                  styles.skillPercent,
                  skill.progress >= 75 && styles.skillPercentHigh,
                ]}>
                  {skill.progress}%
                </Text>
              </View>
              <ProgressBar
                percentage={skill.progress}
                color={skill.progress >= 75 ? '#10B981' : '#3B82F6'}
                trackColor="#F1F5F9"
                height={8}
              />
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
    backgroundColor: '#F8FAFC',
  },
  headerBackground: {
    backgroundColor: '#0F172A',
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 10,
    elevation: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  headerGlow: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
  },
  headerSafeArea: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerTitle: {
    ...typography.h1,
    color: '#FFFFFF',
    fontSize: 28,
    marginBottom: 8,
  },
  headerSubtitle: {
    ...typography.body,
    color: '#94A3B8',
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  // Journey Card
  journeyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  journeyGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  journeyContent: {
    padding: 24,
  },
  journeyLabel: {
    ...typography.bodyMedium,
    color: '#94A3B8',
    marginBottom: 8,
  },
  journeyMainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
    gap: 8,
  },
  journeyPercentage: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  journeySubLabel: {
    ...typography.bodyMedium,
    color: '#CBD5E1',
  },
  journeyProgress: {
    marginBottom: 20,
  },
  journeyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  journeyFooterBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  journeyFooterIcon: {
    fontSize: 16,
  },
  journeyFooterText: {
    ...typography.caption,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  // Section Card
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionTitle: {
    ...typography.h3,
    color: '#1E293B',
    fontSize: 20,
    marginBottom: 24,
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
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
    height: 16,
  },
  chartBarTrack: {
    width: 16,
    height: MAX_BAR_HEIGHT,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: 16,
    borderRadius: 8,
  },
  chartDayLabel: {
    ...typography.caption,
    color: '#64748B',
    marginTop: 12,
    fontWeight: '500',
  },
  // Skills
  skillRow: {
    marginBottom: 20,
  },
  skillInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    ...typography.bodyMedium,
    color: '#1E293B',
    fontWeight: '600',
  },
  skillPercent: {
    ...typography.bodyMedium,
    color: '#64748B',
    fontWeight: '600',
  },
  skillPercentHigh: {
    color: '#10B981',
  },
});
