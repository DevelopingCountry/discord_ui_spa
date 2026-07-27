import { Volume2 } from "lucide-react";
import { useState } from "react";
import { ChannelContextMenu } from "@/components/channel/channel-context-menu";
import { clsx } from "clsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import { useProfileQuery } from "@/components/profile/use-profile-query";
import { joinVoiceChannel } from "@/components/voice/voice-connection";

export default function VoiceChannelItem({
  name,
  channelId,
  serverId,
  creatorId,
}: {
  name: string;
  channelId: string;
  serverId: string;
  creatorId: string;
}) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const navigate = useNavigate();
  const { userId, accessToken } = useAuth();
  const { data: profile } = useProfileQuery();

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleClick = () => {
    navigate(`/channels/${serverId}/${channelId}`);
    if (userId && accessToken) {
      void joinVoiceChannel({
        serverId,
        channelId,
        channelName: name,
        userId,
        nickname: profile?.nickname ?? userId,
        accessToken,
      });
    }
  };

  return (
    <>
      <div onContextMenu={handleContextMenu}>
        <div
          className={clsx(
            "flex items-center gap-1.5 px-2 py-1 rounded text-sm cursor-pointer hover:bg-[#35373c]",
            "text-[#96989d] hover:text-white",
          )}
          onClick={handleClick}
        >
          <Volume2 className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 truncate">{name}</span>
        </div>
      </div>

      {contextMenu && (
        <ChannelContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          channelId={channelId}
          serverId={serverId}
          channelName={name}
          creatorId={creatorId}
        />
      )}
    </>
  );
}