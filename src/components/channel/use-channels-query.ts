import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { API_URL } from "@/lib/config";
import type { channel } from "@/components/type/response";

export const channelsQueryKey = (serverId: string) => ["channels", serverId] as const;

export const useChannelsQuery = (serverId: string | undefined) => {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: channelsQueryKey(serverId ?? ""),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/server/${serverId}/channel`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("채널 목록 조회 실패");
      const data = await res.json();
      return (data.response ?? []) as channel[];
    },
    enabled: !!accessToken && !!serverId,
  });
};
