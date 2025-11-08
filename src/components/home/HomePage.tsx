import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Alert, AlertDescription } from "../ui/alert";
import {
  ArrowRight,
  BarChart3,
  X,
  TrendingUp,
  Edit3,
  ClipboardCheck,
  Smile,
  Star,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { MoodSparkline } from "./MoodSparkline";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import type { PlannedActivity } from "../../types";

const MOOD_EMOJIS = [
  "😢",
  "😔",
  "😕",
  "😐",
  "🙂",
  "😊",
  "😄",
  "😁",
  "🤩",
  "🥳",
  "✨",
];

interface HomePageProps {
  onNavigateToRecord?: () => void;
  onNavigateToReport?: () => void;
  onNavigateToPHQ9?: () => void;
}

type ChartPeriod = "daily" | "weekly" | "monthly";

export function HomePage({
  onNavigateToRecord,
  onNavigateToReport,
  onNavigateToPHQ9,
}: HomePageProps) {
  const {
    moodEntries,
    addMoodEntry,
    hasNewReport,
    reportWeek,
    dismissReport,
    thoughtRecords,
    behaviorRecords,
    phq9Surveys,
  } = useApp();

  const [todayMood, setTodayMood] = useState<number>(5);
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [showMoodChart, setShowMoodChart] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("weekly");
  const [showPHQ9Alert, setShowPHQ9Alert] = useState(false);
  const [showBehaviorCheckModal, setShowBehaviorCheckModal] = useState(false);
  const [dueActivity, setDueActivity] = useState<PlannedActivity | null>(null);
  const [activityCompleted, setActivityCompleted] = useState(false);
  const [activityMood, setActivityMood] = useState(5);

  const todayEntry = moodEntries.find(
    (entry) => new Date(entry.date).toDateString() === new Date().toDateString()
  );

  useEffect(() => {
    if (todayEntry) {
      setShowMoodChart(true);
    }
  }, [todayEntry]);

  // REQ-HOME-006: PHQ-9 Survey Alert Logic
  useEffect(() => {
    const lastSurvey = phq9Surveys[phq9Surveys.length - 1];
    const daysSinceLastSurvey = lastSurvey
      ? (new Date().getTime() - new Date(lastSurvey.date).getTime()) /
        (1000 * 3600 * 24)
      : Infinity;

    const moodRecordCount = moodEntries.length;
    const cbtRecordCount = thoughtRecords.length + behaviorRecords.length;

    if (
      moodRecordCount >= 7 &&
      cbtRecordCount >= 7 &&
      daysSinceLastSurvey > 14
    ) {
      setShowPHQ9Alert(true);
    }
  }, [moodEntries, thoughtRecords, behaviorRecords, phq9Surveys]);

  // REQ-HOME-007: Behavior Check Modal Logic
  useEffect(() => {
    const now = new Date();
    const todayStr = now.toDateString();

    for (const record of behaviorRecords) {
      if (new Date(record.date).toDateString() === todayStr) {
        for (const activity of record.activities) {
          if (activity.scheduledTime) {
            const [hours, minutes] = activity.scheduledTime
              .split(":")
              .map(Number);
            const scheduledDateTime = new Date(record.date);
            scheduledDateTime.setHours(hours, minutes, 0, 0);

            if (now > scheduledDateTime && !activity.completed) {
              setDueActivity(activity);
              setShowBehaviorCheckModal(true);
              return; // Show modal for the first due activity
            }
          }
        }
      }
    }
  }, [behaviorRecords]);

  const handleSaveMood = async () => {
    setIsSavingMood(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newEntry = {
      id: Date.now().toString(),
      date: new Date(),
      mood: todayMood,
      emoji: MOOD_EMOJIS[todayMood],
    };
    addMoodEntry(newEntry);
    setIsSavingMood(false);
    setShowMoodChart(true);
    toast.success("오늘의 기분이 저장되었어요");
  };

  const handleGoToReport = () => {
    dismissReport();
    if (onNavigateToReport) {
      onNavigateToReport();
    }
  };

  const getEntriesForPeriod = () => {
    switch (chartPeriod) {
      case "daily":
        return moodEntries.slice(-7); // 최근 7개
      case "weekly":
        return moodEntries.slice(-14); // 최근 14개
      case "monthly":
        return moodEntries.slice(-30); // 최근 30개
      default:
        return moodEntries.slice(-7);
    }
  };

  const chartEntries = getEntriesForPeriod();

  // REQ-HOME-003: Weekly Summary Calculations
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const last7DaysMood = moodEntries.filter((e) => new Date(e.date) >= weekAgo);
  const recordDays = new Set(
    last7DaysMood.map((e) => new Date(e.date).toDateString())
  ).size;
  const thisWeekThoughtRecords = thoughtRecords.filter(
    (r) => new Date(r.date) >= weekAgo
  ).length;
  const thisWeekBehaviorRecords = behaviorRecords.filter(
    (r) => new Date(r.date) >= weekAgo
  ).length;
  const averageMood =
    last7DaysMood.length > 0
      ? last7DaysMood.reduce((sum, entry) => sum + entry.mood, 0) /
        last7DaysMood.length
      : 0;
  const bestMoodEntry =
    last7DaysMood.length > 0
      ? last7DaysMood.reduce((best, entry) =>
          entry.mood > best.mood ? entry : best
        )
      : null;

  const handleCloseBehaviorModal = () => {
    setShowBehaviorCheckModal(false);
    setDueActivity(null);
    setActivityCompleted(false);
    setActivityMood(5);
  };

  const handleSaveBehaviorCheck = () => {
    if (dueActivity) {
      // Here you would typically update the state in AppContext
      console.log({
        activityId: dueActivity.id, // Assuming activity has an ID
        completed: activityCompleted,
        mood: activityCompleted ? activityMood : undefined,
      });
      toast.success("활동을 기록했어요!");
      // Mark activity as completed to prevent re-showing the modal
      // This requires updating the state management in AppContext
    }
    handleCloseBehaviorModal();
  };

  return (
    <div className="pb-20 pt-4 px-4 max-w-lg mx-auto">
      {/* Report Alert */}
      {hasNewReport && (
        <Alert className="mb-4 border-[#1BBE7D] bg-gradient-to-r from-[#1BBE7D]/10 to-[#3751FF]/5">
          <BarChart3 className="h-5 w-5 text-[#1BBE7D]" />
          <AlertDescription className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[#1BBE7D] text-sm">
                <strong>{reportWeek}</strong> 보고서가 준비됐어요
              </p>
              <button
                onClick={handleGoToReport}
                className="text-sm text-[#3751FF] hover:underline mt-1 inline-flex items-center gap-1"
              >
                보러가기 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={dismissReport}
              className="text-neutral-400 hover:text-neutral-600 -mt-1"
            >
              <X className="h-4 w-4" />
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* REQ-HOME-006: PHQ-9 Alert */}
      {showPHQ9Alert && (
        <Alert className="mb-4 border-blue-500 bg-blue-500/10">
          <ClipboardCheck className="h-5 w-5 text-blue-500" />
          <AlertDescription className="flex items-start justify-between gap-3">
            <div>
              <p className="text-blue-600 text-sm">
                <strong>마음 건강 검진 시간!</strong>
              </p>
              <p className="text-xs text-blue-500 mt-0.5">
                PHQ-9 설문으로 현재 상태를 점검해보세요.
              </p>
              <button
                onClick={() => {
                  setShowPHQ9Alert(false);
                  if (onNavigateToPHQ9) onNavigateToPHQ9();
                }}
                className="text-sm text-[#3751FF] hover:underline mt-1 inline-flex items-center gap-1"
              >
                설문 시작하기 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={() => setShowPHQ9Alert(false)}
              className="text-neutral-400 hover:text-neutral-600 -mt-1"
            >
              <X className="h-4 w-4" />
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Mood Tracking Card */}
      <Card className="p-4 mb-4">
        <h2 className="">기분 기록</h2>
        {!todayEntry ? (
          <>
            <p className="text-sm text-neutral-600 mb-2">
              오늘의 기분을 기록해보세요
            </p>
            <div className="text-center mb-3">
              <div className="text-5xl mb-1">{MOOD_EMOJIS[todayMood]}</div>
              <p className="text-neutral-600">{todayMood}/10</p>
            </div>
            <div className="mb-3">
              <Slider
                value={[todayMood]}
                onValueChange={([v]: number[]) => setTodayMood(v)}
                min={0}
                max={10}
                step={1}
                className="mb-1.5"
              />
              <div className="flex justify-between text-xs text-neutral-500">
                <span>매우 나쁨</span>
                <span>보통</span>
                <span>매우 좋음</span>
              </div>
            </div>
            <Button
              onClick={handleSaveMood}
              disabled={isSavingMood}
              className="w-full bg-[#3751FF] hover:bg-[#3751FF]/90"
            >
              {isSavingMood ? "저장 중..." : "기분 저장하기"}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2 pb-2 border-b">
              <div className="flex items-center gap-2.5">
                <div>
                  <p className="text-sm text-neutral-500">오늘 기분</p>
                  <p className="text-xl">{todayEntry.mood}/10</p>
                </div>
              </div>
              <p className="text-xs text-neutral-600">
                💡 규칙적인 기분 기록은 자신의 감정 패턴을 이해하는
                첫걸음입니다.
              </p>
            </div>
            {/* REQ-HOME-002 & REQ-HOME-004 */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm text-neutral-600">기분 변화 그래프</p>
                <div className="flex gap-1">
                  {(["daily", "weekly", "monthly"] as ChartPeriod[]).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setChartPeriod(p)}
                        className={`py-1 px-2.5 rounded-md text-xs transition-colors ${
                          chartPeriod === p
                            ? "bg-[#3751FF] text-white"
                            : "bg-neutral-100 hover:bg-neutral-200"
                        }`}
                      >
                        {p === "daily" && "일간"}
                        {p === "weekly" && "주간"}
                        {p === "monthly" && "월간"}
                      </button>
                    )
                  )}
                </div>
              </div>
              <React.Suspense
                fallback={
                  <div className="h-24 bg-neutral-100 rounded-lg animate-pulse" />
                }
              >
                <MoodSparkline entries={chartEntries} />
              </React.Suspense>
              <div className="mt-2 p-2 bg-neutral-50 rounded-lg">
                <p className="text-xs text-neutral-600">
                  💡 규칙적인 기분 기록은 자신의 감정 패턴을 이해하는
                  첫걸음입니다.
                </p>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* REQ-HOME-003: Weekly Summary */}
      {last7DaysMood.length > 0 && (
        <Card className="p-5 mb-4">
          <h3 className="mb-3">이번주 요약</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              {
                label: "기록 일수",
                value: recordDays,
                total: 7,
                color: "#3751FF",
                icon: null,
                valueText: recordDays,
                totalText: "/7",
              },
              {
                label: "평균 기분",
                value: averageMood,
                total: 10,
                color: "#1BBE7D",
                icon: <Smile className="w-4 h-4" />,
                valueText: averageMood.toFixed(1),
                totalText: "점",
              },
              {
                label: "최고 기분",
                value: bestMoodEntry?.mood ?? 0,
                total: 10,
                color: "#FFB020",
                icon: <Star className="w-4 h-4" />,
                valueText: bestMoodEntry?.emoji ?? "",
                totalText: ` ${bestMoodEntry?.mood ?? 0}점`,
              },
            ].map(
              ({ label, value, total, color, icon, valueText, totalText }) => {
                return (
                  <div key={label} className="flex flex-col items-center">
                    <div className="relative w-20 h-10 mb-1.5">
                      <svg className="w-20 h-10" viewBox="0 0 80 40">
                        <path
                          d="M 5 40 A 35 35 0 0 1 75 40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-neutral-200"
                        />
                        <path
                          d="M 5 40 A 35 35 0 0 1 75 40"
                          fill="none"
                          stroke={color}
                          strokeWidth="8"
                          strokeDasharray={`${Math.PI * 35}`}
                          strokeDashoffset={`${
                            Math.PI * 35 * (1 - value / total)
                          }`}
                          className="transition-all duration-500"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-end justify-center pb-1">
                        <span className="text-sm font-bold">{valueText}</span>
                        <span className="text-xs text-neutral-500">
                          {totalText}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 text-center flex items-center gap-1">
                      {icon}
                      <span>{label}</span>
                    </p>
                  </div>
                );
              }
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600 bg-gradient-to-r from-[#3751FF]/5 to-[#1BBE7D]/5 rounded-lg p-3">
            <TrendingUp className="w-4 h-4 text-[#1BBE7D] flex-shrink-0" />
            <span>
              이번 주 {recordDays}일 동안 기분을 기록했어요. 계속 실천해보세요!
            </span>
          </div>
        </Card>
      )}

      {/* REQ-HOME-007: Behavior Check Modal */}
      <Dialog
        open={showBehaviorCheckModal}
        onOpenChange={setShowBehaviorCheckModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>활동 확인</DialogTitle>
            <DialogDescription>
              "{dueActivity?.activity}" 활동을 하셨나요?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="activity-completed"
                checked={activityCompleted}
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  setActivityCompleted(Boolean(checked))
                }
              />
              <Label htmlFor="activity-completed">활동을 완료했어요.</Label>
            </div>
            {activityCompleted && (
              <div className="space-y-2">
                <Label>활동 후 기분은 어떠셨나요?</Label>
                <div className="text-center mb-3">
                  <div className="text-4xl mb-1">
                    {MOOD_EMOJIS[activityMood]}
                  </div>
                </div>
                <Slider
                  value={[activityMood]}
                  onValueChange={([v]: number[]) => setActivityMood(v)}
                  min={0}
                  max={10}
                  step={1}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseBehaviorModal}>
              취소
            </Button>
            <Button
              onClick={handleSaveBehaviorCheck}
              className="bg-[#3751FF] hover:bg-[#3751FF]/90"
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
