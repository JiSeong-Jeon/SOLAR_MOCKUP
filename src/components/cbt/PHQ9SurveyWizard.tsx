import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

interface PHQ9SurveyWizardProps {
  onComplete: () => void;
}

export function PHQ9SurveyWizard({ onComplete }: PHQ9SurveyWizardProps) {
  return (
    <div className="pb-20 pt-4 px-4 max-w-lg mx-auto">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">PHQ-9 설문</h2>
        <p className="text-sm text-neutral-600 mb-4">
          지난 2주 동안, 다음 문제들이 당신을 얼마나 자주 괴롭혔습니까?
        </p>
        <div className="space-y-4">
          <p className="text-center text-neutral-500">
            (설문 내용이 여기에 표시됩니다.)
          </p>
        </div>
        <Button onClick={onComplete} className="w-full mt-6 bg-[#3751FF] hover:bg-[#3751FF]/90">
          제출
        </Button>
      </Card>
    </div>
  );
}
