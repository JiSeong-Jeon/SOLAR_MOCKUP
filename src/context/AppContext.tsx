import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  User,
  MoodEntry,
  ThoughtRecord,
  BehaviorRecord,
  CommunityPost,
  PHQ9Survey,
  WeeklyReport,
} from "../types";

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  moodEntries: MoodEntry[];
  addMoodEntry: (entry: MoodEntry) => void;
  thoughtRecords: ThoughtRecord[];
  addThoughtRecord: (record: ThoughtRecord) => void;
  behaviorRecords: BehaviorRecord[];
  addBehaviorRecord: (record: BehaviorRecord) => void;
  communityPosts: CommunityPost[];
  phq9Surveys: PHQ9Survey[];
  addPHQ9Survey: (survey: PHQ9Survey) => void;
  weeklyReports: WeeklyReport[];
  addWeeklyReport: (report: WeeklyReport) => void;
  guideStatus: "passed" | "pending" | "failed";
  markReportAsViewed: (reportId: string) => void;
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;
  currentDraft: Partial<ThoughtRecord | BehaviorRecord> | null;
  saveDraft: (draft: Partial<ThoughtRecord | BehaviorRecord>) => void;
  clearDraft: () => void;
  hasNewReport: boolean;
  reportWeek: string;
  dismissReport: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: "user-1",
    nickname: "사용자",
    email: "user@example.com",
    createdAt: new Date("2023-10-25T09:00:00"),
  });

  const [isOnboarded, setIsOnboarded] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<Partial<
    ThoughtRecord | BehaviorRecord
  > | null>(null);
  const [hasNewReport, setHasNewReport] = useState(true); // Simulate new report available
  const [reportWeek, setReportWeek] = useState("11월 1주");
  const [guideStatus, setGuideStatus] = useState<
    "passed" | "pending" | "failed"
  >("passed");

  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([
    {
      id: "1",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      mood: 6,
      emoji: "😊",
    },
    {
      id: "2",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      mood: 5,
      emoji: "😐",
    },
    {
      id: "3",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      mood: 7,
      emoji: "😄",
    },
    {
      id: "4",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      mood: 4,
      emoji: "😔",
    },
    {
      id: "5",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      mood: 6,
      emoji: "😊",
    },
    {
      id: "6",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      mood: 7,
      emoji: "😄",
    },
    {
      id: "7",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      mood: 8,
      emoji: "😁",
    },
  ]);

  const [thoughtRecords, setThoughtRecords] = useState<ThoughtRecord[]>([
    {
      id: "thought-1",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      situation: "팀 회의에서 내 의견이 받아들여지지 않았다",
      emotions: [
        { name: "불안", intensity: 7 },
        { name: "좌절", intensity: 6 },
      ],
      automaticThoughts: "내 의견은 항상 무시당해. 나는 무능한 사람이야.",
      cognitiveDistortions: [
        "흑백논리 - 극단적 사고",
        "과잉일반화 - 한 번의 경험을 모든 상황에 적용",
      ],
      alternativeThought:
        "이번 회의에서 내 의견이 채택되지 않았지만, 그건 여러 요인 때문일 수 있어. 다음에 더 나은 방법으로 제안해볼 수 있어.",
      alternativeDistortions: ["균형잡힌 사고", "증거 기반 평가"],
      sharedToCommunity: false,
    },
    {
      id: "thought-2",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      situation: "상사에게 프로젝트 진행 상황을 보고했다",
      emotions: [
        { name: "불안", intensity: 8 },
        { name: "긴장", intensity: 7 },
      ],
      automaticThoughts:
        "실수하면 큰일 날 거야. 다들 내가 못한다고 생각할 거야.",
      cognitiveDistortions: [
        "파국화 - 최악의 상황만 생각",
        "독심술 - 타인의 생각을 단정",
      ],
      alternativeThought:
        "완벽하지 않아도 괜찮아. 최선을 다하고 있고, 질문이 있으면 도움을 요청할 수 있어.",
      alternativeDistortions: ["현실적 평가", "자기격려"],
      sharedToCommunity: true,
    },
    {
      id: "thought-3",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      situation: "친구가 약속을 취소했다",
      emotions: [
        { name: "슬픔", intensity: 6 },
        { name: "외로움", intensity: 7 },
      ],
      automaticThoughts:
        "친구가 나를 싫어하는 것 같아. 나는 중요하지 않은 사람이야.",
      cognitiveDistortions: [
        "독심술 - 타인의 생각을 단정",
        "개인화 - 모든 것을 자신 탓으로 돌림",
      ],
      alternativeThought:
        "친구에게도 사정이 있을 수 있어. 다음에 다시 만날 수 있어.",
      alternativeDistortions: ["균형잡힌 사고", "증거 기반 평가"],
      sharedToCommunity: false,
    },
    {
      id: "thought-4",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      situation: "새로운 업무를 배정받았다",
      emotions: [
        { name: "불안", intensity: 8 },
        { name: "두려움", intensity: 7 },
      ],
      automaticThoughts: "이건 너무 어려워. 나는 절대 못할 거야.",
      cognitiveDistortions: [
        "흑백논리 - 극단적 사고",
        "과잉일반화 - 한 번의 경험을 모든 상황에 적용",
      ],
      alternativeThought:
        "처음엔 어렵더라도 배우면서 익숙해질 수 있어. 한 단계씩 나아가면 돼.",
      alternativeDistortions: ["현실적 평가", "자기격려"],
      sharedToCommunity: false,
    },
  ]);

  const [behaviorRecords, setBehaviorRecords] = useState<BehaviorRecord[]>([
    {
      id: "behavior-1",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      morningMood: 4,
      workMood: 6,
      eveningMood: 7,
      activities: [
        {
          id: "activity-1-1",
          situation: "morning",
          activity: "15분 산책하기",
          scheduledDate: new Date(),
          scheduledTime: "07:30",
        },
        {
          id: "activity-1-2",
          situation: "work",
          activity: "심호흡 5분",
          scheduledDate: new Date(),
          scheduledTime: "14:00",
        },
        {
          id: "activity-1-3",
          situation: "evening",
          activity: "좋아하는 음악 듣기",
          scheduledDate: new Date(),
          scheduledTime: "19:00",
        },
      ],
      completed: true,
    },
    {
      id: "behavior-2",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      morningMood: 3,
      workMood: 5,
      eveningMood: 6,
      activities: [
        {
          id: "activity-2-1",
          situation: "morning",
          activity: "스트레칭 10분",
          scheduledDate: new Date(),
          scheduledTime: "08:00",
        },
        {
          id: "activity-2-2",
          situation: "work",
          activity: "점심시간 산책",
          scheduledDate: new Date(),
          scheduledTime: "12:30",
        },
        {
          id: "activity-2-3",
          situation: "evening",
          activity: "일기 쓰기",
          scheduledDate: new Date(),
          scheduledTime: "20:00",
        },
      ],
      completed: true,
    },
    {
      id: "behavior-3",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      morningMood: 5,
      workMood: 7,
      eveningMood: 7,
      activities: [
        {
          id: "activity-3-1",
          situation: "morning",
          activity: "명상 5분",
          scheduledDate: new Date(),
          scheduledTime: "07:00",
        },
        {
          id: "activity-3-2",
          situation: "work",
          activity: "동료와 가벼운 대화",
          scheduledDate: new Date(),
          scheduledTime: "15:00",
        },
        {
          id: "activity-3-3",
          situation: "evening",
          activity: "가족과 저녁식사",
          scheduledDate: new Date(),
          scheduledTime: "18:30",
        },
      ],
      completed: true,
    },
    {
      id: "behavior-4",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      morningMood: 4,
      workMood: 6,
      eveningMood: 6,
      activities: [
        {
          id: "activity-4-1",
          situation: "morning",
          activity: "따뜻한 차 마시기",
          scheduledDate: new Date(),
          scheduledTime: "07:30",
        },
        {
          id: "activity-4-2",
          situation: "work",
          activity: "정리정돈 10분",
          scheduledDate: new Date(),
          scheduledTime: "16:00",
        },
      ],
      completed: true,
    },
  ]);

  const [phq9Surveys, setPHQ9Surveys] = useState<PHQ9Survey[]>([
    {
      id: "phq9-1",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      score: 15,
      answers: [2, 2, 2, 1, 2, 2, 1, 2, 1],
    },
    {
      id: "phq9-2",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      score: 10,
      answers: [1, 1, 2, 1, 1, 1, 1, 1, 1],
    },
  ]);

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: "1",
      userId: "user-2",
      nickname: "희망이",
      content:
        "오늘 부정적인 생각을 대안적 사고로 바꿔보니 기분이 조금 나아졌어요. 작은 변화지만 의미있네요.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 12,
      commentCount: 3,
      isLiked: false,
    },
    {
      id: "2",
      userId: "user-3",
      nickname: "평온",
      content:
        "행동 활성화 기록을 2주째 하고 있는데, 확실히 루틴이 생기니까 마음이 안정되는 것 같아요.",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      likes: 8,
      commentCount: 2,
      isLiked: false,
    },
  ]);

  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([
    {
      id: "report-1",
      weekLabel: "11월 1주",
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      phq9SurveyIds: ["phq9-1"],
      thoughtRecordIds: ["thought-1", "thought-2"],
      behaviorRecordIds: ["behavior-1", "behavior-2"],
      moodEntryCount: 5,
      isViewed: true,
    },
    {
      id: "report-2",
      weekLabel: "11월 2주",
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      createdAt: new Date(),
      phq9SurveyIds: ["phq9-2"],
      thoughtRecordIds: ["thought-3", "thought-4"],
      behaviorRecordIds: ["behavior-3", "behavior-4"],
      moodEntryCount: 7,
      isViewed: false,
    },
  ]);

  const addMoodEntry = (entry: MoodEntry) => {
    setMoodEntries((prev) => [...prev, entry]);
  };

  const addThoughtRecord = (record: ThoughtRecord) => {
    setThoughtRecords((prev) => [...prev, record]);
  };

  const addBehaviorRecord = (record: BehaviorRecord) => {
    setBehaviorRecords((prev) => [...prev, record]);
  };

  const addPHQ9Survey = (survey: PHQ9Survey) => {
    setPHQ9Surveys((prev) => [...prev, survey]);
  };

  const addWeeklyReport = (report: WeeklyReport) => {
    setWeeklyReports((prev) => [...prev, report]);
  };

  const markReportAsViewed = (reportId: string) => {
    setWeeklyReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, isViewed: true } : report
      )
    );
  };

  const saveDraft = (draft: Partial<ThoughtRecord | BehaviorRecord>) => {
    setCurrentDraft(draft);
    // Auto-save to localStorage
    localStorage.setItem("cbt-draft", JSON.stringify(draft));
  };

  const clearDraft = () => {
    setCurrentDraft(null);
    localStorage.removeItem("cbt-draft");
  };

  const dismissReport = () => {
    setHasNewReport(false);
  };

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("cbt-draft");
    if (savedDraft) {
      setCurrentDraft(JSON.parse(savedDraft));
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        moodEntries,
        addMoodEntry,
        thoughtRecords,
        addThoughtRecord,
        behaviorRecords,
        addBehaviorRecord,
        communityPosts,
        phq9Surveys,
        addPHQ9Survey,
        weeklyReports,
        addWeeklyReport,
        guideStatus,
        markReportAsViewed,
        isOnboarded,
        setIsOnboarded,
        currentDraft,
        saveDraft,
        clearDraft,
        hasNewReport,
        reportWeek,
        dismissReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
