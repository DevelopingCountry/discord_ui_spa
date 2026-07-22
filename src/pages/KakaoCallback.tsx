import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function KakaoRedirectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, settingUserId } = useAuth();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code || handled) return;
    setHandled(true);
    fetch(`http://localhost:8080/auth/login/kakao?code=${code}`)
      .then((res) => res.json())
      .then((data) => {
        const { accessToken, userId } = data.response;
        login(accessToken);
        settingUserId(userId);
        localStorage.setItem("accessToken", accessToken);
        window.location.href = "/channels/me";
      })
      .catch((err) => {
        console.error("카카오 로그인 실패:", err);
        navigate("/login");
      });
  }, [searchParams, navigate, login, handled, settingUserId]);

  return (
    <div className="flex h-screen w-screen">
      {/* 서버 사이드바 - discordSidebar #202225 */}
      <div className="flex flex-col items-center gap-2 w-[72px] bg-discordSidebar py-3 shrink-0">
        <Skeleton className="w-12 h-12 rounded-full bg-[#1a1c1e]" />
        <div className="w-8 h-[2px] bg-[#1a1c1e] rounded" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-12 h-12 rounded-[24px] bg-[#1a1c1e]" />
        ))}
      </div>

      {/* 채널 목록 - discord2and3 #2b2d31 */}
      <div className="flex flex-col w-60 bg-discord2and3 p-3 gap-3 shrink-0">
        <Skeleton className="w-full h-8 rounded bg-[#232528]" />
        <div className="flex flex-col gap-2 mt-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-2">
              <Skeleton className="w-4 h-4 rounded bg-[#232528]" />
              <Skeleton className="flex-1 h-4 rounded bg-[#232528]" />
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full bg-[#232528]" />
          <div className="flex flex-col gap-1 flex-1">
            <Skeleton className="w-24 h-3 rounded bg-[#232528]" />
            <Skeleton className="w-16 h-2 rounded bg-[#232528]" />
          </div>
        </div>
      </div>

      {/* 메인 영역 - discord1and4 #313338 */}
      <div className="flex flex-col flex-1 bg-discord1and4">
        <div className="flex items-center gap-3 px-4 h-12 border-b border-black/20">
          <Skeleton className="w-5 h-5 rounded bg-[#2b2d31]" />
          <Skeleton className="w-32 h-4 rounded bg-[#2b2d31]" />
        </div>

        {/* 중앙 스피너 */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="animate-spin text-discordAccent"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              width={48}
              height={48}
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-gray-400 text-sm">로그인 중...</p>
          </div>
        </div>

        <div className="px-4 pb-6">
          <Skeleton className="w-full h-11 rounded-lg bg-[#2b2d31]" />
        </div>
      </div>
    </div>
  );
}
