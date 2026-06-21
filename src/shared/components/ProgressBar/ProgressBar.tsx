/**
 * Learning Module SDK - ProgressBar Component
 *
 * Height: 8px, Radius: 999px, Fill: #2563EB
 * Animated fill transition.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '@shared/theme/colors';
import { borderRadius, layout } from '@shared/theme/spacing';
import { ANIMATION_DURATION } from '@shared/utils';

export interface ProgressBarProps {
  percentage: number;
  color?: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color = colors.primary,
  trackColor = colors.primaryLight,
  height = layout.progressBarHeight,
  style,
  animated = true,
}) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: clampedPercentage,
        duration: ANIMATION_DURATION.MEDIUM,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(clampedPercentage);
    }
  }, [clampedPercentage, animated, animatedWidth]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[styles.track, { height, backgroundColor: trackColor }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: clampedPercentage,
      }}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: color,
            width: widthInterpolation,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: borderRadius.full,
  },
});
