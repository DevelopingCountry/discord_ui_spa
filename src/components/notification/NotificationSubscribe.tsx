import { useAuth } from "@/components/auth/AuthContext";
import { useEffect } from "react";
import { connectSocket } from "@/lib/socket";
import { useSocketSubscribe } from "@/components/hooks/useSocketSubscribe";
import { useOnlineFriendsStore, type OnlineFriend } from "@/components/friend/use-online-friends-store";
import {
  useNotificationInboxStore,
  type NotificationType,
} from "@/components/notification/use-notification-inbox-store";
import { useQueryClient } from "@tanstack/react-query";
import { friendsQueryKey } from "@/components/friend/use-friends-query";
import { serverInvitesQueryKey } from "@/components/server/use-server-invites-query";
import { serversQueryKey } from "@/components/server/use-servers-query";
import type { server } from "@/components/type/response";

type NotificationPayload = {
  fromNickname: string;
  fromImageUrl: string;
  message?: string;
  dmId?: string;
  inviteId?: string;
  serverImage?: string;
  serverName?: string;
  serverUrl?: string;
  serverId?: string;
  imageUrl?: string;
};

export default function NotificationSubscribe() {
  const { accessToken } = useAuth();
  const { addNotification } = useNotificationInboxStore();
  const { addOnlineFriend, removeOnlineFriend } = useOnlineFriendsStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    connectSocket(accessToken);
  }, [accessToken]);

  useSocketSubscribe<{ action: string; payload: NotificationPayload }>(`/user/queue/notifications`, (data) => {
    const type = data.action;
    const payload = data.payload;
    console.log("📩 알림 수신:", type, payload);
    switch (type) {
      case "INVITE":
      case "DM":
        addNotification({
          id: crypto.randomUUID(),
          type: type as NotificationType,
          payload,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
        queryClient.invalidateQueries({ queryKey: friendsQueryKey });
        break;
      case "FRIEND_REQUEST":
        // 대기중 탭 배지로 대체됨 — 알림함에는 넣지 않고 friendsQueryKey만 갱신
        queryClient.invalidateQueries({ queryKey: friendsQueryKey });
        break;
      case "FRIEND_ONLINE":
        addOnlineFriend(payload as unknown as OnlineFriend);
        break;
      case "FRIEND_OFFLINE":
        removeOnlineFriend((payload as unknown as { friendId: string }).friendId);
        break;
      case "FRIEND_ACCEPTED":
      case "FRIEND_REJECTED":
        queryClient.invalidateQueries({ queryKey: friendsQueryKey });
        break;
      case "FRIEND_DELETED":
        removeOnlineFriend((payload as unknown as { friendId: string }).friendId);
        queryClient.invalidateQueries({ queryKey: friendsQueryKey });
        break;
      case "SERVER_INVITE_ACCEPTED":
        if (payload.serverId) {
          queryClient.invalidateQueries({ queryKey: serverInvitesQueryKey(payload.serverId) });
        }
        break;
      case "SERVER_UPDATED":
        queryClient.setQueryData<server[]>(serversQueryKey, (prev = []) =>
          prev.map((s) => (s.id === payload.serverId ? { ...s, name: payload.serverName ?? s.name, imageUrl: payload.imageUrl ?? s.imageUrl } : s)),
        );
        break;
      default:
    }
  });

  return null;
}
