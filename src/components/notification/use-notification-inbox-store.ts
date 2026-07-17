import { create } from "zustand";

export type NotificationType = "INVITE" | "DM" | "FRIEND_REQUEST";

export interface InvitePayload {
  inviteId: string;
  serverImage: string;
  serverName: string;
  fromNickname: string;
  fromImageUrl: string;
  serverUrl: string;
}

export interface DmPayload {
  dmId: string;
  fromNickname: string;
  fromImageUrl: string;
  message: string;
}

export interface FriendRequestPayload {
  fromNickname: string;
  fromImageUrl: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  payload: InvitePayload | DmPayload | FriendRequestPayload;
  isRead: boolean;
  createdAt: string;
}

interface NotificationInboxStore {
  notifications: NotificationItem[];
  unreadCount: number;
  setNotifications: (notifications: NotificationItem[], unreadCount: number) => void;
  addNotification: (notification: NotificationItem) => void;
  removeNotification: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationInboxStore = create<NotificationInboxStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications, unreadCount) => set({ notifications, unreadCount }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}));
