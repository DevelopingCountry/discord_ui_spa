import { create } from "zustand";

export interface OnlineFriend {
  friendId: string;
  name: string;
  imageUrl: string;
}

interface OnlineFriendsStore {
  onlineFriends: OnlineFriend[];
  setOnlineFriends: (friends: OnlineFriend[]) => void;
  addOnlineFriend: (friend: OnlineFriend) => void;
  removeOnlineFriend: (friendId: string) => void;
}

export const useOnlineFriendsStore = create<OnlineFriendsStore>((set) => ({
  onlineFriends: [],
  setOnlineFriends: (friends) => set({ onlineFriends: friends }),
  addOnlineFriend: (friend) =>
    set((state) => ({
      onlineFriends: state.onlineFriends.some((f) => f.friendId === friend.friendId)
        ? state.onlineFriends
        : [...state.onlineFriends, friend],
    })),
  removeOnlineFriend: (friendId) =>
    set((state) => ({
      onlineFriends: state.onlineFriends.filter((f) => f.friendId !== friendId),
    })),
}));
