import { Headphones, Mic, MicOff, PhoneOff, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useVoiceStore } from "@/components/voice/use-voice-store";
import { leaveVoiceChannel, setDeafened, setMicMuted } from "@/components/voice/voice-connection";

export function VoicePanel() {
  const status = useVoiceStore((s) => s.status);
  const channelName = useVoiceStore((s) => s.channelName);
  const micMuted = useVoiceStore((s) => s.micMuted);
  const deafened = useVoiceStore((s) => s.deafened);

  if (status === "idle") return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center justify-between gap-2 rounded bg-[#232428] px-2 py-1.5 mb-1.5">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-green-400">
            {status === "connecting" ? "연결 중..." : "음성 연결됨"}
          </p>
          <p className="text-sm text-white truncate">{channelName ?? "음성 채널"}</p>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setMicMuted(!micMuted)}>
                {micMuted ? <MicOff className="h-4 w-4 text-red-400" /> : <Mic className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{micMuted ? "음소거 해제" : "음소거"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setDeafened(!deafened)}>
                {deafened ? <VolumeX className="h-4 w-4 text-red-400" /> : <Headphones className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{deafened ? "듣기 재개" : "소리 끄기(디펜)"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => leaveVoiceChannel()}>
                <PhoneOff className="h-4 w-4 text-red-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>연결 끊기</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}