import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { API_URL } from "@/lib/config";

export type InvitableFriend = {
  friendId: string;
  name: string;
  imageUrl: string;
  invited: boolean;
};

export const serverInvitesQueryKey = (serverId: string) => ["server-invites", serverId] as const;

export const useServerInvitesQuery = (serverId: string | undefined, enabled = true) => {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: serverInvitesQueryKey(serverId ?? ""),
    queryFn: async () => {
      console.log("실제 친구를 패치합니다");
      const res = await fetch(`${API_URL}/server/${serverId}/invite-friends`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("초대 가능한 친구 목록 조회 실패");
      const data = await res.json();
      return (data.response ?? []) as InvitableFriend[];
    },
    enabled: !!accessToken && !!serverId && enabled,
  });
};
