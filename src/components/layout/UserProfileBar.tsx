import { useProfileQuery } from "@/components/profile/use-profile-query";
import { VoicePanel } from "@/components/voice/voice-panel";
import { ChevronUp, Headphones, Mic, MicOff, Settings, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UserSettingsModal } from "@/components/settings/user-settings-modal";
import { useVoiceStore } from "@/components/voice/use-voice-store";
import { setDeafened, setMicMuted } from "@/components/voice/voice-connection";
import { MicQuickSettings, SpeakerQuickSettings } from "@/components/voice/voice-quick-settings";

const UserProfileBar = ({ stateIcon, statusMessage }: { stateIcon: string; statusMessage: string }) => {
  const { data: profile } = useProfileQuery();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const micMuted = useVoiceStore((s) => s.micMuted);
  const deafened = useVoiceStore((s) => s.deafened);

  const [micPopoverOpen, setMicPopoverOpen] = useState(false);
  const [speakerPopoverOpen, setSpeakerPopoverOpen] = useState(false);
  const micClusterRef = useRef<HTMLDivElement>(null);
  const speakerClusterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!micPopoverOpen && !speakerPopoverOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (micPopoverOpen && !micClusterRef.current?.contains(e.target as Node)) setMicPopoverOpen(false);
      if (speakerPopoverOpen && !speakerClusterRef.current?.contains(e.target as Node)) setSpeakerPopoverOpen(false);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [micPopoverOpen, speakerPopoverOpen]);

  const openFullSettings = () => {
    setMicPopoverOpen(false);
    setSpeakerPopoverOpen(false);
    setSettingsOpen(true);
  };

  return (
    <div>
      <VoicePanel />
      <div className="flex items-center justify-between gap-1 p-2 bg-discordSidebar rounded">
        <div className="flex items-center min-w-0">
          <div className="relative shrink-0">
            <img
              src={profile?.imageUrl || "/assets/discord_blue.png"}
              alt="User Avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="absolute bottom-[-2px] right-[-2px] w-4 h-4 rounded-full bg-discordSidebar p-[2px] flex items-center justify-center border-2 border-[#2b2d31]">
              <img src={stateIcon} alt="Status Icon" width={12} height={12} className="rounded-full" />
            </div>
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{profile?.nickname ?? "..."}</p>
            <p className="text-xs text-gray-400 truncate">{statusMessage}</p>
          </div>
        </div>

        <div className="flex items-center shrink-0">
          <div ref={micClusterRef} className="relative flex items-center">
            <button
              onClick={() => setMicMuted(!micMuted)}
              className="p-1.5 rounded text-[#96989d] hover:text-white hover:bg-[#35373c] transition-colors"
            >
              {micMuted ? <MicOff className="w-[18px] h-[18px] text-red-400" /> : <Mic className="w-[18px] h-[18px]" />}
            </button>
            <button
              onClick={() => {
                setMicPopoverOpen((v) => !v);
                setSpeakerPopoverOpen(false);
              }}
              className="p-0.5 rounded text-[#96989d] hover:text-white hover:bg-[#35373c] transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            {micPopoverOpen && (
              <div className="absolute bottom-full left-0 mb-2 z-50">
                <MicQuickSettings onOpenFullSettings={openFullSettings} />
              </div>
            )}
          </div>

          <div ref={speakerClusterRef} className="relative flex items-center">
            <button
              onClick={() => setDeafened(!deafened)}
              className="p-1.5 rounded text-[#96989d] hover:text-white hover:bg-[#35373c] transition-colors"
            >
              {deafened ? (
                <VolumeX className="w-[18px] h-[18px] text-red-400" />
              ) : (
                <Headphones className="w-[18px] h-[18px]" />
              )}
            </button>
            <button
              onClick={() => {
                setSpeakerPopoverOpen((v) => !v);
                setMicPopoverOpen(false);
              }}
              className="p-0.5 rounded text-[#96989d] hover:text-white hover:bg-[#35373c] transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            {speakerPopoverOpen && (
              <div className="absolute bottom-full left-0 mb-2 z-50">
                <SpeakerQuickSettings onOpenFullSettings={openFullSettings} />
              </div>
            )}
          </div>

          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 rounded text-[#96989d] hover:text-white hover:bg-[#35373c] transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <UserSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default UserProfileBar;