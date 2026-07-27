import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Mail } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { API_URL } from "@/lib/config";
import { serversQueryKey } from "@/components/server/use-servers-query";
import {
  type DmPayload,
  type FriendRequestPayload,
  type InvitePayload,
  type NotificationItem,
  useNotificationInboxStore,
} from "@/components/notification/use-notification-inbox-store";

export default function NotificationInbox() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notifications, unreadCount, setNotifications, removeNotification, markAllRead } =
    useNotificationInboxStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const result = data.response;
        setNotifications(result?.notifications ?? [], result?.unreadCount ?? 0);
      })
      .catch(console.error);
  }, [accessToken, setNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0 && accessToken) {
      markAllRead();
      try {
        await axios.patch(`${API_URL}/notifications/read`, null, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } catch (e) {
        console.error("알림 읽음 처리 실패:", e);
      }
    }
  };

  const handleAccept = async (invite: InvitePayload, id: string) => {
    try {
      await axios.post(`${API_URL}/server/${invite.inviteId}/accept`, null, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      queryClient.invalidateQueries({ queryKey: serversQueryKey });
      await axios.delete(`${API_URL}/notifications/invite/${invite.inviteId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (e) {
      console.error("초대 수락 실패:", e);
    } finally {
      removeNotification(id);
    }
  };

  const renderItem = (n: NotificationItem) => {
    if (n.type === "INVITE") {
      const payload = n.payload as InvitePayload;
      return (
        <div key={n.id} className="flex gap-3 items-start p-3 hover:bg-[#2b2d31] rounded">
          {payload.serverImage ? (
            <img
              src={payload.serverImage}
              alt={payload.serverName}
              width={36}
              height={36}
              className="rounded-full w-9 h-9 object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#5865f2] flex items-center justify-center shrink-0 font-bold text-sm">
              {payload.serverName.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{payload.fromNickname}님의 서버 초대</p>
            <p className="text-xs text-[#b5bac1] truncate">{payload.serverName}</p>
            <button
              onClick={() => handleAccept(payload, n.id)}
              className="text-xs mt-2 px-2 py-1 rounded bg-[#5865f2] hover:bg-[#4752c4]"
            >
              수락하기
            </button>
          </div>
        </div>
      );
    }

    if (n.type === "DM") {
      const payload = n.payload as DmPayload;
      return (
        <div
          key={n.id}
          onClick={() => {
            navigate(`/channels/me/${payload.dmId}`);
            setOpen(false);
          }}
          className="flex gap-3 items-start p-3 hover:bg-[#2b2d31] rounded cursor-pointer"
        >
          <img
            src={payload.fromImageUrl || "/assets/discord_blue.png"}
            alt={payload.fromNickname}
            width={36}
            height={36}
            className="rounded-full w-9 h-9 object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{payload.fromNickname}님의 DM</p>
            <p className="text-xs text-[#b5bac1] truncate">{payload.message}</p>
          </div>
        </div>
      );
    }

    const payload = n.payload as FriendRequestPayload;
    return (
      <div key={n.id} className="flex gap-3 items-start p-3 rounded">
        <img
          src={payload.fromImageUrl || "/assets/discord_blue.png"}
          alt={payload.fromNickname}
          width={36}
          height={36}
          className="rounded-full w-9 h-9 object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{payload.fromNickname}님의 친구 요청</p>
          <p className="text-xs text-[#b5bac1] truncate">친구 요청이 도착했습니다</p>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="fixed top-4 right-4 z-[100]">
      <button
        onClick={toggleOpen}
        className="relative w-10 h-10 rounded-full bg-[#232428] hover:bg-[#2b2d31] flex items-center justify-center text-white"
      >
        <Mail size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[#232428] text-white rounded-lg shadow-lg">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#96989d]">알림이 없습니다.</div>
          ) : (
            <div className="p-1">{notifications.map(renderItem)}</div>
          )}
        </div>
      )}
    </div>
  );
}
