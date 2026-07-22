import { useProfileQuery } from "@/components/profile/use-profile-query";
import { VoicePanel } from "@/components/voice/voice-panel";
import { Settings } from "lucide-react";
import { useState } from "react";
import { UserSettingsModal } from "@/components/settings/user-settings-modal";

const UserProfileBar = ({ stateIcon, statusMessage }: { stateIcon: string; statusMessage: string }) => {
  const { data: profile } = useProfileQuery();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div>
      <VoicePanel />
      <div className="flex items-center justify-between p-2 bg-discordSidebar rounded">
        <div className="flex items-center">
          <div className="relative">
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
          <div className="ml-3">
            <p className="text-sm font-semibold text-white">{profile?.nickname ?? "..."}</p>
            <p className="text-xs text-gray-400">{statusMessage}</p>
          </div>
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className="p-1.5 rounded text-[#96989d] hover:text-white hover:bg-[#35373c] transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <UserSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default UserProfileBar;