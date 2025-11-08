import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Heart,
  MessageCircle,
  MoreVertical,
  AlertTriangle,
  UserX,
  Share2,
  Info,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { toast } from "sonner";
import type { CommunityPost } from "../../types";

export function CommunityPage() {
  const { user, communityPosts, guideStatus } = useApp();
  const [posts, setPosts] = useState(communityPosts);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const canPost = guideStatus === "passed";

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleReport = (postId: string) => {
    toast.success(
      "신고가 접수되었어요. 검토까지 최대 24시간이 걸릴 수 있어요."
    );
  };

  const handleBlock = (userId: string) => {
    setPosts(posts.filter((post) => post.userId !== userId));
    toast.success(
      "사용자를 차단했어요. 더 이상 이 사용자의 글이 보이지 않습니다."
    );
  };

  const handlePost = async () => {
    if (!newPostContent.trim()) return;

    setIsPosting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      userId: user?.id || "current-user",
      nickname: user?.nickname || "나",
      content: newPostContent,
      createdAt: new Date(),
      likes: 0,
      commentCount: 0,
      isLiked: false,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setIsPosting(false);
    toast.success("공유되었어요! 🎉");
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );

    if (seconds < 60) return "방금 전";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    return `${Math.floor(seconds / 86400)}일 전`;
  };

  return (
    <div className="pb-20 pt-4 px-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="mb-2">커뮤니티</h1>
        <p className="text-neutral-600">
          다른 사람들의 실천에서 영감을 얻어보세요
        </p>
      </div>

      {/* Guidelines Banner */}
      <Card className="p-4 mb-4 bg-[#3751FF]/5 border-[#3751FF]/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#3751FF] flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="mb-2">
              <strong>커뮤니티 가이드라인</strong>
            </p>
            <ul className="text-xs text-neutral-600 space-y-1">
              <li>• 서로를 존중하고 따뜻한 말로 응원해주세요</li>
              <li>• 개인정보나 민감한 내용은 공유하지 마세요</li>
              <li>• 부적절한 내용은 신고해주세요</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* New Post */}
      {
        <Card className="p-4 mb-6">
          <Textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="오늘의 경험이나 배움을 공유해보세요..."
            className="mb-3 min-h-24"
            maxLength={500}
            aria-label="새 게시글 작성"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              {newPostContent.length} / 500
            </span>
            <Button
              onClick={handlePost}
              disabled={!newPostContent.trim() || isPosting}
              size="sm"
              className="bg-[#3751FF] hover:bg-[#3751FF]/90"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {isPosting ? "공유 중..." : "공유하기"}
            </Button>
          </div>
        </Card>
      }

      {/* Posts Feed */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-neutral-500">
              아직 게시글이 없어요.
              <br />첫 번째로 경험을 공유해보세요!
            </p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{post.nickname}</span>
                    <span className="text-xs text-neutral-500">
                      {formatTimeAgo(post.createdAt)}
                    </span>
                  </div>
                </div>

                {/* More Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="text-neutral-400 hover:text-neutral-600 p-1"
                      aria-label="더보기"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {post.userId !== user?.id && (
                      <>
                        <DropdownMenuItem
                          onClick={() => handleReport(post.id)}
                          className="text-[#E5484D]"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          신고하기
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBlock(post.userId)}
                          className="text-[#E5484D]"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          차단하기
                        </DropdownMenuItem>
                      </>
                    )}
                    {post.userId === user?.id && (
                      <DropdownMenuItem className="text-neutral-600">
                        삭제하기
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Content */}
              <p className="text-sm mb-4 whitespace-pre-wrap line-clamp-3">
                {post.content}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-3 border-t border-neutral-100">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    post.isLiked
                      ? "text-[#E5484D]"
                      : "text-neutral-500 hover:text-[#E5484D]"
                  }`}
                  aria-label={post.isLiked ? "좋아요 취소" : "좋아요"}
                >
                  <Heart
                    className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`}
                  />
                  <span>{post.likes}</span>
                </button>

                <button
                  className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-[#3751FF] transition-colors"
                  aria-label="댓글"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.commentCount}</span>
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {posts.length > 0 && (
        <div className="mt-6 text-center">
          <Button variant="outline" className="w-full">
            더 보기
          </Button>
        </div>
      )}
    </div>
  );
}
