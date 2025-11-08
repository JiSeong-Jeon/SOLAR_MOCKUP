import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { ArrowLeft, ArrowRight, Save, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HelpButton } from '../common/HelpButton';
import { toast } from 'sonner@2.0.3';
import type { ThoughtRecord } from '../../types';

interface ThoughtRecordWizardProps {
  onBack: () => void;
  onComplete: () => void;
}

const EMOTIONS = [
  '슬픔', '불안', '화남', '두려움', '좌절', '외로움', '부끄러움', '죄책감'
];

const COGNITIVE_DISTORTIONS = [
  '흑백논리 (전부 아니면 전무)',
  '과잉일반화 (하나를 전체로)',
  '파국화 (최악만 생각)',
  '감정적 추론 (느낌=사실)',
  '독심술 (타인 생각 단정)',
  '당위적 사고 (~해야 한다)',
];

const EXAMPLE_SITUATIONS = [
  '회의에서 실수했어요',
  '친구가 연락을 안 받아요',
  '과제를 제대로 못했어요',
];

const EXAMPLE_THOUGHTS = [
  '다들 나를 무능하다고 생각할 거야',
  '친구가 나를 싫어하나봐',
  '난 항상 실패해',
];

export function ThoughtRecordWizard({ onBack, onComplete }: ThoughtRecordWizardProps) {
  const { currentDraft, saveDraft, clearDraft, addThoughtRecord } = useApp();
  
  const [step, setStep] = useState(1);
  const [situation, setSituation] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<{ name: string; intensity: number }[]>([]);
  const [automaticThoughts, setAutomaticThoughts] = useState('');
  const [selectedDistortions, setSelectedDistortions] = useState<string[]>([]);
  const [alternativeThought, setAlternativeThought] = useState('');

  // Load draft on mount
  useEffect(() => {
    if (currentDraft && 'situation' in currentDraft) {
      const draft = currentDraft as Partial<ThoughtRecord>;
      setSituation(draft.situation || '');
      setSelectedEmotions(draft.emotions || []);
      setAutomaticThoughts(draft.automaticThoughts || '');
      setSelectedDistortions(draft.cognitiveDistortions || []);
      setAlternativeThought(draft.alternativeThought || '');
      
      // Determine which step to show
      if (draft.alternativeThought) setStep(4);
      else if (draft.cognitiveDistortions && draft.cognitiveDistortions.length > 0) setStep(3);
      else if (draft.automaticThoughts) setStep(3);
      else if (draft.emotions && draft.emotions.length > 0) setStep(2);
    }
  }, [currentDraft]);

  // Auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (situation || selectedEmotions.length > 0 || automaticThoughts || alternativeThought) {
        saveDraft({
          situation,
          emotions: selectedEmotions,
          automaticThoughts,
          cognitiveDistortions: selectedDistortions,
          alternativeThought,
        });
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [situation, selectedEmotions, automaticThoughts, selectedDistortions, alternativeThought]);

  const progressPercent = (step / 4) * 100;

  const handleEmotionToggle = (emotion: string) => {
    const exists = selectedEmotions.find(e => e.name === emotion);
    if (exists) {
      setSelectedEmotions(selectedEmotions.filter(e => e.name !== emotion));
    } else {
      setSelectedEmotions([...selectedEmotions, { name: emotion, intensity: 5 }]);
    }
  };

  const handleEmotionIntensity = (emotion: string, intensity: number) => {
    setSelectedEmotions(
      selectedEmotions.map(e => e.name === emotion ? { ...e, intensity } : e)
    );
  };

  const handleDistortionToggle = (distortion: string) => {
    if (selectedDistortions.includes(distortion)) {
      setSelectedDistortions(selectedDistortions.filter(d => d !== distortion));
    } else {
      setSelectedDistortions([...selectedDistortions, distortion]);
    }
  };

  const handleComplete = async () => {
    const record: ThoughtRecord = {
      id: Date.now().toString(),
      date: new Date(),
      situation,
      emotions: selectedEmotions,
      automaticThoughts,
      cognitiveDistortions: selectedDistortions,
      alternativeThought,
      sharedToCommunity: false,
    };

    addThoughtRecord(record);
    clearDraft();
    
    toast.success('사고기록지가 저장되었어요!');
    onComplete();
  };

  const canProceed = () => {
    switch (step) {
      case 1: return situation.trim().length > 0;
      case 2: return selectedEmotions.length > 0;
      case 3: return automaticThoughts.trim().length > 0;
      case 4: return alternativeThought.trim().length > 0;
      default: return false;
    }
  };

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
          <h1>사고기록지</h1>
          <span className="text-sm text-neutral-500">{step} / 4</span>
        </div>
        
        <Progress value={progressPercent} className="h-2 mb-4" />
      </div>

      {/* Step 1: Situation */}
      {step === 1 && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <h2>어떤 상황이었나요?</h2>
              <HelpButton 
                title="상황 기록하기"
                content={
                  <div className="space-y-2">
                    <p>부정적인 생각이나 감정을 느꼈던 구체적인 상황을 적어주세요.</p>
                    <p className="text-xs text-neutral-500">
                      <strong>팁:</strong> 언제, 어디서, 누구와, 무엇을 했는지 구체적으로 작성하면 더 효과적입니다.
                    </p>
                  </div>
                }
              />
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              부정적인 생각이 들었던 상황을 구체적으로 적어주세요.
            </p>

            <Textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="예: 회의에서 발표를 했는데 질문에 제대로 답하지 못했어요"
              className="min-h-32 mb-4"
              aria-label="상황 입력"
            />

            <div className="space-y-2">
              <p className="text-sm text-neutral-600">예시:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_SITUATIONS.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSituation(ex)}
                    className="text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Button
            onClick={() => setStep(2)}
            disabled={!canProceed()}
            className="w-full bg-[#3751FF] hover:bg-[#3751FF]/90"
          >
            다음 <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Step 2: Emotions */}
      {step === 2 && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <h2>어떤 감정을 느꼈나요?</h2>
              <HelpButton 
                title="감정 선택하기"
                content={
                  <div className="space-y-2">
                    <p>그 상황에서 느꼈던 감정을 모두 선택하고, 각 감정의 강도를 표시해주세요.</p>
                    <p className="text-xs text-neutral-500">
                      <strong>왜 중요할까요?</strong> 감정을 명확히 인식하는 것이 생각을 바꾸는 첫걸음입니다.
                    </p>
                  </div>
                }
              />
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              여러 감정을 선택하고 강도를 조절할 수 있어요.
            </p>

            <div className="space-y-4">
              {EMOTIONS.map((emotion) => {
                const selected = selectedEmotions.find(e => e.name === emotion);
                return (
                  <div key={emotion} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={emotion}
                        checked={!!selected}
                        onCheckedChange={() => handleEmotionToggle(emotion)}
                      />
                      <Label htmlFor={emotion} className="cursor-pointer">
                        {emotion}
                      </Label>
                    </div>
                    
                    {selected && (
                      <div className="ml-6 space-y-1">
                        <div className="flex items-center gap-3">
                          <Slider
                            value={[selected.intensity]}
                            onValueChange={([value]) => handleEmotionIntensity(emotion, value)}
                            min={1}
                            max={10}
                            step={1}
                            className="flex-1"
                            aria-label={`${emotion} 강도`}
                          />
                          <span className="text-sm text-neutral-600 w-8">
                            {selected.intensity}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-neutral-500">
                          <span>약함</span>
                          <span>강함</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

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
              disabled={!canProceed()}
              className="flex-1 bg-[#3751FF] hover:bg-[#3751FF]/90"
            >
              다음 <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Automatic Thoughts & Distortions */}
      {step === 3 && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <h2>어떤 생각이 들었나요?</h2>
              <HelpButton 
                title="자동적 사고 기록하기"
                content={
                  <div className="space-y-2">
                    <p>그 순간 자동적으로 떠올랐던 생각을 있는 그대로 적어주세요.</p>
                    <p className="text-xs text-neutral-500">
                      <strong>예:</strong> "나는 정말 무능해", "다들 나를 이상하게 생각할 거야"
                    </p>
                  </div>
                }
              />
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              그 순간 머릿속에 떠올랐던 생각을 적어주세요.
            </p>

            <Textarea
              value={automaticThoughts}
              onChange={(e) => setAutomaticThoughts(e.target.value)}
              placeholder="예: 나는 정말 무능한 사람이야. 다들 나를 이상하게 봤을 거야."
              className="min-h-32 mb-4"
              aria-label="자동적 사고 입력"
            />

            <div className="space-y-2">
              <p className="text-sm text-neutral-600">예시:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_THOUGHTS.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAutomaticThoughts(ex)}
                    className="text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <h3>인지 왜곡 확인</h3>
              <HelpButton 
                title="인지 왜곡이란?"
                content={
                  <div className="space-y-2">
                    <p>우리가 현실을 왜곡���서 바라보는 비합리적인 사고 패턴입니다.</p>
                    <ul className="text-xs text-neutral-500 space-y-1">
                      <li><strong>흑백논리:</strong> 완벽하지 않으면 실패라고 생각</li>
                      <li><strong>과잉일반화:</strong> 한 번의 실수를 전체로 확대</li>
                      <li><strong>파국화:</strong> 항상 최악의 결과를 예상</li>
                    </ul>
                  </div>
                }
              />
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              이 생각에 어떤 인지 왜곡이 있을까요?
            </p>

            <div className="space-y-2">
              {COGNITIVE_DISTORTIONS.map((distortion) => (
                <div key={distortion} className="flex items-start gap-2">
                  <Checkbox
                    id={distortion}
                    checked={selectedDistortions.includes(distortion)}
                    onCheckedChange={() => handleDistortionToggle(distortion)}
                  />
                  <Label htmlFor={distortion} className="cursor-pointer text-sm">
                    {distortion}
                  </Label>
                </div>
              ))}
            </div>
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
              onClick={() => setStep(4)}
              disabled={!canProceed()}
              className="flex-1 bg-[#3751FF] hover:bg-[#3751FF]/90"
            >
              다음 <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Alternative Thought */}
      {step === 4 && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <h2>대안적 사고</h2>
              <HelpButton 
                title="대안적 사고 만들기"
                content={
                  <div className="space-y-2">
                    <p>부정적인 자동적 사고를 더 균형잡히고 현실적인 생각으로 바꿔보세요.</p>
                    <p className="text-xs text-neutral-500">
                      <strong>팁:</strong> 친한 친구가 같은 상황이라면 뭐라고 말해줄지 생각해보세요.
                    </p>
                  </div>
                }
              />
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              더 균형잡히고 현실적인 생각은 무엇일까요?
            </p>

            <Textarea
              value={alternativeThought}
              onChange={(e) => setAlternativeThought(e.target.value)}
              placeholder="예: 한 번의 실수가 내 능력 전체를 나타내는 것은 아니야. 다들 실수할 때가 있고, 다음번에는 더 잘 준비하면 돼."
              className="min-h-40 mb-4"
              aria-label="대안적 사고 입력"
            />

            <div className="bg-[#3751FF]/5 border border-[#3751FF]/20 rounded-lg p-4">
              <h4 className="text-sm mb-2">💡 대안적 사고 찾기 팁</h4>
              <ul className="text-xs text-neutral-600 space-y-1">
                <li>• 친한 친구가 같은 상황이라면 뭐라고 말해줄까요?</li>
                <li>• 이 생각을 뒷받침하는 증거와 반대되는 증거는?</li>
                <li>• 더 균형잡힌 관점은 무엇일까요?</li>
                <li>• 지나치게 긍정적보다는 현실적이고 합리적으로</li>
              </ul>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button
              onClick={() => setStep(3)}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> 이��
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!canProceed()}
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
            toast.success('임시 저장되었어요');
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
