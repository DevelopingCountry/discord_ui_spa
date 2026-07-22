import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import { API_URL } from "@/lib/config";

const KAKAO_CLIENT_ID = "d0e33acc669d3d7994242e6879cefb32";
const REDIRECT_URI = "http://localhost:3000/auth/kakao";

const DEV_TEST_USERS = [
  { email: "dev1@test.local", nickname: "테스트유저1" },
  { email: "dev2@test.local", nickname: "테스트유저2" },
  { email: "dev3@test.local", nickname: "테스트유저3" },
];

export default function LoginPage() {
  const { login, settingUserId } = useAuth();

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = kakaoAuthUrl;
  };

  const handleDevLogin = async (email: string, nickname: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/dev-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nickname }),
      });
      const data = await res.json();
      const { accessToken, userId } = data.response;
      login(accessToken);
      settingUserId(userId);
      localStorage.setItem("accessToken", accessToken);
      window.location.href = "/channels/me";
    } catch (e) {
      console.error("개발용 로그인 실패:", e);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{
        backgroundImage: "url('/assets/discord_login.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center px-10 py-5">
        <Link to="/" className="flex items-center gap-2">
          <img src="/assets/discord_logo2.png" alt="Harmonica" width={32} height={32} />
          <span className="text-white text-xl font-extrabold tracking-tight">Harmonica</span>
        </Link>
      </nav>

      {/* Content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6">
        <div className="flex w-full max-w-4xl bg-[#1e1a50]/95 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          {/* Left: Illustration */}
          <div className="flex-1 flex flex-col items-center justify-center p-14 border-r border-white/10">
            <div className="text-7xl mb-5 animate-bounce">🎵</div>
            <p className="text-white/70 text-base text-center leading-relaxed mb-8">
              음악처럼 흐르는
              <br />
              우리의 대화
            </p>
            <div className="flex flex-col gap-3 w-full max-w-[220px]">
              {[
                { icon: "💬", label: "실시간 텍스트 채팅" },
                { icon: "🎤", label: "음성 채널 지원" },
                { icon: "🖥️", label: "화면 공유" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2.5">
                  <span className="text-base">{icon}</span>
                  <span className="text-white/90 text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Login */}
          <div className="flex-1 flex flex-col justify-center p-14">
            <h1 className="text-white text-3xl font-bold text-center mb-2">돌아오신 것을 환영해요!</h1>
            <p className="text-white/60 text-sm text-center mb-10">다시 만나다니 너무 반가워요!</p>

            <button
              onClick={handleKakaoLogin}
              className="w-full bg-[#FEE500] hover:bg-[#f5dc00] text-[#191600] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-base"
            >
              카카오로 로그인
            </button>

            {import.meta.env.DEV && (
              <div className="mt-4 border border-dashed border-white/20 rounded-xl p-3">
                <p className="text-white/40 text-xs text-center mb-2">개발용 (프로덕션에서는 표시되지 않음)</p>
                <div className="flex gap-2">
                  {DEV_TEST_USERS.map((u) => (
                    <button
                      key={u.email}
                      onClick={() => handleDevLogin(u.email, u.nickname)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white/80 text-xs font-medium py-2 rounded-lg transition-colors"
                    >
                      {u.nickname}로 로그인
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/15" />
              <span className="text-white/40 text-xs">또는</span>
              <div className="flex-1 h-px bg-white/15" />
            </div>

            <p className="text-center text-sm">
              <span className="text-white/55">계정이 필요한가요?</span>
              <button onClick={handleKakaoLogin} className="text-purple-400 hover:underline ml-1 font-semibold">
                가입하기
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
