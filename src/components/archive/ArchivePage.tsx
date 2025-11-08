import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Search, Download, Brain, Activity, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner@2.0.3';

interface ArchivePageProps {
  onBack?: () => void;
}

export function ArchivePage({ onBack }: ArchivePageProps) {
  const { thoughtRecords, behaviorRecords } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`${format.toUpperCase()} 파일이 다운로드되었어요`);
    setIsExporting(false);
  };

  const filterByDate = (date: Date) => {
    const now = new Date();
    const recordDate = new Date(date);
    
    if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return recordDate >= weekAgo;
    }
    if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return recordDate >= monthAgo;
    }
    return true;
  };

  const filteredThoughts = thoughtRecords
    .filter(record => filterByDate(record.date))
    .filter(record => 
      searchQuery ? 
        record.situation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.automaticThoughts.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.alternativeThought.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredBehaviors = behaviorRecords
    .filter(record => filterByDate(record.date))
    .filter(record => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return record.activities.some(act => 
        act.activity.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="pb-20 pt-4 px-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="mb-2">모아보기</h1>
        <p className="text-neutral-600">
          작성한 기록을 확인하고 패턴을 파악해보세요
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="기록 검색..."
            className="pl-10"
            aria-label="기록 검색"
          />
        </div>

        <div className="flex gap-2">
          <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 기간</SelectItem>
              <SelectItem value="week">최근 7일</SelectItem>
              <SelectItem value="month">최근 30일</SelectItem>
            </SelectContent>
          </Select>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>기록 내보내기</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <p className="text-sm text-neutral-600">
                  모든 기록을 파일로 다운로드할 수 있어요
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExport('csv')}
                    disabled={isExporting}
                    variant="outline"
                    className="flex-1"
                  >
                    CSV 파일
                  </Button>
                  <Button
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    variant="outline"
                    className="flex-1"
                  >
                    PDF 파일
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="thought" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="thought" className="gap-2">
            <Brain className="w-4 h-4" />
            사고기록 ({filteredThoughts.length})
          </TabsTrigger>
          <TabsTrigger value="behavior" className="gap-2">
            <Activity className="w-4 h-4" />
            행동기록 ({filteredBehaviors.length})
          </TabsTrigger>
        </TabsList>

        {/* Thought Records */}
        <TabsContent value="thought" className="space-y-3">
          {filteredThoughts.length === 0 ? (
            <Card className="p-12 text-center">
              <Brain className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">
                {searchQuery || dateFilter !== 'all' 
                  ? '검색 결과가 없어요'
                  : '아직 사고기록이 없어요.\n첫 번째 기록을 작성해보세요!'
                }
              </p>
            </Card>
          ) : (
            filteredThoughts.map((record) => (
              <Card key={record.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-600">
                      {new Date(record.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {record.sharedToCommunity && (
                    <Badge variant="outline" className="text-[#3751FF] border-[#3751FF]">
                      공유됨
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">상황</p>
                    <p className="text-sm line-clamp-2">{record.situation}</p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500 mb-1">감정</p>
                    <div className="flex flex-wrap gap-1">
                      {record.emotions.map((emotion, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {emotion.name} {emotion.intensity}/10
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {record.cognitiveDistortions.length > 0 && (
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">인지왜곡</p>
                      <div className="flex flex-wrap gap-1">
                        {record.cognitiveDistortions.slice(0, 2).map((distortion, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {distortion.split(' ')[0]}
                          </Badge>
                        ))}
                        {record.cognitiveDistortions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{record.cognitiveDistortions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-neutral-500 mb-1">대안적 사고</p>
                    <p className="text-sm text-[#1BBE7D] line-clamp-2">
                      {record.alternativeThought}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Behavior Records */}
        <TabsContent value="behavior" className="space-y-3">
          {filteredBehaviors.length === 0 ? (
            <Card className="p-12 text-center">
              <Activity className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">
                {searchQuery || dateFilter !== 'all'
                  ? '검색 결과가 없어요'
                  : '아직 행동기록이 없어요.\n첫 번째 기록을 작성해보세요!'
                }
              </p>
            </Card>
          ) : (
            filteredBehaviors.map((record) => (
              <Card key={record.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-600">
                      {new Date(record.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {record.completed && (
                    <Badge className="bg-[#1BBE7D] hover:bg-[#1BBE7D]/90">
                      완료
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">시간대별 기분</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-600 w-16">출근 전</span>
                        <div className="flex gap-1 flex-1">
                          {Array.from({ length: 10 }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-4 flex-1 rounded-sm ${
                                idx < record.morningMood ? 'bg-[#3751FF]' : 'bg-neutral-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs w-8 text-right">{record.morningMood}/10</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-600 w-16">업무 중</span>
                        <div className="flex gap-1 flex-1">
                          {Array.from({ length: 10 }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-4 flex-1 rounded-sm ${
                                idx < record.workMood ? 'bg-[#3751FF]' : 'bg-neutral-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs w-8 text-right">{record.workMood}/10</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-600 w-16">퇴근 후</span>
                        <div className="flex gap-1 flex-1">
                          {Array.from({ length: 10 }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-4 flex-1 rounded-sm ${
                                idx < record.eveningMood ? 'bg-[#3751FF]' : 'bg-neutral-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs w-8 text-right">{record.eveningMood}/10</span>
                      </div>
                    </div>
                  </div>

                  {record.activities.length > 0 && (
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">계획된 활동</p>
                      <div className="space-y-1">
                        {record.activities.map((activity, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="text-xs">
                              {activity.situation === 'morning' ? '출근 전' : 
                               activity.situation === 'work' ? '업무 중' : '퇴근 후'}
                            </Badge>
                            <span className="text-[#1BBE7D] line-clamp-1">{activity.activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}