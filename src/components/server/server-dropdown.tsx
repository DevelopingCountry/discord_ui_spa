import React, { useState } from "react";
import { Bell, Cog, Gift, UserPlus, X } from "lucide-react";
import { useRef, useEffect } from "react";
import { UpdateServerModal } from "@/components/server/modal/update-server-modal";
import ServerAlarmModal from "@/components/server/modal/server-alarm-modal";
import type { server } from "@/components/type/response";
import { LeaveServerModal } from "@/components/server/modal/leave-server-modal";
import { ServerInviteModal } from "@/components/server/modal/server-invite-modal";

interface ServerDropdownProps {
  serverId: string;
  isOpen: boolean;
  onClose: () => void;
  serverName: string;
  currentServer?: server;
  onInviteClick: () => void;
}

export default function ServerDropdown({
  isOpen,
  onClose,
  serverName,
  serverId,
  currentServer,
  onInviteClick,
}: ServerDropdownProps) {
  const [isUpdateSeverInfoModalOpen, setIsUpdateSeverInfoModalOpen] = useState(false);
  const [isSeverAlarmModalOpen, setIsSeverAlarmModalOpen] = useState(false);
  const [isLeaveServerModalOpen, setIsLeaveServerModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUpdateSeverInfoModalOpen || isSeverAlarmModalOpen) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, isUpdateSeverInfoModalOpen, isSeverAlarmModalOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-12 left-0 w-60 bg-[#1e1f22] rounded-md shadow-lg z-50 text-white" ref={dropdownRef}>
      <div className="p-2 text-base font-semibold border-b border-[#35373c]">{serverName}</div>

      <div className="py-1">
        <DropdownItem icon={<Gift className="w-4 h-4" />} label="서버 부스트" />
      </div>

      <div className="border-t border-[#35373c] py-1">
        <DropdownItem
          icon={<UserPlus className="w-4 h-4" />}
          label="초대하기"
          onClick={() => {
            onClose();
            onInviteClick();
          }}
        />
        <DropdownItem
          icon={<Cog className="w-4 h-4" />}
          label="서버 설정"
          onClick={() => setIsUpdateSeverInfoModalOpen(true)}
        />
      </div>

      <div className="border-t border-[#35373c] py-1">
        <DropdownItem
          icon={<Bell className="w-4 h-4" />}
          label="알림 설정"
          onClick={() => setIsSeverAlarmModalOpen(true)}
        />
      </div>

      <div className="border-t border-[#35373c] py-1">
        <DropdownItem
          icon={<X className="w-4 h-4" color={"#FF0E3C"} />}
          label="서버 나가기"
          onClick={() => setIsLeaveServerModalOpen(true)}
        />
      </div>

      <ServerInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        serverId={serverId}
        serverName={serverName}
      />
      <LeaveServerModal
        isOpen={isLeaveServerModalOpen}
        onClose={() => setIsLeaveServerModalOpen(false)}
        onBack={() => setIsLeaveServerModalOpen(false)}
        serverName={serverName}
        serverId={serverId}
      />
      <UpdateServerModal
        serverId={serverId}
        isOpen={isUpdateSeverInfoModalOpen}
        onClose={() => {
          setIsUpdateSeverInfoModalOpen(false);
          onClose();
        }}
        currentServerName={serverName}
        onBack={() => setIsUpdateSeverInfoModalOpen(false)}
      />
      <ServerAlarmModal
        currentServer={currentServer}
        currentServerName={serverName}
        isOpen={isSeverAlarmModalOpen}
        onClose={() => {
          setIsSeverAlarmModalOpen(false);
          onClose();
        }}
        onBack={() => setIsSeverAlarmModalOpen(false)}
      />
    </div>
  );
}

interface DropdownItemProps {
  icon: React.ReactNode;
  label: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
}

function DropdownItem({ icon, label, rightElement, onClick }: DropdownItemProps) {
  return (
    <div className="flex items-center justify-between px-2 py-1.5 hover:bg-[#5865f2] cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
}
