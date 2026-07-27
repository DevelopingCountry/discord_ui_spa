import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { API_URL } from "@/lib/config";
import { channelMessagesQueryKey, type ChannelMessage } from "@/components/channel/use-channel-messages-query";
import { patchMessageContent, removeMessage } from "@/lib/message-cache";

export const useUpdateChannelMessage = (channelId: string) => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  return useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const res = await fetch(`${API_URL}/channel/${channelId}/message/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("메시지 수정 실패");
      return { messageId, content };
    },
    onSuccess: ({ messageId, content }) => {
      queryClient.setQueryData<ChannelMessage[]>(channelMessagesQueryKey(channelId), (prev = []) =>
        patchMessageContent(prev, messageId, content),
      );
    },
  });
};

export const useDeleteChannelMessage = (channelId: string) => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  return useMutation({
    mutationFn: async (messageId: string) => {
      const res = await fetch(`${API_URL}/channel/${channelId}/message/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("메시지 삭제 실패");
      return messageId;
    },
    onSuccess: (messageId) => {
      queryClient.setQueryData<ChannelMessage[]>(channelMessagesQueryKey(channelId), (prev = []) =>
        removeMessage(prev, messageId),
      );
    },
  });
};
