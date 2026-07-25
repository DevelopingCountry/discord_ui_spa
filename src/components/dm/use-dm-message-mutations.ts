import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { API_URL } from "@/lib/config";
import { dmMessagesQueryKey, type DmMessage } from "@/components/dm/use-dm-messages-query";
import { patchMessageContent, removeMessage } from "@/lib/message-cache";

export const useUpdateDmMessage = (dmId: string) => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  return useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const res = await fetch(`${API_URL}/dm/${dmId}/message/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("메시지 수정 실패");
      return { messageId, content };
    },
    onSuccess: ({ messageId, content }) => {
      queryClient.setQueryData<DmMessage[]>(dmMessagesQueryKey(dmId), (prev = []) =>
        patchMessageContent(prev, messageId, content),
      );
    },
  });
};

export const useDeleteDmMessage = (dmId: string) => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  return useMutation({
    mutationFn: async (messageId: string) => {
      const res = await fetch(`${API_URL}/dm/${dmId}/message/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("메시지 삭제 실패");
      return messageId;
    },
    onSuccess: (messageId) => {
      queryClient.setQueryData<DmMessage[]>(dmMessagesQueryKey(dmId), (prev = []) => removeMessage(prev, messageId));
    },
  });
};
