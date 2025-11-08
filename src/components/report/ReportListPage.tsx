import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  FileText,
  ChevronRight,
  Calendar,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

interface ReportListPageProps {
  onSelectReport: (reportId: string) => void;
  onNavigateToRecord?: () => void;
}

export function ReportListPage({
  onSelectReport,
  onNavigateToRecord,
}: ReportListPageProps) {
  const {
    weeklyReports,
    phq9Surveys,
    moodEntries,
    thoughtRecords,
    behaviorRecords,
  } = useApp();

  // REQ-RPT-002: Check if user has any reports to view
  const hasAnyReport = weeklyReports.length > 0;

  // Calculate requirements for next report
  const moodEntriesCount = moodEntries.length;
  const cbtRecordsCount = thoughtRecords.length + behaviorRecords.length;
  const requiredMoodEntries = 7;
  const requiredCBTRecords = 7;
  const moodEntriesFulfilled = moodEntriesCount >= requiredMoodEntries;
  const cbtRecordsFulfilled = cbtRecordsCount >= requiredCBTRecords;

  if (!hasAnyReport) {
    return (
      <div className="pb-20 pt-4 px-4 max-w-lg mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-[#FFB020]/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-[#FFB020]" />
            </div>
            <h2 className="mb-2">결과보고서를 받으려면</h2>
            <p className="text-sm text-neutral-600 mb-6">
              기분 기록 7회와 사고기록 또는 행동기록을 7개 이상
              <br />
              작성하여야 열리는 탭이에요!
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#3751FF]" />
                  <span className="text-sm">기분 기록</span>
                </div>
                <Badge
                  variant={moodEntriesFulfilled ? "default" : "secondary"}
                  className={moodEntriesFulfilled ? "bg-[#1BBE7D]" : ""}
                >
                  {moodEntriesCount}/{requiredMoodEntries}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#3751FF]" />
                  <span className="text-sm">CBT 기록</span>
                </div>
                <Badge
                  variant={cbtRecordsFulfilled ? "default" : "secondary"}
                  className={cbtRecordsFulfilled ? "bg-[#1BBE7D]" : ""}
                >
                  {cbtRecordsCount}/{requiredCBTRecords}
                </Badge>
              </div>
            </div>

            <Button
              onClick={onNavigateToRecord}
              className="bg-[#3751FF] hover:bg-[#3751FF]/90 w-full"
            >
              기록 시작하기
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Sort reports by date (newest first)
  const sortedReports = [...weeklyReports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // REQ-RPT-005: Check for new (unviewed) reports
  const hasUnviewedReports = sortedReports.some((report) => !report.isViewed);

  return (
    <div className="pb-20 pt-4 px-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="mb-2">결과보고서</h1>
        <p className="text-neutral-600">주차별 성장 기록을 확인해보세요</p>
      </div>

      {/* REQ-RPT-005: New Report Alert */}
      {hasUnviewedReports && (
        <Card className="p-4 mb-4 bg-gradient-to-br from-[#3751FF]/5 to-[#1BBE7D]/5 border-[#3751FF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3751FF] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1">새로운 보고서가 도착했어요!</h3>
              <p className="text-sm text-neutral-600">
                지난 주의 성장을 확인해보세요
              </p>
            </div>
          </div>
        </Card>
      )}

      {sortedReports.length > 0 ? (
        <>
          {/* REQ-RPT-003: Next Report Requirements */}
          <Card className="p-4 mb-4 bg-neutral-50">
            <h3 className="mb-2">다음 보고서를 받으려면</h3>
            <p className="text-sm text-neutral-600 mb-3">
              1주 뒤까지 5번의 기분 기록과 3개의 사고기록 또는 행동기록을
              완료해주세요!
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#3751FF]" />
                <span>기분 기록 5회</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1BBE7D]" />
                <span>사고기록 3개</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1BBE7D]" />
                <span>행동기록 2개</span>
              </div>
            </div>
          </Card>

          {/* REQ-RPT-005: Reports List (Table format) */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="w-2/5 p-3 text-left font-semibold text-neutral-600">
                    보고서
                  </th>
                  <th className="w-1/4 p-3 text-left font-semibold text-neutral-600">
                    생성일
                  </th>
                  <th className="w-1/4 p-3 text-left font-semibold text-neutral-600">
                    분석 기간
                  </th>
                  <th className="w-auto p-3 text-right font-semibold text-neutral-600">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {sortedReports.map((report) => (
                  <tr
                    key={report.id}
                    className="cursor-pointer hover:bg-neutral-50 transition-colors"
                    onClick={() => onSelectReport(report.id)}
                  >
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-2">
                        {!report.isViewed && (
                          <div className="w-2 h-2 rounded-full bg-[#E5484D] flex-shrink-0" />
                        )}
                        <span className="truncate">
                          {report.weekLabel} 보고서
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-neutral-600">
                      {new Date(report.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="p-3 text-neutral-600 truncate">
                      {`${new Date(report.startDate).getMonth() + 1}.${new Date(
                        report.startDate
                      ).getDate()}~${
                        new Date(report.endDate).getMonth() + 1
                      }.${new Date(report.endDate).getDate()}`}
                    </td>
                    <td className="p-3 text-right">
                      <Badge
                        variant={report.isViewed ? "secondary" : "default"}
                      >
                        {report.isViewed ? "확인" : "미확인"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        // This part should ideally not be reached if hasAnyReport is false at the top,
        // but as a fallback, show an empty state.
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 mb-4">
            아직 생성된 보고서가 없어요.
            <br />
            꾸준히 기록하면 첫 보고서를 받을 수 있어요!
          </p>
          <Button
            onClick={onNavigateToRecord}
            className="bg-[#3751FF] hover:bg-[#3751FF]/90"
          >
            기록 시작하기
          </Button>
        </Card>
      )}
    </div>
  );
}
