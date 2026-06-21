/**
 * Learning Module SDK - VideoPlayerScreen
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, AppState } from 'react-native';
import Video from 'react-native-video';
import type { OnProgressData } from 'react-native-video';
import { Header } from '@shared/components/Header/Header';
import { useGetModuleDetailsQuery } from '@data/datasources/moduleApi';
import { useUpdateVideoProgressMutation } from '@data/datasources/progressApi';
import { useAppDispatch } from '@app/store';
import { updateProgress, markLessonCompleted, resetLessonProgress } from '@app/store/slices/progressSlice';
import { VIDEO_COMPLETION_THRESHOLD, PROGRESS_MILESTONES } from '@shared/utils';
import { colors } from '@shared/theme/colors';
import { layout } from '@shared/theme/spacing';
import type { VideoPlayerScreenProps } from '@shared/types/navigation';
import { Loader } from '@shared/components/Loader/Loader';
import { ErrorState } from '@shared/components/ErrorState/ErrorState';

export const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({
  route,
  navigation,
}) => {
  const { moduleId, videoId } = route.params;
  const dispatch = useAppDispatch();
  const videoRef = useRef<any>(null);
  
  const [updateProgressMutation] = useUpdateVideoProgressMutation();
  const { data: moduleDetail, isLoading, error } = useGetModuleDetailsQuery(moduleId);
  
  const [lastMilestone, setLastMilestone] = useState(0);
  const maxWatchedPosition = useRef<number>(0);

  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const videoData = moduleDetail?.videos?.find((v) => v.id === videoId);

  // Unmount penalty logic
  useEffect(() => {
    return () => {
      // If component unmounts and video wasn't completed
      if (!isCompleted && maxWatchedPosition.current > 0) {
        dispatch(resetLessonProgress({ moduleId, videoId }));
      }
    };
  }, [isCompleted, moduleId, videoId, dispatch]);

  const handleBack = () => {
    navigation.goBack();
  };

  const togglePlayPause = () => {
    setIsPaused(!isPaused);
  };

  const onProgress = (data: OnProgressData) => {
    if (!data.seekableDuration || data.seekableDuration === 0) return;
    
    const currentTime = data.currentTime;
    
    // Check if the user skipped ahead (tolerance of 3 seconds for regular progress intervals)
    if (currentTime > maxWatchedPosition.current + 3) {
      // User skipped! Revert video back to maxWatchedPosition
      if (videoRef.current) {
        videoRef.current.seek(maxWatchedPosition.current);
      }
      return; // Do not update progress
    }
    
    // Update maxWatchedPosition
    if (currentTime > maxWatchedPosition.current) {
      maxWatchedPosition.current = currentTime;
    }

    const percentage = (maxWatchedPosition.current / data.seekableDuration) * 100;
    dispatch(updateProgress(percentage));

    // Find if we crossed a new milestone (10, 20, 30...)
    const currentMilestone = PROGRESS_MILESTONES.slice().reverse().find((m) => percentage >= m) || 0;
    
    if (currentMilestone > lastMilestone) {
      setLastMilestone(currentMilestone);
      // Sync progress to backend
      updateProgressMutation({
        moduleId,
        videoId,
        watchedPercentage: currentMilestone,
      }).catch(err => console.warn('Failed to sync progress', err));
    }

    if (percentage >= VIDEO_COMPLETION_THRESHOLD) {
      setIsCompleted(true);
      dispatch(markLessonCompleted({
        lessonId: videoId,
        moduleId,
        title: videoData?.title || 'Video'
      }));
    }
  };

  if (isLoading) {
    return <Loader message="Loading video..." />;
  }

  if (error || !videoData) {
    return <ErrorState message="Failed to load video" onRetry={handleBack} retryLabel="Go Back" />;
  }

  return (
    <View style={styles.container}>
      <Header title={videoData.title} onBack={handleBack} />
      
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={require('../../assets/video/sample.mp4')}
          style={styles.video}
          controls={false}
          paused={isPaused}
          resizeMode="contain"
          onProgress={onProgress}
          progressUpdateInterval={1000}
          ignoreSilentSwitch="ignore"
        />
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause}>
            <Text style={styles.playPauseText}>{isPaused ? '▶ Play' : '⏸ Pause'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  videoContainer: {
    width: '100%',
    height: layout.videoPlayerHeight,
    backgroundColor: '#000000',
  },
  video: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  playPauseText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
