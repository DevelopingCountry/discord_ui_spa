import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { API_URL } from "@/lib/config";

export type DmMessage = {
  messageId: string;
  userId: string;
  nickName: string;
  imageUrl?: string;
  content: string;
  createdAt: string;
};

export const dmMessagesQueryKey = (dmId: string) => ["dm-messages", dmId] as const;

export const useDmMessagesQuery = (dmId: string | undefined) => {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: dmMessagesQueryKey(dmId ?? ""),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/dm/${dmId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("메시지 조회 실패");
      const data = await res.json();
      return (data.response ?? []) as DmMessage[];
    },
    enabled: !!accessToken && !!dmId,
  });
};
