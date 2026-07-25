import { useQueryClient } from "@tanstack/react-query";
import { useSocketSubscribe } from "@/components/hooks/useSocketSubscribe";
import { appendMessage, patchMessageContent, removeMessage } from "@/lib/message-cache";

type MessageEvent<T> = { type: "SEND" | "UPDATE" | "DELETE"; message: T };

export function useMessageSocketSync<T extends { messageId: string; content: string }>(
  destination: string | null,
  queryKey: readonly unknown[],
) {
  const queryClient = useQueryClient();

  useSocketSubscribe<MessageEvent<T>>(destination, (data) => {
    queryClient.setQueryData<T[]>(queryKey, (prev = []) => {
      if (data.type === "SEND") return appendMessage(prev, data.message);
      if (data.type === "UPDATE") return patchMessageContent(prev, data.message.messageId, data.message.content);
      return removeMessage(prev, data.message.messageId);
    });
  });
}
