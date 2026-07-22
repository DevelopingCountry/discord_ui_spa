import { useEffect, useRef } from "react";
import { MicOff } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface VoiceTileProps {
  displayLabel: string;
  stream: MediaStream | null;
  videoEnabled: boolean;
  audioMuted: boolean;
  isLocal: boolean;
}

export function VoiceTile({ displayLabel, stream, videoEnabled, audioMuted, isLocal }: VoiceTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = videoEnabled && !!stream && stream.getVideoTracks().length > 0;

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = hasVideo ? stream : null;
  }, [stream, hasVideo]);

  return (
    <div className="relative flex aspect-video items-center justify-center rounded-lg bg-[#1e1f22] overflow-hidden">
      {hasVideo ? (
        // 원격 오디오는 voice-connection.ts가 소유한 숨김 <audio>로만 재생됨 — 에코 방지를 위해 항상 muted
        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
      ) : (
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg font-semibold text-white bg-[#5865f2]">
            {displayLabel.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
        {audioMuted && <MicOff className="h-3.5 w-3.5 text-red-400" />}
        <span className="truncate max-w-[10rem]">
          {displayLabel}
          {isLocal ? " (나)" : ""}
        </span>
      </div>
    </div>
  );
}