import React, { useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Activity,
  ArrowLeft,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface ReportDetailPageProps {
  reportId: string;
  onBack: () => void;
}

export function ReportDetailPage({ reportId, onBack }: ReportDetailPageProps) {
  const {
    weeklyReports,
    phq9Surveys,
    thoughtRecords,
    behaviorRecords,
    markReportAsViewed,
  } = useApp();

  const report = weeklyReports.find((r) => r.id === reportId);

  useEffect(() => {
    if (report && !report.isViewed) {
      markReportAsViewed(reportId);
    }
  }, [reportId, report, markReportAsViewed]);

  if (!report) {
    return (
      <div className="pb-20 pt-4 px-4 max-w-lg mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          목록으로
        </Button>
        <Card className="p-12 text-center">
          <p className="text-neutral-500">보고서를 찾을 수 없어요</p>
        </Card>
      </div>
    );
  }

  // Get data for this report
  const reportPhq9Surveys = phq9Surveys.filter((s) =>
    report.phq9SurveyIds.includes(s.id)
  );
  const reportThoughtRecords = thoughtRecords.filter((r) =>
    report.thoughtRecordIds.includes(r.id)
  );
  const reportBehaviorRecords = behaviorRecords.filter((r) =>
    report.behaviorRecordIds.includes(r.id)
  );

  // PHQ-9 분석
  const phq9Data = reportPhq9Surveys
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((survey, index) => ({
      name: `${index + 1}회차`,
      date: new Date(survey.date).toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      }),
      score: survey.score,
    }));

  const latestPHQ9 = reportPhq9Surveys[reportPhq9Surveys.length - 1];
  const previousPHQ9 =
    reportPhq9Surveys.length > 1
      ? reportPhq9Surveys[reportPhq9Surveys.length - 2]
      : null;
  const scoreChange = previousPHQ9 ? latestPHQ9.score - previousPHQ9.score : 0;
  const isImproving = scoreChange < 0;

  // 감정 분석
  const emotionCounts: Record<string, number> = {};
  reportThoughtRecords.forEach((record) => {
    record.emotions.forEach((emotion) => {
      emotionCounts[emotion.name] = (emotionCounts[emotion.name] || 0) + 1;
    });
  });
  const emotionData = Object.entries(emotionCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 부정적 사고 유형
  const distortionCounts: Record<string, number> = {};
  reportThoughtRecords.forEach((record) => {
    record.cognitiveDistortions.forEach((distortion) => {
      const shortName = distortion.split(" - ")[0];
      distortionCounts[shortName] = (distortionCounts[shortName] || 0) + 1;
    });
  });
  const topDistortions = Object.entries(distortionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // 자주 사용한 대안적 사고 유형
  const alternativeDistortionCounts: Record<string, number> = {};
  reportThoughtRecords.forEach((record) => {
    record.alternativeDistortions?.forEach((distortion) => {
      alternativeDistortionCounts[distortion] =
        (alternativeDistortionCounts[distortion] || 0) + 1;
    });
  });
  const topAlternativeDistortions = Object.entries(alternativeDistortionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // 선택 횟수가 가장 적은 대안적 사고 유형
  const leastUsedAlternative =
    Object.entries(alternativeDistortionCounts).length > 0
      ? Object.entries(alternativeDistortionCounts).sort(
          (a, b) => a[1] - b[1]
        )[0]
      : null;

  // 행동 개선 분석
  const clampMood = (value: number) => Math.min(10, Math.max(0, value));

  const getMoodImprovement = (situation: "morning" | "work" | "evening") => {
    return reportBehaviorRecords
      .map((record) => {
        let beforeMood = 0;
        let afterMood = 0;
        const activity = record.activities.find(
          (a) => a.situation === situation
        );
        const alternativeActivity = activity?.activity;
        const negativeActivity = alternativeActivity
          ? `상사 전화 받음`
          : "활동 미실천";

        if (situation === "morning") {
          beforeMood = clampMood(record.morningMood);
          afterMood = clampMood(
            activity ? record.workMood : record.morningMood
          );
        } else if (situation === "work") {
          beforeMood = clampMood(record.workMood);
          afterMood = clampMood(
            activity ? record.eveningMood : record.workMood
          );
        } else {
          beforeMood = clampMood(record.eveningMood);
          afterMood = clampMood(
            activity ? record.eveningMood + 1 : record.eveningMood
          ); // 퇴근 후는 다음날 기분이 없으므로 임의 개선치
        }

        return {
          negativeActivity,
          alternativeActivity,
          beforeMood,
          afterMood,
          improvement: afterMood - beforeMood,
        };
      })
      .filter((item) => item.alternativeActivity)
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, 1);
  };

  const morningImprovements = getMoodImprovement("morning");
  const workImprovements = getMoodImprovement("work");
  const eveningImprovements = getMoodImprovement("evening");
  const behaviorSections = [
    { key: "morning", title: "출근 전", data: morningImprovements[0] },
    { key: "work", title: "업무 중", data: workImprovements[0] },
    { key: "evening", title: "퇴근 후", data: eveningImprovements[0] },
  ];
  const hasBehaviorInsights = behaviorSections.some((section) => section.data);

  return (
    <div className="pb-20 pt-4 px-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={onBack} variant="ghost" className="mb-4 -ml-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          목록으로
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#3751FF] to-[#1BBE7D] flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="mb-1">{report.weekLabel} 보고서</h1>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(report.startDate).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {new Date(report.endDate).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* A. 감정의 변화 */}
      {reportPhq9Surveys.length > 0 && ( // REQ-RPT-004
        <Card className="p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#3751FF]" />
            <h2>A. 감정의 변화</h2>
          </div>

          {/* PHQ-9 점수 */}
          {previousPHQ9 && (
            <div className="mb-6">
              <p className="text-sm text-neutral-600 mb-3">PHQ-9 점수 변화</p>

              <div className="flex items-center justify-between mb-4 p-4 bg-neutral-50 rounded-lg">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">이전 점수</p>
                  <p className="text-2xl">{previousPHQ9.score}점</p>
                </div>
                <div className="flex items-center gap-2">
                  {isImproving ? (
                    <TrendingDown className="w-8 h-8 text-[#1BBE7D]" />
                  ) : (
                    <TrendingUp className="w-8 h-8 text-[#E5484D]" />
                  )}
                  <div className="text-center">
                    <p
                      className={`text-sm ${
                        isImproving ? "text-[#1BBE7D]" : "text-[#E5484D]"
                      }`}
                    >
                      {scoreChange > 0 ? "+" : ""}
                      {scoreChange}점
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">현재 점수</p>
                  <p className="text-2xl">{latestPHQ9.score}점</p>
                </div>
              </div>

              {phq9Data.length > 1 && (
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={phq9Data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        domain={[0, 27]}
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [`${value}점`, "PHQ-9"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#3751FF"
                        strokeWidth={3}
                        dot={{
                          fill: "#3751FF",
                          r: 5,
                          strokeWidth: 2,
                          stroke: "white",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey={() => 10}
                        stroke="#FFB020"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {isImproving ? (
                <div className="p-3 bg-[#1BBE7D]/10 border border-[#1BBE7D]/20 rounded-lg">
                  <p className="text-sm text-[#1BBE7D]">
                    ✨ 우울 점수가 {Math.abs(scoreChange)}점 감소했어요.
                    긍정적인 변화가 보이고 있어요!
                  </p>
                </div>
              ) : scoreChange > 0 ? (
                <div className="p-3 bg-[#FFB020]/10 border border-[#FFB020]/20 rounded-lg">
                  <p className="text-sm text-neutral-700">
                    💭 점수가 조금 올랐지만 괜찮아요. 지속적인 기록과 실천이
                    중요합니다.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-[#3751FF]/10 border border-[#3751FF]/20 rounded-lg">
                  <p className="text-sm text-neutral-700">
                    💙 점수가 안정적이에요. 현재 상태를 잘 유지하고 있어요.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 감정 분석 */}
          {emotionData.length > 0 && (
            <div>
              <p className="text-sm text-neutral-600 mb-3">자주 느낀 감정</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emotionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                      width={60}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`${value}회`, "선택 횟수"]}
                    />
                    <Bar dataKey="count" fill="#3751FF" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* B. 사고 패턴 분석 */}
      {reportThoughtRecords.length > 0 && ( // REQ-RPT-004
        <Card className="p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-[#3751FF]" />
            <h2>B. 사고 패턴 분석</h2>
          </div>

          {topDistortions.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-neutral-600 mb-2">
                자주 나타난 부정적 사고 유형
              </p>
              <div className="space-y-2">
                {topDistortions.map(([distortion, count], index) => (
                  <div key={distortion} className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="border-[#E5484D] text-[#E5484D]"
                    >
                      {index + 1}위
                    </Badge>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm">{distortion}</span>
                      <span className="text-sm text-neutral-500">
                        {count}회
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topAlternativeDistortions.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-neutral-600 mb-2">
                자주 사용한 대안적 사고 유형
              </p>
              <div className="space-y-2">
                {topAlternativeDistortions.map(([distortion, count], index) => (
                  <div key={distortion} className="flex items-center gap-3">
                    <Badge className="bg-[#1BBE7D] hover:bg-[#1BBE7D]/90">
                      {index + 1}위
                    </Badge>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm">{distortion}</span>
                      <span className="text-sm text-neutral-500">
                        {count}회
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {leastUsedAlternative && (
            <div className="p-3 bg-[#3751FF]/5 border border-[#3751FF]/20 rounded-lg">
              <p className="text-sm mb-2 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#3751FF] flex-shrink-0 mt-0.5" />
                <span>
                  <span className="font-semibold text-[#3751FF]">
                    {leastUsedAlternative[0]}
                  </span>{" "}
                  유형을 더 연습해보는 건 어떨까요?
                </span>
              </p>
              <p className="text-xs text-neutral-600">
                다양한 대안적 사고를 시도하면 더 유연한 사고방식을 기를 수
                있어요.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* C. 행동 활성화 분석 */}
      {hasBehaviorInsights && ( // REQ-RPT-004
        <Card className="p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[#1BBE7D]" />
            <h2>C. 행동 활성화 분석</h2>
          </div>

          {behaviorSections.map((section) => {
            if (!section.data || !section.data.alternativeActivity) {
              return null;
            }
            const beforePercent = (section.data.beforeMood / 10) * 100;
            const afterPercent = (section.data.afterMood / 10) * 100;
            const minPercent = Math.min(beforePercent, afterPercent);
            const improvementPercent = Math.abs(afterPercent - beforePercent);
            const improvementLabel =
              section.data.improvement > 0
                ? `+${section.data.improvement.toFixed(1)}점`
                : `${section.data.improvement.toFixed(1)}점`;

            return (
              <div
                key={section.key}
                className="mb-6 last:mb-0 rounded-xl bg-neutral-50 border border-neutral-200 p-4"
              >
                {/* 헤더 */}
                <p className="text-sm text-neutral-700 mb-3 font-medium tracking-tight">
                  {section.title}
                </p>

                {/* 가로 배치: 좌(부정) - 중앙(증감칩) - 우(대안) */}
                <div className="flex items-center justify-between gap-4">
                  {/* 좌: 부정적 행동 */}
                  <div className="flex-1 min-w-0 flex flex-col items-center">
                    <p className="text-xs text-neutral-500 mb-1">부정적 행동</p>
                    <p className="text-sm font-semibold text-neutral-800 text-center leading-snug break-words">
                      {section.data.negativeActivity}
                    </p>
                    <span className="mt-2 text-sm font-bold text-neutral-900">
                      {section.data.beforeMood}점
                    </span>
                  </div>

                  {/* 중앙: 증감(개선) 칩 - 내용에 맞게 fit */}
                  <div className="shrink-0 inline-flex items-center flex flex-col gap-2 px-3 py-2 rounded-lg bg-white border border-neutral-200 shadow-sm">
                    <TrendingUp className="w-10 h-10 text-[#1BBE7D]" />
                    <span className="text-base font-semibold text-[#1BBE7D]">
                      {improvementLabel}
                    </span>
                  </div>

                  {/* 우: 대안적 행동 */}
                  <div className="flex-1 min-w-0 flex flex-col items-center">
                    <p className="text-xs text-neutral-500 mb-1">대안적 행동</p>
                    <p className="text-sm font-semibold text-[#1BBE7D] text-center leading-snug break-words">
                      {section.data.alternativeActivity}
                    </p>
                    <span className="mt-2 text-sm font-bold text-[#1BBE7D]">
                      {section.data.afterMood}점
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* 인사이트 */}
      <Card className="p-5 bg-gradient-to-br from-neutral-50 to-[#1BBE7D]/5">
        <h3 className="mb-3">🌟 이번 주 인사이트</h3>
        <ul className="space-y-2 text-sm text-neutral-600">
          {isImproving && (
            <li className="flex gap-2">
              <span>•</span>
              <span>
                우울 점수가 개선되고 있어요. 지금 하고 계신 노력이 효과를 내고
                있습니다!
              </span>
            </li>
          )}
          {topAlternativeDistortions.length > 0 && (
            <li className="flex gap-2">
              <span>•</span>
              <span>
                대안적 사고를{" "}
                {topAlternativeDistortions.reduce(
                  (sum, [_, count]) => sum + count,
                  0
                )}
                번 연습하셨어요.
              </span>
            </li>
          )}
          {reportBehaviorRecords.filter((r) => r.completed).length > 0 && (
            <li className="flex gap-2">
              <span>•</span>
              <span>계획한 활동을 실천하는 것만으로도 큰 의미가 있어요!</span>
            </li>
          )}
          <li className="flex gap-2">
            <span>•</span>
            <span>
              작은 변화가 모여 큰 변화를 만듭니다. 지금처럼 꾸준히 기록해보세요.
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
