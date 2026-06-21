/**
 * Learning Module SDK - Navigation Types
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Dashboard: undefined;
  ModuleDetail: { moduleId: string };
  VideoPlayer: { videoId: string; moduleId: string };
  Assessment: { assessmentId: string; moduleId: string };
  AssessmentResult: {
    score: number;
    passed: boolean;
    assessmentId: string;
    moduleId: string;
    minimumRequired: number;
  };
  ModuleCompletion: { moduleId: string };
  Certificate: undefined;
};

export type DashboardScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Dashboard'
>;

export type ModuleDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ModuleDetail'
>;

export type VideoPlayerScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'VideoPlayer'
>;

export type AssessmentScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Assessment'
>;

export type AssessmentResultScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AssessmentResult'
>;

export type ModuleCompletionScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ModuleCompletion'
>;

export type CertificateScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Certificate'
>;
