import { Volume2 } from "lucide-react";

// TODO: voice 도메인(WebRTC) 포팅 전 — 임시 플레이스홀더. 다음 단계에서 실제 연결/참여자 UI로 교체.
export function VoiceChannelPage({
  channelName,
}: {
  channelId: string;
  channelName?: string;
  serverId?: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-[#b5bac1] gap-2">
      <Volume2 className="w-10 h-10" />
      <p className="text-white font-semibold">{channelName ?? "음성 채널"}</p>
      <p className="text-sm">음성 채널 기능은 아직 준비 중입니다.</p>
    </div>
  );
}
