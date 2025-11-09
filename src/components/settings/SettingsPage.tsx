import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import {
  User,
  Bell,
  Moon,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ArchivePage } from "../archive/ArchivePage";
import { toast } from "sonner";

interface SettingsPageProps {
  view?: "main" | "archive";
  onViewChange?: (view: "main" | "archive") => void;
  onLogout?: () => void;
}

export function SettingsPage({
  view = "main",
  onViewChange,
  onLogout,
}: SettingsPageProps) {
  const { user, setUser } = useApp();
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(user?.nickname || "");
  const [notifications, setNotifications] = useState({
    moodReminder: true,
    activityReminder: true,
    communityLikes: false,
  });
  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start: "22:00",
    end: "08:00",
  });
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveNickname = () => {
    if (!newNickname.trim()) {
      toast.error("닉네임을 입력해주세요");
      return;
    }

    // Mock validation
    const forbidden = ["관리자", "admin", "운영자"];
    if (forbidden.some((word) => newNickname.toLowerCase().includes(word))) {
      toast.error("사용할 수 없는 닉네임이에요");
      return;
    }

    if (user) {
      setUser({ ...user, nickname: newNickname });
      toast.success("닉네임이 변경되었어요");
      setIsEditingNickname(false);
    }
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    toast.success(notifications[key] ? "알림이 꺼졌어요" : "알림이 켜졌어요");
  };

  const handleQuietHoursToggle = () => {
    const newState = !quietHours.enabled;
    setQuietHours({ ...quietHours, enabled: newState });
    toast.success(
      newState ? "조용 시간이 설정되었어요" : "조용 시간이 해제되었어요"
    );
  };

  // Show archive view if requested
  if (view === "archive") {
    return <ArchivePage onBack={() => onViewChange?.("main")} />;
  }

  return (
    <div className="pb-20 pt-4 px-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="mb-2">설정</h1>
        <p className="text-neutral-600">개인 정보와 알림을 관리하세요</p>
      </div>

      {/* Profile Section */}
      <Card className="p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#3751FF]/10 flex items-center justify-center">
            <User className="w-6 h-6 text-[#3751FF]" />
          </div>
          <div className="flex-1">
            <h2 className="mb-0.5">{user?.nickname}</h2>
            <p className="text-sm text-neutral-600">{user?.email}</p>
          </div>
        </div>

        <Separator className="my-4" />

        <Dialog open={isEditingNickname} onOpenChange={setIsEditingNickname}>
          <DialogTrigger asChild>
            <button className="flex items-center justify-between w-full text-left py-2 hover:bg-neutral-50 rounded px-2 -mx-2 transition-colors">
              <span className="text-sm">닉네임 변경</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>닉네임 변경</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="nickname">새 닉네임</Label>
                <Input
                  id="nickname"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="닉네임 입력"
                  maxLength={20}
                  className="mt-2"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  {newNickname.length} / 20
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingNickname(false);
                  setNewNickname(user?.nickname || "");
                }}
              >
                취소
              </Button>
              <Button
                onClick={handleSaveNickname}
                className="bg-[#3751FF] hover:bg-[#3751FF]/90"
              >
                저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>

      {/* Notifications */}
      <Card className="p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-neutral-600" />
          <h2>알림 설정</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-0.5">기분 체크 리마인더</p>
              <p className="text-xs text-neutral-500">매일 오후 9시</p>
            </div>
            <Switch
              checked={notifications.moodReminder}
              onCheckedChange={() => handleNotificationToggle("moodReminder")}
              aria-label="기분 체크 리마인더"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-0.5">활동 실천 리마인더</p>
              <p className="text-xs text-neutral-500">계획한 활동 시간에</p>
            </div>
            <Switch
              checked={notifications.activityReminder}
              onCheckedChange={() =>
                handleNotificationToggle("activityReminder")
              }
              aria-label="활동 실천 리마인더"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-0.5">커뮤니티 반응 알림</p>
              <p className="text-xs text-neutral-500">좋아요와 댓글</p>
            </div>
            <Switch
              checked={notifications.communityLikes}
              onCheckedChange={() => handleNotificationToggle("communityLikes")}
              aria-label="커뮤니티 반응 알림"
            />
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm mb-0.5">조용 시간 (DND)</p>
                <p className="text-xs text-neutral-500">
                  설정한 시간에는 알림을 받지 않아요
                </p>
              </div>
              <Switch
                checked={quietHours.enabled}
                onCheckedChange={handleQuietHoursToggle}
                aria-label="조용 시간"
              />
            </div>

            {quietHours.enabled && (
              <div className="grid grid-cols-2 gap-3 mt-3 p-3 bg-neutral-50 rounded-lg">
                <div>
                  <Label
                    htmlFor="quiet-start"
                    className="text-xs text-neutral-600"
                  >
                    시작
                  </Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={quietHours.start}
                    onChange={(e) =>
                      setQuietHours({ ...quietHours, start: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="quiet-end"
                    className="text-xs text-neutral-600"
                  >
                    종료
                  </Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={quietHours.end}
                    onChange={(e) =>
                      setQuietHours({ ...quietHours, end: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-5 h-5 text-neutral-600" />
          <h2>화면</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm mb-0.5">다크 모드</p>
            <p className="text-xs text-neutral-500">눈의 피로를 줄여요</p>
          </div>
          <Switch
            checked={darkMode}
            onCheckedChange={() => {
              setDarkMode(!darkMode);
              toast("다크 모드는 곧 지원될 예정이에요");
            }}
            aria-label="다크 모드"
          />
        </div>
      </Card>

      {/* Support & Info */}
      <Card className="p-5 mb-4">
        <button className="flex items-center justify-between w-full text-left py-2 hover:bg-neutral-50 rounded px-2 -mx-2 transition-colors">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-neutral-600" />
            <span className="text-sm">고객센터</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </button>

        <Separator className="my-2" />

        <button className="flex items-center justify-between w-full text-left py-2 hover:bg-neutral-50 rounded px-2 -mx-2 transition-colors">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-neutral-600" />
            <span className="text-sm">공지사항</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </button>

        <Separator className="my-2" />

        <button className="flex items-center justify-between w-full text-left py-2 hover:bg-neutral-50 rounded px-2 -mx-2 transition-colors">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-neutral-600" />
            <span className="text-sm">이용약관 및 개인정보처리방침</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </button>
      </Card>

      {/* Logout */}
      <Card className="p-5 mb-4">
        <button
          onClick={() => {
            if (onLogout) {
              onLogout();
              toast.success("로그아웃되었습니다");
            } else {
              toast("로그아웃 기능은 데모에서 제공되지 않아요");
            }
          }}
          className="flex items-center justify-between w-full text-left py-2 hover:bg-neutral-50 rounded px-2 -mx-2 transition-colors text-[#E5484D]"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">로그아웃</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>
      </Card>

      {/* Version */}
      <p className="text-center text-xs text-neutral-400 mt-6">Version 5.0.0</p>
    </div>
  );
}
