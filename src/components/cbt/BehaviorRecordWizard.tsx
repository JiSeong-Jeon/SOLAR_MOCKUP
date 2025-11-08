import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Save,
  Calendar as CalendarIcon,
  Plus,
  X,
  AlertCircle,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { HelpButton } from "../common/HelpButton";
import { toast } from "sonner@2.0.3";
import type {
  BehaviorRecord,
  PlannedActivity,
} from "../../types";

interface BehaviorRecordWizardProps {
  onBack: () => void;
  onComplete: () => void;
}

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
const MOOD_CUT_OFF = 6; // 이 점수 미만은 낮은 점수로 간주

const ACTIVITY_SUGGESTIONS = [
  "15분 산책하기",
  "좋아하는 음악 듣기",
  "심호흡 5분",
  "스트레칭 하기",
  "따뜻한 차 마시기",
  "친구에게 연락하기",
  "좋아하는 영상 보기",
  "책 한 페이지 읽기",
  "간단한 정리하기",
  "창문 열고 환기하기",
  "감사일기 쓰기",
  "가벼운 요가",
];

const SITUATION_LABELS = {
  morning: "출근 전",
  work: "업무 중",
  evening: "퇴근 후",
};

export function BehaviorRecordWizard({
  onBack,
  onComplete,
}: BehaviorRecordWizardProps) {
  const { addBehaviorRecord } = useApp();

  const [step, setStep] = useState(1);

  // Step 1: Mood scores and negative events
  const [morningMood, setMorningMood] = useState(5);
  const [workMood, setWorkMood] = useState(5);
  const [eveningMood, setEveningMood] = useState(5);
  const [morningEvent, setMorningEvent] = useState("");
  const [workEvent, setWorkEvent] = useState("");
  const [eveningEvent, setEveningEvent] = useState("");
  const [step1Accordion, setStep1Accordion] = useState<
    string[]
  >([]);

  // Step 2: Activities
  const [activities, setActivities] = useState<
    PlannedActivity[]
  >([]);
  const [openAccordion, setOpenAccordion] = useState<string[]>(
    [],
  );

  const progressPercent = (step / 3) * 100;

  // Determine low mood situations
  const lowMoodSituations = [
    morningMood < MOOD_CUT_OFF ? "morning" : null,
    workMood < MOOD_CUT_OFF ? "work" : null,
    eveningMood < MOOD_CUT_OFF ? "evening" : null,
  ].filter(Boolean) as ("morning" | "work" | "evening")[];

  // Open accordions for low mood situations by default in Step 2
  useEffect(() => {
    if (step === 2 && openAccordion.length === 0) {
      setOpenAccordion(lowMoodSituations);
    }
  }, [step]);

  const getMoodForSituation = (
    situation: "morning" | "work" | "evening",
  ) => {
    switch (situation) {
      case "morning":
        return morningMood;
      case "work":
        return workMood;
      case "evening":
        return eveningMood;
    }
  };

  const addActivity = (
    situation: "morning" | "work" | "evening",
    activity: string,
  ) => {
    const existingCount = activities.filter(
      (a) => a.situation === situation,
    ).length;
    if (existingCount >= 3) {
      toast.error(
        "각 상황당 최대 3개까지 활동을 추가할 수 있어요",
      );
      return;
    }

    setActivities([...activities, { situation, activity }]);
    toast.success("활동이 추가되었어요");
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const updateActivitySchedule = (
    index: number,
    date: Date | undefined,
    time: string,
  ) => {
    const updated = [...activities];
    updated[index] = {
      ...updated[index],
      scheduledDate: date,
      scheduledTime: time,
    };
    setActivities(updated);
  };

  const handleComplete = () => {
    const record: BehaviorRecord = {
      id: Date.now().toString(),
      date: new Date(),
      morningMood,
      workMood,
      eveningMood,
      activities,
      completed: false,
    };

    addBehaviorRecord(record);
    toast.success("행동기록지가 저장되었어요!");
    onComplete();
  };

  // Step 1: 부정적 사건이 모두 작성되었는지 확인
  const canProceedStep1 =
    morningEvent.trim() !== "" &&
    workEvent.trim() !== "" &&
    eveningEvent.trim() !== "";
  const canProceedStep2 = activities.length > 0;

  return (
    <div className="pb-20 pt-4 px-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>뒤로</span>
        </button>

        <div className="flex items-center justify-between mb-2">
          <h1>행동기록지</h1>
          <span className="text-sm text-neutral-500">
            {step} / 3
          </span>
        </div>

        <Progress
          value={progressPercent}
          className="h-2 mb-4"
        />
      </div>

      {/* Step 1: 3가지 상황 기분 점수 - 토글 형식 */}
      {step === 1 && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <h2>오늘 하루 기분은 어땠나요?</h2>
              <HelpButton
                title="기분 점수 기록하기"
                content={
                  <div className="space-y-2">
                    <p>
                      하루를 3가지 시간대로 나누어 각 시간의
                      기분을 평가해주세요.
                    </p>
                    <p className="text-xs text-neutral-500">
                      <strong>왜 중요할까요?</strong> 하루 중
                      어느 시간대에 기분이 낮은지 파악하면, 그
                      시간에 맞는 활동을 계획할 수 있습니다.
                    </p>
                  </div>
                }
              />
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              각 시간대를 선택해서 기분과 상황을 기록해주세요
            </p>

            <Accordion
              type="single"
              value={step1Accordion[0] || ""} // 현재 열려 있는 AccordionItem의 value
              onValueChange={(value: string | undefined) => {
                if (step1Accordion[0] === value) {
                  setStep1Accordion([]); // 동일한 값 클릭 시 닫힘
                } else {
                  setStep1Accordion(value ? [value] : []); // 새로운 값 클릭 시 열림
                }
              }}
              collapsible // 이 옵션을 추가하여 열려 있는 항목을 다시 클릭하면 닫히도록 설정
              className="space-y-2"
            >
              {/* 출근 전 */}
              <AccordionItem
                value="morning"
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">☀️</span>
                      <span className="text-sm">
                        출근 전 기분을 확인해볼까요?
                      </span>
                    </div>
                    {step1Accordion.includes("morning") && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {MOOD_EMOJIS[morningMood]}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {morningMood}/10
                        </span>
                      </div>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm">
                          기분 점수
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {MOOD_EMOJIS[morningMood]}
                          </span>
                          <span className="text-sm text-neutral-600">
                            {morningMood}/10
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={[morningMood]}
                        onValueChange={([value]: number[]) =>
                          setMorningMood(value)
                        }
                        min={0}
                        max={10}
                        step={1}
                        className="mb-2"
                        aria-label="출근 전 기분"
                      />
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>매우 나쁨</span>
                        <span>보통</span>
                        <span>매우 좋음</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm mb-2 block">
                        부정적 사건
                      </Label>
                      <Textarea
                        value={morningEvent}
                        onChange={(e) =>
                          setMorningEvent(e.target.value)
                        }
                        placeholder="예: 알람을 늦게 설정해서 급하게 준비했어요"
                        className="min-h-20 text-sm"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 업무 중 */}
              <AccordionItem
                value="work"
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💼</span>
                      <span className="text-sm">
                        업무 중 기분을 확인해볼까요?
                      </span>
                    </div>
                    {step1Accordion.includes("work") && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {MOOD_EMOJIS[workMood]}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {workMood}/10
                        </span>
                      </div>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm">
                          기분 점수
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {MOOD_EMOJIS[workMood]}
                          </span>
                          <span className="text-sm text-neutral-600">
                            {workMood}/10
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={[workMood]}
                        onValueChange={([value]: number[]) =>
                          setWorkMood(value)
                        }
                        min={0}
                        max={10}
                        step={1}
                        className="mb-2"
                        aria-label="업무 중 기분"
                      />
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>매우 나쁨</span>
                        <span>보통</span>
                        <span>매우 좋음</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm mb-2 block">
                        부정적 사건
                      </Label>
                      <Textarea
                        value={workEvent}
                        onChange={(e) =>
                          setWorkEvent(e.target.value)
                        }
                        placeholder="예: 동료와 의견 충돌이 있었어요"
                        className="min-h-20 text-sm"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 퇴근 후 */}
              <AccordionItem
                value="evening"
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🌙</span>
                      <span className="text-sm">
                        퇴근 후 기분을 확인해볼까요?
                      </span>
                    </div>
                    {step1Accordion.includes("evening") && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {MOOD_EMOJIS[eveningMood]}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {eveningMood}/10
                        </span>
                      </div>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm">
                          기분 점수
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {MOOD_EMOJIS[eveningMood]}
                          </span>
                          <span className="text-sm text-neutral-600">
                            {eveningMood}/10
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={[eveningMood]}
                        onValueChange={([value]: number[]) =>
                          setEveningMood(value)
                        }
                        min={0}
                        max={10}
                        step={1}
                        className="mb-2"
                        aria-label="퇴근 후 기분"
                      />
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>매우 나쁨</span>
                        <span>보통</span>
                        <span>매우 좋음</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm mb-2 block">
                        부정적 사건
                      </Label>
                      <Textarea
                        value={eveningEvent}
                        onChange={(e) =>
                          setEveningEvent(e.target.value)
                        }
                        placeholder="예: 집에 와서도 일 생각이 계속 나요"
                        className="min-h-20 text-sm"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {lowMoodSituations.length > 0 && (
            <Card className="p-4 bg-[#FFB020]/5 border-[#FFB020]/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-[#FFB020] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm mb-1">
                    <strong>
                      {lowMoodSituations
                        .map((s) => SITUATION_LABELS[s])
                        .join(", ")}
                    </strong>{" "}
                    시간대의 기분이 낮네요.
                  </p>
                  <p className="text-xs text-neutral-600">
                    다음 단계에서 기분을 개선할 수 있는 활동을
                    계획해보세요.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Button
            onClick={() => setStep(2)}
            disabled={!canProceedStep1} // 부정적 사건이 모두 작성되지 않으면 비활성화
            className="w-full bg-[#1BBE7D] hover:bg-[#1BBE7D]/90"
          >
            다음 <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Step 2: 대안적 활동 설정 */}
      {step === 2 && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <h2>대안적 활동 계획하기</h2>
              <HelpButton
                title="대안적 활동이란?"
                content={
                  <div className="space-y-2">
                    <p>
                      기분이 낮을 때 실천할 수 있는 구체적인
                      활동을 미리 계획하는 것입니다.
                    </p>
                    <p className="text-xs text-neutral-500">
                      <strong>팁:</strong> 작고 실천 가능한
                      활동부터 시작하세요. 완벽할 필요는
                      없습니다!
                    </p>
                  </div>
                }
              />
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              각 시간대별로 실천할 활동을 추가하세요 (최대 3개)
            </p>

            <Accordion
              type="single"
              value={step1Accordion[0] || ""} // 현재 열려 있는 AccordionItem의 value
              onValueChange={
                (value: string | undefined) =>
                  setStep1Accordion((prev) =>
                    prev[0] === value
                      ? []
                      : value
                        ? [value]
                        : [],
                  ) // 열려 있는 항목을 클릭하면 닫힘
              }
              collapsible
              className="space-y-2"
            >
              {/* 출근 전 */}
              <AccordionItem
                value="morning"
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span>☀️</span>
                      <div className="text-left">
                        <p className="text-sm">출근 전</p>
                        <p className="text-xs text-neutral-500">
                          기분: {morningMood}/10{" "}
                          {MOOD_EMOJIS[morningMood]}
                        </p>
                      </div>
                    </div>
                    {morningMood < MOOD_CUT_OFF && (
                      <span className="text-xs bg-[#FFB020]/20 text-[#FFB020] px-2 py-0.5 rounded-full">
                        낮음
                      </span>
                    )}
                    <span className="text-xs text-neutral-500 ml-2">
                      (
                      {
                        activities.filter(
                          (a) => a.situation === "morning",
                        ).length
                      }
                      /3)
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <ActivityInput
                    situation="morning"
                    activities={activities.filter(
                      (a) => a.situation === "morning",
                    )}
                    onAdd={(activity) =>
                      addActivity("morning", activity)
                    }
                    onRemove={(activity) => {
                      const index = activities.findIndex(
                        (a) =>
                          a.situation === "morning" &&
                          a.activity === activity,
                      );
                      if (index !== -1) removeActivity(index);
                    }}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* 업무 중 */}
              <AccordionItem
                value="work"
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span>💼</span>
                      <div className="text-left">
                        <p className="text-sm">업무 중</p>
                        <p className="text-xs text-neutral-500">
                          기분: {workMood}/10{" "}
                          {MOOD_EMOJIS[workMood]}
                        </p>
                      </div>
                    </div>
                    {workMood < MOOD_CUT_OFF && (
                      <span className="text-xs bg-[#FFB020]/20 text-[#FFB020] px-2 py-0.5 rounded-full">
                        낮음
                      </span>
                    )}
                    <span className="text-xs text-neutral-500 ml-2">
                      (
                      {
                        activities.filter(
                          (a) => a.situation === "work",
                        ).length
                      }
                      /3)
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <ActivityInput
                    situation="work"
                    activities={activities.filter(
                      (a) => a.situation === "work",
                    )}
                    onAdd={(activity) =>
                      addActivity("work", activity)
                    }
                    onRemove={(activity) => {
                      const index = activities.findIndex(
                        (a) =>
                          a.situation === "work" &&
                          a.activity === activity,
                      );
                      if (index !== -1) removeActivity(index);
                    }}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* 퇴근 후 */}
              <AccordionItem
                value="evening"
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span>🌙</span>
                      <div className="text-left">
                        <p className="text-sm">퇴근 후</p>
                        <p className="text-xs text-neutral-500">
                          기분: {eveningMood}/10{" "}
                          {MOOD_EMOJIS[eveningMood]}
                        </p>
                      </div>
                    </div>
                    {eveningMood < MOOD_CUT_OFF && (
                      <span className="text-xs bg-[#FFB020]/20 text-[#FFB020] px-2 py-0.5 rounded-full">
                        낮음
                      </span>
                    )}
                    <span className="text-xs text-neutral-500 ml-2">
                      (
                      {
                        activities.filter(
                          (a) => a.situation === "evening",
                        ).length
                      }
                      /3)
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <ActivityInput
                    situation="evening"
                    activities={activities.filter(
                      (a) => a.situation === "evening",
                    )}
                    onAdd={(activity) =>
                      addActivity("evening", activity)
                    }
                    onRemove={(activity) => {
                      const index = activities.findIndex(
                        (a) =>
                          a.situation === "evening" &&
                          a.activity === activity,
                      );
                      if (index !== -1) removeActivity(index);
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {activities.length > 0 && (
            <Card className="p-4 bg-[#1BBE7D]/5 border-[#1BBE7D]/20">
              <p className="text-sm">
                <strong>{activities.length}개</strong>의 활동이
                계획되었어요 ✨
              </p>
            </Card>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> 이전
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              className="flex-1 bg-[#1BBE7D] hover:bg-[#1BBE7D]/90"
            >
              다음 <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: 스케줄 설정 */}
      {step === 3 && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <h2>활동 스케줄 설정</h2>
              <HelpButton
                title="스케줄 설정"
                content="각 활동을 언제 실천할지 날짜와 시간을 설정하세요. 구체적인 계획이 실천 가능성을 높입니다."
              />
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              언제 실천할지 날짜와 시간을 설정하세요 (선택사항)
            </p>

            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="p-3 border border-neutral-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded">
                          {SITUATION_LABELS[activity.situation]}
                        </span>
                      </div>
                      <p className="text-sm">
                        {activity.activity}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {activity.scheduledDate
                            ? activity.scheduledDate.toLocaleDateString(
                                "ko-KR",
                              )
                            : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={activity.scheduledDate}
                          onSelect={(date: Date | undefined) =>
                            updateActivitySchedule(
                              index,
                              date,
                              activity.scheduledTime || "",
                            )
                          }
                          disabled={(date: Date) =>
                            date <
                            new Date(
                              new Date().setHours(0, 0, 0, 0),
                            )
                          }
                        />
                      </PopoverContent>
                    </Popover>

                    <Input
                      type="time"
                      value={activity.scheduledTime || ""}
                      onChange={(e) =>
                        updateActivitySchedule(
                          index,
                          activity.scheduledDate,
                          e.target.value,
                        )
                      }
                      className="flex-1"
                      placeholder="시간"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#1BBE7D]/10 to-[#3751FF]/5">
            <h3 className="mb-2 text-sm">💡 실천 팁</h3>
            <ul className="text-xs text-neutral-600 space-y-1">
              <li>
                • 알람이나 캘린더에 등록해서 잊지 않도록 하세요
              </li>
              <li>
                • 완벽하게 하려고 하지 말고, 시작하는 것만으로도
                충분해요
              </li>
              <li>
                • 실천 후 기분이 어떻게 변했는지 기록해보세요
              </li>
            </ul>
          </Card>

          <div className="flex gap-2">
            <Button
              onClick={() => setStep(2)}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> 이전
            </Button>
            <Button
              onClick={handleComplete}
              className="flex-1 bg-[#1BBE7D] hover:bg-[#1BBE7D]/90"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> 완료
            </Button>
          </div>
        </div>
      )}

      {/* Save Draft Button */}
      <div className="mt-4">
        <Button
          onClick={() => {
            toast.success("임시 저장되었어요");
            onBack();
          }}
          variant="outline"
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          나중에 이어서 쓰기
        </Button>
      </div>
    </div>
  );
}

// Activity Input Component
interface ActivityInputProps {
  situation: "morning" | "work" | "evening";
  activities: PlannedActivity[];
  onAdd: (activity: string) => void;
  onRemove: (activity: string) => void;
}

function ActivityInput({
  situation,
  activities,
  onAdd,
  onRemove,
}: ActivityInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim() && activities.length < 3) {
      onAdd(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="space-y-3">
      {/* Current activities */}
      {activities.length > 0 && (
        <div className="space-y-2">
          {activities.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-[#1BBE7D]/10 p-2 rounded"
            >
              <span className="text-sm flex-1">
                {activity.activity}
              </span>
              <button
                onClick={() => onRemove(activity.activity)}
                className="text-neutral-400 hover:text-[#E5484D] ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new activity */}
      {activities.length < 3 && (
        <>
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="활동 입력..."
              onKeyPress={(e) =>
                e.key === "Enter" && handleAdd()
              }
              className="flex-1"
            />
            <Button
              onClick={handleAdd}
              disabled={!inputValue.trim()}
              size="sm"
              className="bg-[#1BBE7D] hover:bg-[#1BBE7D]/90"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <p className="text-xs text-neutral-500">제안:</p>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_SUGGESTIONS.slice(0, 6).map(
                (suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (activities.length < 3) {
                        onAdd(suggestion);
                      }
                    }}
                    className="text-xs bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded transition-colors"
                    disabled={activities.length >= 3}
                  >
                    {suggestion}
                  </button>
                ),
              )}
            </div>
          </div>
        </>
      )}

      {activities.length >= 3 && (
        <p className="text-xs text-neutral-500">
          최대 3개까지 추가 가능합니다
        </p>
      )}
    </div>
  );
}