import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Brain, Activity, Clock, ArrowRight, FolderOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CBTSelectionPageProps {
  onSelectType: (type: 'thought' | 'behavior' | 'archive') => void;
  onNavigateToArchive?: () => void;
}

export function CBTSelectionPage({ onSelectType, onNavigateToArchive }: CBTSelectionPageProps) {
  const { currentDraft, thoughtRecords, behaviorRecords } = useApp();

  const hasDraft = currentDraft !== null;
  const lastThought = thoughtRecords[thoughtRecords.length - 1];
  const lastBehavior = behaviorRecords[behaviorRecords.length - 1];

  return (
    <div className="pb-20 pt-4 px-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="mb-2">기록하기</h1>
        <p className="text-neutral-600">
          오늘은 어떤 기록을 작성하시겠어요?
        </p>
      </div>

      {hasDraft && (
        <Card className="p-4 mb-6 bg-[#FFB020]/10 border-[#FFB020]">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#FFB020] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-[#FFB020] mb-1">작성 중인 기록이 있어요</h3>
              <p className="text-sm text-neutral-600 mb-3">
                이어서 작성하시겠어요?
              </p>
              <Button 
                size="sm" 
                className="bg-[#FFB020] hover:bg-[#FFB020]/90"
                onClick={() => {
                  // Determine type from draft
                  const type = 'situation' in (currentDraft as any) ? 'thought' : 'behavior';
                  onSelectType(type);
                }}
              >
                이어서 작성하기
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 mb-6">
        {/* Thought Record */}
        <Card 
          className="p-5 hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onSelectType('thought')}
          role="button"
          tabIndex={0}
          aria-label="사고기록지 작성하기"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3751FF]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#3751FF]/20 transition-colors">
              <Brain className="w-6 h-6 text-[#3751FF]" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h2>사고기록지</h2>
                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-[#3751FF] transition-colors" />
              </div>
              
              <p className="text-sm text-neutral-600 mb-3">
                부정적인 생각을 포착하고 대안적 사고를 찾아봅니다
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                <span className="bg-neutral-100 px-2 py-1 rounded">상황 기록</span>
                <span className="bg-neutral-100 px-2 py-1 rounded">감정 파악</span>
                <span className="bg-neutral-100 px-2 py-1 rounded">사고 전환</span>
              </div>

              {lastThought && (
                <p className="text-xs text-neutral-500 mt-3">
                  마지막 작성: {new Date(lastThought.date).toLocaleDateString('ko-KR')}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Behavior Record */}
        <Card 
          className="p-5 hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onSelectType('behavior')}
          role="button"
          tabIndex={0}
          aria-label="행동기록지 작성하기"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1BBE7D]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1BBE7D]/20 transition-colors">
              <Activity className="w-6 h-6 text-[#1BBE7D]" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h2>행동기록지</h2>
                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-[#1BBE7D] transition-colors" />
              </div>
              
              <p className="text-sm text-neutral-600 mb-3">
                기분을 개선할 수 있는 활동을 계획하고 실천합니다
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                <span className="bg-neutral-100 px-2 py-1 rounded">현재 상태</span>
                <span className="bg-neutral-100 px-2 py-1 rounded">활동 계획</span>
                <span className="bg-neutral-100 px-2 py-1 rounded">리마인더</span>
              </div>

              {lastBehavior && (
                <p className="text-xs text-neutral-500 mt-3">
                  마지막 작성: {new Date(lastBehavior.date).toLocaleDateString('ko-KR')}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Archive Record */}
        <Card 
          className="p-5 hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onSelectType('archive')}
          role="button"
          tabIndex={0}
          aria-label="기록지 보관함 열기"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFB020]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FFB020]/20 transition-colors">
              <FolderOpen className="w-6 h-6 text-[#FFB020]" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h2>기록지 보관함</h2>
                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-[#FFB020] transition-colors" />
              </div>
              
              <p className="text-sm text-neutral-600 mb-3">
                이전에 작성한 기록지들을 확인하고 관리합니다
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                <span className="bg-neutral-100 px-2 py-1 rounded">사고기록지</span>
                <span className="bg-neutral-100 px-2 py-1 rounded">행동기록지</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="p-5 bg-neutral-50">
        <h3 className="mb-3">💡 작성 팁</h3>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li className="flex gap-2">
            <span className="text-[#3751FF]">•</span>
            <span>부정적인 생각이 들 때는 <strong>사고기록지</strong>를 작성해보세요</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#1BBE7D]">•</span>
            <span>기분이 우울할 때는 <strong>행동기록지</strong>로 활동을 계획하세요</span>
          </li>
          <li className="flex gap-2">
            <span className="text-neutral-400">•</span>
            <span>작성 중 언제든 저장하고 나중에 이어서 쓸 수 있어요</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}