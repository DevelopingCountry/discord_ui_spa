import { Hash } from "lucide-react";
import { useState } from "react";
import { ChannelContextMenu } from "@/components/channel/channel-context-menu";
import { useLocation, useNavigate } from "react-router-dom";

export default function ChatChannelItem({
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
  const s = useLocation().pathname;
  const currentChannelId = s.split("/");
  let isActive = false;
  if (currentChannelId.length > 3) {
    isActive = currentChannelId[3] === channelId;
  }
  const navigate = useNavigate();

  const handleChannelClick = () => {
    navigate(`/channels/${serverId}/${channelId}`);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <>
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm cursor-pointer ${
          isActive ? "bg-[#393c41] text-white" : "text-[#96989d] hover:text-white hover:bg-[#35373c]"
        }`}
        onClick={handleChannelClick}
        onContextMenu={handleContextMenu}
      >
        <Hash className="w-5 h-5 text-[#96989d]" />
        {name}
      </div>

      {contextMenu && (
        <ChannelContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
          channelId={channelId}
          serverId={serverId}
          creatorId={creatorId}
          channelName={name}
        />
      )}
    </>
  );
}
