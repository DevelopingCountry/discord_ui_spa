import { useProfileQuery } from "@/components/profile/use-profile-query";
import { UpdateProfileModal } from "@/components/profile/modal/update-profile-modal";
import { VoicePanel } from "@/components/voice/voice-panel";
import { Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";

const UserProfileBar = ({ stateIcon, statusMessage }: { stateIcon: string; statusMessage: string }) => {
  const { data: profile } = useProfileQuery();
  const { logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="p-1.5 rounded text-[#96989d] hover:text-white hover:bg-[#35373c] transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute bottom-10 right-0 w-52 bg-[#111214] rounded-lg shadow-xl border border-[#1e1f22] py-1.5 z-50">
              <div className="px-3 py-2 border-b border-[#1e1f22] mb-1">
                <p className="text-xs font-semibold text-white">{profile?.nickname ?? "..."}</p>
                <p className="text-xs text-[#96989d]">{statusMessage}</p>
              </div>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full text-left px-3 py-1.5 text-sm text-[#dcddde] hover:bg-[#35373c] rounded-sm transition-colors"
              >
                프로필 변경
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  logout();
                }}
                className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

      <UpdateProfileModal
        isOpen={isProfileModalOpen}
        currentNickname={profile?.nickname ?? ""}
        currentImageUrl={profile?.imageUrl}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default UserProfileBar;
