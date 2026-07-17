import { useRef, useState, useEffect } from "react";
import { Trash2, Edit, Bell } from "lucide-react";

import { DeleteChannelModal } from "@/components/channel/modal/delete-channel-modal";
import { UpdateChannelModal } from "@/components/channel/modal/update-channel-modal";
import { useAuth } from "@/components/auth/AuthContext";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  channelId: string;
  serverId: string;
  channelName: string;
  creatorId: string;
}

export function ChannelContextMenu({ x, y, onClose, channelId, serverId, channelName, creatorId }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const { userId } = useAuth();

  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (!isDeleteModalOpen) {
          if (!isUpdateModalOpen) {
            console.log("modal을 닫습니다.1");
            onClose();
            return;
          }
        }

        if (!isUpdateModalOpen) {
          if (!isDeleteModalOpen) {
            console.log("modal을 닫습니다.2");
            onClose();
            return;
          }
        }
      }
    };

    const adjustPosition = () => {
      if (menuRef.current) {
        const menuRect = menuRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let newX = x;
        let newY = y;

        if (x + menuRect.width > viewportWidth) {
          newX = viewportWidth - menuRect.width - 10;
        }

        if (y + menuRect.height > viewportHeight) {
          newY = viewportHeight - menuRect.height - 10;
        }

        setPosition({ x: newX, y: newY });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", adjustPosition);

    adjustPosition();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", adjustPosition);
    };
  }, [x, y, onClose, isDeleteModalOpen, isUpdateModalOpen]);

  const handleOpenDeleteModal = () => {
    console.log("채널 삭제 모달 열기");
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    console.log("채널 삭제 모달 닫기");
    setIsDeleteModalOpen(false);
    onClose();
  };

  const handleOpenUpdateChannel = () => {
    console.log("업데이트 모달 열기");
    setIsUpdateModalOpen(true);
  };
  const handleCloseUpdateModal = () => {
    console.log("업데이트 모달 닫기");
    setIsUpdateModalOpen(false);
    onClose();
  };
  return (
    <div
      ref={menuRef}
      className="absolute z-50 min-w-[180px] bg-[#18191c] rounded-md shadow-lg py-2 border border-[#2f3136]"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="text-[#b9bbbe] px-3 py-1 text-xs uppercase font-semibold">채널 관리</div>

      {creatorId === userId ? (
        <>
          <div
            className="flex items-center px-3 py-2 text-[#dcddde] hover:bg-[#4752c4] cursor-pointer"
            onClick={handleOpenUpdateChannel}
          >
            <Edit className="w-4 h-4 mr-2" />
            <span className="text-sm">이름 변경</span>
          </div>

          <div className="border-t border-[#2f3136] my-1"></div>

          <div
            className="flex items-center px-3 py-2 text-[#ed4245] hover:bg-[#ed4245] hover:text-white cursor-pointer"
            onClick={handleOpenDeleteModal}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            <span className="text-sm">채널 삭제</span>
          </div>
          <div className="flex items-center px-3 py-2 text-[#dcddde] hover:bg-[#4752c4] cursor-pointer">
            <Bell className="w-4 h-4 mr-2" />
            <span className="text-sm">알림 설정</span>
          </div>
        </>
      ) : (
        <div className="flex items-center px-3 py-2 text-[#dcddde] hover:bg-[#4752c4] cursor-pointer">
          <Bell className="w-4 h-4 mr-2" />
          <span className="text-sm">알림 설정</span>
        </div>
      )}
      <DeleteChannelModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onBack={handleCloseDeleteModal}
        channelName={channelName}
        channelId={channelId}
        serverId={serverId}
      />
      <UpdateChannelModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onBack={handleCloseUpdateModal}
        channelName={channelName}
        channelId={channelId}
        serverId={serverId}
      />
    </div>
  );
}
