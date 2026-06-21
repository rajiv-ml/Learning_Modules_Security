/**
 * Learning Module SDK - AssessmentResultScreen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@shared/components/Button/Button';
import { useCompleteModuleMutation } from '@data/datasources/progressApi';
import { useAppDispatch } from '@app/store';
import { markModuleCompleted } from '@app/store/slices/progressSlice';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';
import type { AssessmentResultScreenProps } from '@shared/types/navigation';

export const AssessmentResultScreen: React.FC<AssessmentResultScreenProps> = ({
  route,
  navigation,
}) => {
  const { score, passed, moduleId, minimumRequired } = route.params;
  const dispatch = useAppDispatch();
  const [completeModule, { isLoading }] = useCompleteModuleMutation();

  const handleContinue = async () => {
    if (passed) {
      try {
        const result = await completeModule({ moduleId }).unwrap();
        dispatch(markModuleCompleted(moduleId));
        
        if (result.nextModuleUnlocked || result.moduleCompleted) {
          // Can show module completion screen or just go back to dashboard
          navigation.replace('ModuleCompletion', { moduleId });
        } else {
          navigation.navigate('MainTabs');
        }
      } catch {
        // Just go back to dashboard if backend call fails to complete
        navigation.navigate('MainTabs');
      }
    } else {
      // Retry
      navigation.replace('Assessment', { assessmentId: route.params.assessmentId, moduleId });
    }
  };

  const handleClose = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            passed ? styles.iconSuccess : styles.iconFail,
          ]}
        >
          <Text style={styles.icon}>{passed ? '🏆' : '😔'}</Text>
        </View>

        <Text style={styles.title}>
          {passed ? 'Congratulations!' : 'Keep Learning!'}
        </Text>
        
        <Text style={styles.subtitle}>
          {passed
            ? 'You have successfully passed the assessment.'
            : 'You did not meet the minimum passing score.'}
        </Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Your Score</Text>
          <Text style={[styles.scoreValue, passed ? styles.textSuccess : styles.textFail]}>
            {score}%
          </Text>
          <Text style={styles.requirementText}>
            Passing Score: {minimumRequired}%
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={passed ? 'Continue to Next Module' : 'Retry Assessment'}
          onPress={handleContinue}
          variant={passed ? 'success' : 'primary'}
          loading={isLoading}
          style={styles.actionButton}
        />
        <Button
          title="Back to Dashboard"
          onPress={handleClose}
          variant="secondary"
          disabled={isLoading}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconSuccess: {
    backgroundColor: colors.successLight,
  },
  iconFail: {
    backgroundColor: colors.errorLight,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    ...typography.headingMedium,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  scoreCard: {
    width: '100%',
    padding: spacing.xl,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    alignItems: 'center',
  },
  scoreLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  scoreValue: {
    ...typography.headingLarge,
    fontSize: 48,
    lineHeight: 56,
    marginBottom: spacing.xs,
  },
  textSuccess: {
    color: colors.success,
  },
  textFail: {
    color: colors.error,
  },
  requirementText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  actionButton: {
    width: '100%',
  },
});
