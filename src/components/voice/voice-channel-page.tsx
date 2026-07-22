import { Camera, CameraOff, Headphones, Mic, MicOff, MonitorUp, PhoneOff, VolumeX, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthContext";
import { useProfileQuery } from "@/components/profile/use-profile-query";
import { useVoiceStore } from "@/components/voice/use-voice-store";
import { VoiceTile } from "@/components/voice/voice-tile";
import {
  joinVoiceChannel,
  leaveVoiceChannel,
  setCameraEnabled,
  setDeafened,
  setMicMuted,
  setScreenShareEnabled,
} from "@/components/voice/voice-connection";

export function VoiceChannelPage({
  channelId,
  channelName,
  serverId,
}: {
  channelId: string;
  channelName?: string;
  serverId?: string;
}) {
  const { userId, accessToken } = useAuth();
  const { data: profile } = useProfileQuery();
  const status = useVoiceStore((s) => s.status);
  const activeChannelId = useVoiceStore((s) => s.channelId);
  const activeChannelName = useVoiceStore((s) => s.channelName);
  const micMuted = useVoiceStore((s) => s.micMuted);
  const deafened = useVoiceStore((s) => s.deafened);
  const cameraOn = useVoiceStore((s) => s.cameraOn);
  const screenSharing = useVoiceStore((s) => s.screenSharing);
  const localStream = useVoiceStore((s) => s.localStream);
  const localSpeaking = useVoiceStore((s) => s.localSpeaking);
  const participants = useVoiceStore((s) => s.participants);

  const isThisChannel = activeChannelId === channelId;
  const isConnectedHere = isThisChannel && status === "connected";
  const isConnectingHere = isThisChannel && status === "connecting";

  const handleJoin = () => {
    if (!userId || !accessToken || !serverId) return;
    void joinVoiceChannel({
      serverId,
      channelId,
      channelName,
      userId,
      nickname: profile?.nickname ?? userId,
      accessToken,
    });
  };

  if (!isConnectedHere && !isConnectingHere) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#b5bac1] gap-3">
        <Volume2 className="w-10 h-10" />
        <p className="text-white font-semibold">{channelName ?? "음성 채널"}</p>
        {status !== "idle" && !isThisChannel && (
          <p className="text-sm">
            현재 다른 음성 채널({activeChannelName ?? "?"})에 연결되어 있습니다. 참가하면 자동으로 이동합니다.
          </p>
        )}
        <Button onClick={handleJoin} disabled={!serverId}>
          참가하기
        </Button>
      </div>
    );
  }

  if (isConnectingHere) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#b5bac1] gap-2">
        <p>연결 중...</p>
      </div>
    );
  }

  const participantList = Object.values(participants);

  return (
    <div className="flex-1 flex flex-col p-4 gap-4">
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 content-start overflow-y-auto">
        <VoiceTile
          displayLabel="나"
          stream={localStream}
          videoEnabled={cameraOn || screenSharing}
          audioMuted={micMuted}
          speaking={localSpeaking}
          isLocal
        />
        {participantList.map((p) => (
          <VoiceTile
            key={p.userId}
            displayLabel={p.nickname ?? p.userId}
            stream={p.stream}
            videoEnabled={p.videoEnabled || p.screenSharing}
            audioMuted={p.audioMuted}
            speaking={p.speaking}
            isLocal={false}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setMicMuted(!micMuted)}>
          {micMuted ? <MicOff className="h-4 w-4 text-red-400" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setDeafened(!deafened)}>
          {deafened ? <VolumeX className="h-4 w-4 text-red-400" /> : <Headphones className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => void setCameraEnabled(!cameraOn)}>
          {cameraOn ? <Camera className="h-4 w-4 text-green-400" /> : <CameraOff className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => void setScreenShareEnabled(!screenSharing)}>
          <MonitorUp className={`h-4 w-4 ${screenSharing ? "text-green-400" : ""}`} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => leaveVoiceChannel()}>
          <PhoneOff className="h-4 w-4 text-red-400" />
        </Button>
      </div>
    </div>
  );
}