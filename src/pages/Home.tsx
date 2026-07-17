import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: "url('/assets/discord_background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-2">
          <img src="/assets/discord_logo2.png" alt="Harmonica Logo" width={32} height={32} />
          <span className="text-white text-2xl font-extrabold tracking-tight">Harmonica</span>
        </div>
        <Link
          to="/login"
          className="bg-white text-[#5865F2] font-bold px-6 py-2 rounded-full text-sm hover:bg-[#5865F2] hover:text-white transition-colors duration-200"
        >
          Login
        </Link>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-start justify-center px-20 pt-28">
        <h1 className="text-white text-5xl md:text-6xl font-extrabold leading-tight mb-8 max-w-xl">
          친구들과 함께하는
          <br />
          새로운 소통 공간
        </h1>
        <p className="text-gray-200 text-lg max-w-lg mb-5 leading-relaxed">
          Harmonica는 친구, 팀, 커뮤니티를 위한 실시간 소통 플랫폼입니다.
        </p>
        <p className="text-gray-300 text-base max-w-md mb-5 leading-relaxed">
          텍스트 채널에서 자유롭게 대화하고, DM으로 1:1 대화를 나누세요. 음성 채널에 입장해 서로의 화면을 공유하며 더
          가깝게 소통할 수 있어요.
        </p>
      </main>
    </div>
  );
}
