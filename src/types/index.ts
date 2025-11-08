// Types for the Mental Health CBT App

export interface User {
  id: string;
  nickname: string;
  email: string;
  depressionScore?: number;
  createdAt: Date;
}

export interface PHQ9Survey {
  id: string;
  date: Date;
  score: number; // 0-27
  answers: number[]; // 9 questions, 0-3 each
}

export interface WeeklyReport {
  id: string;
  weekLabel: string; // e.g., "11월 1주", "11월 2주"
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  phq9SurveyIds: string[]; // References to PHQ-9 surveys used
  thoughtRecordIds: string[]; // References to thought records
  behaviorRecordIds: string[]; // References to behavior records
  moodEntryCount: number;
  isViewed: boolean;
}

export interface MoodEntry {
  id: string;
  date: Date;
  mood: number; // 0-10
  emoji: string;
}

export interface ThoughtRecord {
  id: string;
  date: Date;
  situation: string;
  emotions: { name: string; intensity: number }[];
  automaticThoughts: string;
  cognitiveDistortions: string[];
  alternativeThought: string;
  alternativeDistortions?: string[]; // 대안적 사고 유형
  sharedToCommunity: boolean;
}

export interface PlannedActivity {
  id: string;
  situation: "morning" | "work" | "evening";
  activity: string;
  scheduledDate?: Date;
  scheduledTime?: string;
  completed?: boolean;
}

export interface BehaviorRecord {
  id: string;
  date: Date;
  morningMood: number; // 출근 전 기분 (0-10)
  workMood: number; // 업무 중 기분 (0-10)
  eveningMood: number; // 퇴근 후 기분 (0-10)
  activities: PlannedActivity[];
  completed: boolean;
}

export interface CommunityPost {
  id: string;
  userId: string;
  nickname: string;
  content: string;
  createdAt: Date;
  likes: number;
  commentCount: number;
  isLiked: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  nickname: string;
  content: string;
  createdAt: Date;
}

export type CBTType = "thought" | "behavior";
export type ArchiveFilter = "all" | "week" | "month" | "custom";
