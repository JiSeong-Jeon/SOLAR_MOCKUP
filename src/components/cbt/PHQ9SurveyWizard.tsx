import React, { useState } from "react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { useApp } from "../../context/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

const PHQ9_QUESTIONS = [
  "일 또는 여가 활동을 하는 데 흥미나 즐거움을 느끼지 못함",
  "기분이 가라앉거나, 우울하거나, 희망이 없음",
  "잠들기 어렵거나 자주 깨거나 너무 많이 잠",
  "피곤하거나 기운이 없음",
  "식욕이 줄었거나 과식함",
  "자신을 부정적으로 봄",
  "집중하기 어려움",
  "다른 사람들이 알아차릴 정도로 말과 행동이 느리거나 반대로 안절부절 못함",
  "자신을 해치거나 죽는 것이 낫다고 생각함",
];

const ANSWER_OPTIONS = [
  {
    value: 0,
    label: "전혀 그렇지 않다",
    description: "지난 2주 동안 한 번도 없었음",
  },
  { value: 1, label: "며칠 동안", description: "지난 2주 중 며칠 동안" },
  {
    value: 2,
    label: "절반 이상의 날 동안",
    description: "지난 2주의 절반 이상",
  },
  { value: 3, label: "거의 매일", description: "거의 매일 또는 매일" },
];

interface PHQ9SurveyWizardProps {
  onComplete: () => void;
}

export function PHQ9SurveyWizard({ onComplete }: PHQ9SurveyWizardProps) {
  const { addPHQ9Survey } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(9).fill(-1));
  const [showSummary, setShowSummary] = useState(false);

  const handleAnswerChange = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentStep < PHQ9_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    console.log("PHQ9 handleComplete called");
    const totalScore = answers.reduce((sum, answer) => sum + answer, 0);

    addPHQ9Survey({
      id: `phq9_${Date.now()}`,
      date: new Date(),
      score: totalScore,
      answers: answers,
    });

    console.log("PHQ9 survey saved, calling onComplete");
    onComplete();
  };

  const currentAnswer = answers[currentStep];
  const isAnswered = currentAnswer !== -1;
  const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
  const progress = ((currentStep + 1) / PHQ9_QUESTIONS.length) * 100;

  // 점수에 따른 이미지와 색상 가져오기
  const getScoreImage = (score: number) => {
    if (score <= 4) return "/SOLAR_MOCKUP/images/Normal.png"; // 최소 수준 (정상)
    if (score <= 9) return "/SOLAR_MOCKUP/images/Mild depression.png"; // 경미한 수준
    if (score <= 14) return "/SOLAR_MOCKUP/images/Moderate depression.png"; // 중간 수준
    if (score <= 19) return "/SOLAR_MOCKUP/images/Marked depression.png"; // 중간-심각 수준
    return "/SOLAR_MOCKUP/images/Severe depression.png"; // 심각한 수준
  };

  const getScoreColor = (score: number) => {
    if (score <= 4) return "text-[#1BBE7D]";
    if (score <= 9) return "text-[#3751FF]";
    if (score <= 14) return "text-[#FFB020]";
    if (score <= 19) return "text-[#FF6B35]";
    return "text-[#E5484D]";
  };

  const normalizedScore = Math.round((totalScore / 27) * 100);

  return (
    <>
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent
          hideCloseButton
          preventInteractOutside
          className="sm:max-w-lg p-8"
        >
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-[#171717]">
              PHQ-9 설문조사 완료
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center py-8 space-y-8">
            {/* Assets 이미지 */}
            <div className="w-32 h-32 flex items-center justify-center">
              <img
                src={getScoreImage(totalScore)}
                alt="우울 수준 이미지"
                className="w-full h-full object-contain"
              />
            </div>

            {/* 100점 기준 점수 */}
            <div className="text-center space-y-4">
              <p className="text-sm text-[#525252]">기분 점수</p>
              <p className={`text-6xl font-bold ${getScoreColor(totalScore)}`}>
                {normalizedScore} / 100점
              </p>
            </div>

            {/* 안내 문구 */}
            <div
              className="bg-[#3751FF]/10 border border-[#3751FF]/20 rounded-xl p-4 w-full mt-24"
              style={{ marginTop: "2rem" }}
            >
              <p className="text-xs text-[#525252] text-center leading-relaxed">
                이 결과는 자가 진단 도구이며 전문적인 의학적 진단을 대체할 수
                없습니다.
              </p>
            </div>

            {/* 확인 버튼 */}
            <Button
              onClick={handleComplete}
              className="w-full h-12 bg-[#3751FF] hover:bg-[#3751FF]/90 text-white font-medium rounded-lg"
              style={{ marginTop: "2rem" }}
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-2xl py-12">
          {/* Progress Section */}
          <div className="mb-8 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-[#171717]">
                질문 {currentStep + 1} / {PHQ9_QUESTIONS.length}
              </p>
              <p className="text-sm text-[#525252]">
                {Math.round(progress)}% 완료
              </p>
            </div>
            <Progress value={progress} className="h-2 bg-[#E5E5E5]" />
            <p className="text-xs text-[#A3A3A3]">
              지난 2주 동안, 다음의 문제들로 인해 얼마나 자주 방해를 받았습니까?
            </p>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-[#171717] leading-relaxed">
              {PHQ9_QUESTIONS[currentStep]}
            </h3>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {ANSWER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswerChange(option.value)}
                className={`w-full flex items-center space-x-4 p-4 rounded-xl border-2 transition-all ${
                  currentAnswer === option.value
                    ? "border-[#3751FF] bg-[#3751FF]/5"
                    : "border-[#E5E5E5] bg-[#FAFAFA] hover:border-[#D4D4D4]"
                }`}
              >
                {/* Radio Button */}
                <div
                  className={`flex-shrink-0 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${
                    currentAnswer === option.value
                      ? "border-[#3751FF]"
                      : "border-[#D4D4D4]"
                  }`}
                >
                  {currentAnswer === option.value && (
                    <div className="w-[10px] h-[10px] rounded-full bg-[#3751FF]"></div>
                  )}
                </div>

                {/* Option Content */}
                <div className="flex-1 text-left space-y-0.5">
                  <p className="text-base font-medium text-[#171717]">
                    {option.label}
                  </p>
                  <p className="text-sm text-[#525252]">{option.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1 h-12 border-[#E5E5E5] text-[#171717] font-medium rounded-lg"
              >
                이전
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`h-12 bg-[#3751FF] hover:bg-[#3751FF]/90 text-white font-medium rounded-lg ${
                currentStep === 0 ? "w-full" : "flex-1"
              }`}
            >
              {currentStep === PHQ9_QUESTIONS.length - 1 ? "완료" : "다음"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
