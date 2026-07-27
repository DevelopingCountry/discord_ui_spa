import React from "react";
import { Bell, Cog, UserPlus, X } from "lucide-react";
import { useRef, useEffect } from "react";

export type ServerModalType = "invite" | "update" | "alarm" | "leave";

interface ServerDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  serverName: string;
  onSelectModal: (modal: ServerModalType) => void;
}

export default function ServerDropdown({ isOpen, onClose, serverName, onSelectModal }: ServerDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectModal = (modal: ServerModalType) => {
    onClose();
    onSelectModal(modal);
  };

  return (
    <div className="absolute top-12 left-0 w-60 bg-[#1e1f22] rounded-md shadow-lg z-50 text-white" ref={dropdownRef}>
      <div className="p-2 text-base font-semibold border-b border-[#35373c]">{serverName}</div>


      <div className="border-t border-[#35373c] py-1">
        <DropdownItem icon={<UserPlus className="w-4 h-4" />} label="초대하기" onClick={() => selectModal("invite")} />
        <DropdownItem icon={<Cog className="w-4 h-4" />} label="서버 설정" onClick={() => selectModal("update")} />
      </div>

      <div className="border-t border-[#35373c] py-1">
        <DropdownItem icon={<Bell className="w-4 h-4" />} label="알림 설정" onClick={() => selectModal("alarm")} />
      </div>

      <div className="border-t border-[#35373c] py-1">
        <DropdownItem
          icon={<X className="w-4 h-4" color={"#FF0E3C"} />}
          label="서버 나가기"
          onClick={() => selectModal("leave")}
        />
      </div>
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
