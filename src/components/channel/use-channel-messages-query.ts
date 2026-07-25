import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { API_URL } from "@/lib/config";

export type ChannelMessage = {
  messageId: string;
  userId: string;
  nickName: string;
  imageUrl?: string;
  content: string;
  createdAt: string;
};

export const channelMessagesQueryKey = (channelId: string) => ["channel-messages", channelId] as const;

export const useChannelMessagesQuery = (channelId: string | undefined) => {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: channelMessagesQueryKey(channelId ?? ""),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/channel/${channelId}/messages`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("메시지 조회 실패");
      const data = await res.json();
      return (data.response ?? []) as ChannelMessage[];
    },
    enabled: !!accessToken && !!channelId,
  });
};
