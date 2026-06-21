/**
 * Learning Module SDK - AssessmentsDashboardScreen (Assessments Tab)
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';
import { useAppSelector } from '@app/store';
import { selectPastResults } from '@app/store/slices/assessmentSlice';

interface MockAssessmentEntry {
  id: string;
  title: string;
  duration: string;
  questionCount: number;
  moduleId: string;
  score?: number;
  passed?: boolean;
}

const MOCK_ASSESSMENTS: MockAssessmentEntry[] = [
  {
    id: 'assessment_2',
    title: 'Redux Toolkit Mastery - Final Exam',
    duration: '10 mins',
    questionCount: 3,
    moduleId: 'module_2',
    score: 67,
    passed: false,
  },
  {
    id: 'assessment_1',
    title: 'React Native Basics - Quiz 1',
    duration: '15 mins',
    questionCount: 5,
    moduleId: 'module_1',
    score: 90,
    passed: true,
  },
];

export const AssessmentsDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const pastResults = useAppSelector(selectPastResults);

  const getAssessmentStatus = (entry: MockAssessmentEntry) => {
    const result = pastResults[entry.id];
    if (result) {
      return { score: result.lastScore, passed: result.passed };
    }
    if (entry.score !== undefined) {
      return { score: entry.score, passed: entry.passed };
    }
    return null;
  };

  const handleViewResults = (entry: MockAssessmentEntry) => {
    const status = getAssessmentStatus(entry);
    if (status) {
      navigation.navigate('AssessmentResult', {
        assessmentId: entry.id,
        moduleId: entry.moduleId,
        score: status.score,
        passed: status.passed,
        minimumRequired: 75,
      });
    }
  };

  const handleStartAssessment = (entry: MockAssessmentEntry) => {
    navigation.navigate('Assessment', {
      assessmentId: entry.id,
      moduleId: entry.moduleId,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assessments</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            Complete module assessments to earn verified certificates.
          </Text>
        </View>

        {/* Assessment Cards */}
        {MOCK_ASSESSMENTS.map((entry) => {
          const status = getAssessmentStatus(entry);
          return (
            <View key={entry.id} style={styles.assessmentCard}>
              <Text style={styles.assessmentTitle}>{entry.title}</Text>
              <View style={styles.assessmentMetaRow}>
                <Text style={styles.assessmentMeta}>⏱ {entry.duration}</Text>
                <Text style={styles.assessmentMetaQ}>  ❓ {entry.questionCount} Questions</Text>
              </View>

              <View style={styles.assessmentStatusRow}>
                {status ? (
                  <>
                    <View style={[
                      styles.scoreBadge,
                      status.passed ? styles.scoreBadgePass : styles.scoreBadgeFail,
                    ]}>
                      <Text style={[
                        styles.scoreBadgeText,
                        status.passed ? styles.scoreBadgeTextPass : styles.scoreBadgeTextFail,
                      ]}>
                        Score: {status.score}% - {status.passed ? 'Passed' : 'Failed'}{' '}
                        {status.passed ? '✅' : '❌'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewResultsButton}
                      onPress={() => handleViewResults(entry)}
                    >
                      <Text style={styles.viewResultsText}>View Results</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => handleStartAssessment(entry)}
                  >
                    <Text style={styles.startButtonText}>Start Assessment</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
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
    paddingHorizontal: spacing.base,
    paddingBottom: 100,
  },
  // Info Banner
  infoBanner: {
    backgroundColor: '#EBF0FF',
    borderRadius: 12,
    padding: spacing.base,
    marginTop: spacing.base,
    marginBottom: spacing.lg,
  },
  infoBannerText: {
    ...typography.body,
    color: colors.primary,
  },
  // Assessment Card
  assessmentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.base,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  assessmentTitle: {
    ...typography.h3,
    color: colors.textMain,
    marginBottom: 6,
  },
  assessmentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  assessmentMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  assessmentMetaQ: {
    ...typography.caption,
    color: '#EF4444',
  },
  assessmentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
  },
  scoreBadgePass: {
    backgroundColor: '#F0FDF4',
  },
  scoreBadgeFail: {
    backgroundColor: '#FEF2F2',
  },
  scoreBadgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  scoreBadgeTextPass: {
    color: '#16A34A',
  },
  scoreBadgeTextFail: {
    color: '#DC2626',
  },
  viewResultsButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  viewResultsText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  startButtonText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
