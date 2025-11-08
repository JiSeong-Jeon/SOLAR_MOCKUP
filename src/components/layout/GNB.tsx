import React from 'react';
import { Home, Edit3, Users, BarChart3, Settings } from 'lucide-react';

type TabId = 'home' | 'record' | 'community' | 'report' | 'settings';

interface GNBProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function GNB({ activeTab, onTabChange }: GNBProps) {
  const tabs = [
    { id: 'home' as TabId, label: '홈', icon: Home },
    { id: 'record' as TabId, label: '기록하기', icon: Edit3 },
    { id: 'community' as TabId, label: '커뮤니티', icon: Users },
    { id: 'report' as TabId, label: '결과보고서', icon: BarChart3 },
    { id: 'settings' as TabId, label: '설정', icon: Settings },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 safe-area-bottom z-50"
      role="navigation"
      aria-label="주요 네비게이션"
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-0 transition-colors ${
                isActive ? 'text-[#3751FF]' : 'text-neutral-500'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-6 h-6 mb-1" aria-hidden="true" />
              <span className="text-xs truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
