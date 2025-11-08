import React, { useState, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import type { MoodEntry } from "../../types";

interface MoodSparklineProps {
  entries: MoodEntry[];
}

export function MoodSparkline({ entries }: MoodSparklineProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate delayed loading - REQ-MAIN-001
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (entries.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-neutral-400 text-sm">
        아직 기록된 데이터가 없습니다
      </div>
    );
  }

  const maxMood = 10;
  const chartHeight = 120;
  const chartWidth = 100;

  const firstDate = new Date(entries[0].date).getTime();
  const lastDate = new Date(entries[entries.length - 1].date).getTime();
  const totalDuration = lastDate - firstDate;

  // REQ-HOME-002: 누락일 skip 후 선 연결
  const points = entries.map((entry, index) => {
    const currentDate = new Date(entry.date).getTime();
    let x;
    if (totalDuration > 0) {
      // 여러 날짜의 데이터가 있을 경우, 날짜 간격에 비례하여 x좌표 계산
      x = ((currentDate - firstDate) / totalDuration) * chartWidth;
    } else {
      // 데이터가 하나뿐일 경우 중앙에 표시
      x = chartWidth / 2;
    }
    const y = chartHeight - (entry.mood / maxMood) * chartHeight;
    return { x, y, entry };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-32"
        role="img"
        aria-label="최근 7일 기분 그래프"
      >
        {/* Grid lines */}
        {[0, 2.5, 5, 7.5, 10].map((value) => {
          const y = chartHeight - (value / maxMood) * chartHeight;
          return (
            <line
              key={value}
              x1="0"
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-neutral-200"
            />
          );
        })}

        {/* Line path */}
        <path
          d={pathD}
          fill="none"
          stroke="#3751FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="#3751FF"
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* Labels */}
      <div className="flex justify-between text-xs text-neutral-500">
        {entries.map((entry, index) => (
          <div key={index} className="flex flex-col items-center min-w-0">
            <span className="truncate">{entry.emoji}</span>
            <span>
              {new Date(entry.date).toLocaleDateString("ko-KR", {
                month: "numeric",
                day: "numeric",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
