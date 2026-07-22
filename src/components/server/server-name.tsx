import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useServersQuery } from "@/components/server/use-servers-query";
import { useState, useRef, useEffect } from "react";
import ServerDropdown, { type ServerModalType } from "./server-dropdown";
import { ServerInviteModal } from "@/components/server/modal/server-invite-modal";
import { UpdateServerModal } from "@/components/server/modal/update-server-modal";
import ServerAlarmModal from "@/components/server/modal/server-alarm-modal";
import { LeaveServerModal } from "@/components/server/modal/leave-server-modal";

export default function ServerName() {
  const serverId = useLocation().pathname.split("/")[2];
  const [isActive, setIsActive] = useState(false);
  const [activeModal, setActiveModal] = useState<ServerModalType | null>(null);
  const { data: servers = [] } = useServersQuery();
  const containerRef = useRef<HTMLDivElement>(null);
  const currentServer = servers.find((server) => server.id === serverId);
  const serverName = currentServer?.name || "서버 이름 없음";

  // ServerName은 서버를 전환해도 리마운트되지 않으므로(App.tsx 라우트에 :serverId별 key가 없음),
  // 이전 서버에서 열어둔 드롭다운/모달 상태가 다음 서버로 그대로 넘어오는 걸 막는다.
  useEffect(() => {
    setIsActive(false);
    setActiveModal(null);
  }, [serverId]);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className="flex items-center justify-between py-4 h-12 border-b border-[#1e1f22] shadow-sm hover:bg-[#35373c] cursor-pointer"
        onClick={() => setIsActive(!isActive)}
      >
        <h2 className="font-bold truncate text-white pl-4">{serverName}</h2>
        {isActive ? (
          <ChevronUp className="w-4 h-4 text-white mr-3" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white mr-3" />
        )}
      </div>

      <ServerDropdown
        isOpen={isActive}
        onClose={() => setIsActive(false)}
        serverName={serverName}
        onSelectModal={setActiveModal}
      />

      <ServerInviteModal
        isOpen={activeModal === "invite"}
        onClose={closeModal}
        serverId={serverId}
        serverName={serverName}
      />
      <UpdateServerModal
        serverId={serverId}
        isOpen={activeModal === "update"}
        onClose={closeModal}
        onBack={closeModal}
        currentServerName={serverName}
      />
      <ServerAlarmModal
        currentServer={currentServer}
        currentServerName={serverName}
        isOpen={activeModal === "alarm"}
        onClose={closeModal}
        onBack={closeModal}
      />
      <LeaveServerModal
        isOpen={activeModal === "leave"}
        onClose={closeModal}
        onBack={closeModal}
        serverName={serverName}
        serverId={serverId}
      />
    </div>
  );
}
