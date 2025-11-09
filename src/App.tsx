import React, { useState } from "react";
import { AppProvider } from "./context/AppContext";
import { GNB } from "./components/layout/GNB";
import { HomePage } from "./components/home/HomePage";
import { CBTSelectionPage } from "./components/cbt/CBTSelectionPage";
import { ThoughtRecordWizard } from "./components/cbt/ThoughtRecordWizard";
import { BehaviorRecordWizard } from "./components/cbt/BehaviorRecordWizard";
import { PHQ9SurveyWizard } from "./components/cbt/PHQ9SurveyWizard";
import { CommunityPage } from "./components/community/CommunityPage";
import { ArchivePage } from "./components/archive/ArchivePage";
import { ReportPage } from "./components/report/ReportPage";
import { SettingsPage } from "./components/settings/SettingsPage";
import { LoginPage } from "./components/auth/LoginPage";
import { Toaster } from "./components/ui/sonner";

type TabId = "home" | "record" | "community" | "report" | "settings";
type RecordView =
  | "selection"
  | "thought-wizard"
  | "behavior-wizard"
  | "archive"
  | "phq9-wizard";
type SettingsView = "main" | "archive";

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsPHQ9, setNeedsPHQ9] = useState(false);

  // Navigation state
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [recordView, setRecordView] = useState<RecordView>("selection");
  const [settingsView, setSettingsView] = useState<SettingsView>("main");

  const handleLogin = (companyId: string) => {
    setIsAuthenticated(true);
    // Mock: Check if user needs PHQ-9 (first login)
    if (companyId === "EMP001") {
      setNeedsPHQ9(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setNeedsPHQ9(false);
    setActiveTab("home");
    setRecordView("selection");
    setSettingsView("main");
  };

  const handlePHQ9Complete = () => {
    console.log("PHQ9 Complete - needsPHQ9 before:", needsPHQ9);
    setNeedsPHQ9(false);
    setActiveTab("home");
    console.log("PHQ9 Complete - setting needsPHQ9 to false");
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    // Reset record view when navigating away and back
    if (tab === "record") {
      setRecordView("selection");
    }
    // Reset settings view
    if (tab === "settings") {
      setSettingsView("main");
    }
  };

  const handleRecordTypeSelect = (type: "thought" | "behavior" | "archive") => {
    if (type === "thought") {
      setRecordView("thought-wizard");
    } else if (type === "behavior") {
      setRecordView("behavior-wizard");
    } else if (type === "archive") {
      setRecordView("archive");
    }
  };

  const handleNavigateToPHQ9 = () => {
    setActiveTab("record");
    setRecordView("phq9-wizard");
  };

  const handleRecordBack = () => {
    setRecordView("selection");
  };

  const handleRecordComplete = () => {
    setRecordView("selection");
    setActiveTab("home");
  };

  const handleSettingsViewChange = (view: SettingsView) => {
    setSettingsView(view);
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <AppProvider>
        <LoginPage onLogin={handleLogin} />
        <Toaster position="top-center" />
      </AppProvider>
    );
  }

  // Show PHQ-9 survey if needed (first login)
  if (needsPHQ9) {
    return (
      <AppProvider>
        <PHQ9SurveyWizard onComplete={handlePHQ9Complete} />
        <Toaster position="top-center" />
      </AppProvider>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomePage
            onNavigateToRecord={() => setActiveTab("record")}
            onNavigateToReport={() => setActiveTab("report")}
            onNavigateToPHQ9={handleNavigateToPHQ9}
          />
        );

      case "record":
        switch (recordView) {
          case "thought-wizard":
            return (
              <ThoughtRecordWizard
                onBack={handleRecordBack}
                onComplete={handleRecordComplete}
              />
            );
          case "behavior-wizard":
            return (
              <BehaviorRecordWizard
                onBack={handleRecordBack}
                onComplete={handleRecordComplete}
              />
            );
          case "archive":
            return <ArchivePage onBack={handleRecordBack} />;
          case "phq9-wizard":
            return <PHQ9SurveyWizard onComplete={handleRecordComplete} />;
          default:
            return (
              <CBTSelectionPage
                onSelectType={handleRecordTypeSelect}
                onNavigateToArchive={() => handleRecordTypeSelect("archive")}
              />
            );
        }

      case "community":
        return <CommunityPage />;

      case "report":
        return <ReportPage onNavigateToRecord={() => setActiveTab("record")} />;

      case "settings":
        return (
          <SettingsPage
            view={settingsView}
            onViewChange={handleSettingsViewChange}
            onLogout={handleLogout}
          />
        );

      default:
        return (
          <HomePage
            onNavigateToRecord={() => setActiveTab("record")}
            onNavigateToReport={() => setActiveTab("report")}
            onNavigateToPHQ9={handleNavigateToPHQ9}
          />
        );
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-neutral-50">
        {renderContent()}
        <GNB activeTab={activeTab} onTabChange={handleTabChange} />
        <Toaster position="top-center" />
      </div>
    </AppProvider>
  );
}
