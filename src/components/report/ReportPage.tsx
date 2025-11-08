import React, { useState } from "react";
import { ReportListPage } from "./ReportListPage";
import { ReportDetailPage } from "./ReportDetailPage";
import { useApp } from "../../context/AppContext";

interface ReportPageProps {
  onNavigateToRecord?: () => void;
}

export function ReportPage({ onNavigateToRecord }: ReportPageProps) {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const { markReportAsViewed } = useApp();

  const handleSelectReport = (reportId: string) => {
    setSelectedReportId(reportId);
    // Mark as viewed when user opens the detail page
    markReportAsViewed(reportId);
  };

  const handleBack = () => {
    setSelectedReportId(null);
  };

  if (selectedReportId) {
    return <ReportDetailPage reportId={selectedReportId} onBack={handleBack} />;
  }

  return (
    <ReportListPage
      onSelectReport={handleSelectReport}
      onNavigateToRecord={onNavigateToRecord}
    />
  );
}
