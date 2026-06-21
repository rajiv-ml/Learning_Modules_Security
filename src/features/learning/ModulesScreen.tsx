/**
 * Learning Module SDK - ModulesScreen (Modules Tab)
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Loader } from '@shared/components/Loader/Loader';
import { ErrorState } from '@shared/components/ErrorState/ErrorState';
import { ProgressBar } from '@shared/components/ProgressBar/ProgressBar';
import { useGetModulesQuery } from '@data/datasources/moduleApi';
import { useAppDispatch } from '@app/store';
import { setSelectedModule } from '@app/store/slices/moduleSlice';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { typography } from '@shared/theme/typography';

const CATEGORIES = ['All', 'Mobile', 'Frontend', 'Backend', 'Cloud'];

export const ModulesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { data: modules, isLoading, error, refetch } = useGetModulesQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredModules = useMemo(() => {
    if (!modules) return [];
    let filtered = modules;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    return filtered;
  }, [modules, searchQuery, selectedCategory]);

  const handleModulePress = (moduleId: string) => {
    const module = modules?.find((m) => m.id === moduleId);
    if (module && !module.isLocked) {
      dispatch(setSelectedModule(module));
      navigation.navigate('ModuleDetail', { moduleId });
    }
  };

  if (isLoading) return <Loader message="Loading modules..." />;
  if (error) return <ErrorState type="server" message="Failed to load modules." onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search modules..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScrollView}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              selectedCategory === cat && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.categoryChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Module Cards */}
      <ScrollView
        style={styles.modulesList}
        contentContainerStyle={styles.modulesContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredModules.map((mod) => (
          <TouchableOpacity
            key={mod.id}
            style={[styles.moduleCard, mod.isLocked && styles.moduleCardLocked]}
            activeOpacity={mod.isLocked ? 1 : 0.8}
            onPress={() => handleModulePress(mod.id)}
          >
            {/* Thumbnail */}
            <View style={[styles.moduleImage, mod.isLocked && styles.moduleImageLocked]}>
              <Text style={styles.moduleImageEmoji}>
                {mod.isLocked ? '🔒' : '💻'}
              </Text>
            </View>

            {/* Info */}
            <View style={styles.moduleInfo}>
              <Text style={[styles.moduleTitle, mod.isLocked && styles.moduleTextLocked]} numberOfLines={2}>
                {mod.title}
              </Text>
              <View style={styles.moduleMetaRow}>
                <Text style={styles.moduleMeta}>📖 {mod.lessonsCount} Lessons</Text>
                <Text style={styles.moduleMeta}>  ⏱ {mod.duration}</Text>
                <Text style={styles.moduleMeta}>  📊 {mod.difficulty}</Text>
              </View>

              {/* Progress */}
              <View style={styles.moduleProgressRow}>
                <Text style={styles.moduleProgressLabel}>Progress</Text>
                <Text style={[
                  styles.moduleProgressValue,
                  mod.completionPercentage > 0 && styles.moduleProgressValueActive,
                ]}>
                  {mod.completionPercentage}%
                </Text>
              </View>
              <ProgressBar
                percentage={mod.completionPercentage}
                color={mod.isCompleted ? colors.success : colors.primary}
                trackColor={mod.isLocked ? colors.border : '#E8EDFB'}
                height={6}
              />
            </View>
          </TouchableOpacity>
        ))}

        {filteredModules.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No modules found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.base,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textMain,
    padding: 0,
  },
  // Categories
  categoryScrollView: {
    flexGrow: 0,
  },
  categoryScroll: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    alignItems: 'center',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    ...typography.bodyMedium,
    color: colors.textMain,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  // Modules List
  modulesList: {
    flex: 1,
  },
  modulesContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: 100,
  },
  moduleCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.base,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  moduleCardLocked: {
    opacity: 0.6,
  },
  moduleImage: {
    height: 160,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleImageLocked: {
    backgroundColor: '#94A3B8',
  },
  moduleImageEmoji: {
    fontSize: 48,
  },
  moduleInfo: {
    padding: spacing.base,
  },
  moduleTitle: {
    ...typography.h3,
    color: colors.textMain,
    marginBottom: 8,
  },
  moduleTextLocked: {
    color: colors.textDisabled,
  },
  moduleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  moduleProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  moduleProgressLabel: {
    ...typography.bodyMedium,
    color: colors.textMain,
  },
  moduleProgressValue: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  moduleProgressValueActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
