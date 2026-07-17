import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useServersQuery } from "@/components/server/use-servers-query";
import { useState, useRef } from "react";
import ServerDropdown from "./server-dropdown";
import { ServerInviteModal } from "@/components/server/modal/server-invite-modal";

export default function ServerName() {
  const serverId = useLocation().pathname.split("/")[2];
  const [isActive, setIsActive] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { data: servers = [] } = useServersQuery();
  const containerRef = useRef<HTMLDivElement>(null);
  const currentServer = servers.find((server) => server.id === serverId);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className="flex items-center justify-between py-4 h-12 border-b border-[#1e1f22] shadow-sm hover:bg-[#35373c] cursor-pointer"
        onClick={() => setIsActive(!isActive)}
      >
        <h2 className="font-bold truncate text-white pl-4">{currentServer?.name || "서버 이름 없음"}</h2>
        {isActive ? (
          <ChevronUp className="w-4 h-4 text-white mr-3" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white mr-3" />
        )}
      </div>

      <ServerDropdown
        currentServer={currentServer}
        serverId={serverId}
        isOpen={isActive}
        onClose={() => setIsActive(false)}
        serverName={currentServer?.name || "서버 이름 없음"}
        onInviteClick={() => setIsInviteModalOpen(true)}
      />

      <ServerInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        serverId={serverId}
        serverName={currentServer?.name || "서버 이름 없음"}
      />
    </div>
  );
}
