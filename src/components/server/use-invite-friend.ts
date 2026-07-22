import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { serverInvitesQueryKey } from "@/components/server/use-server-invites-query";
import { API_URL } from "@/lib/config";

export const useInviteFriend = (serverId: string) => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (friendId: string) => {
      const res = await fetch(`${API_URL}/server/${serverId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ guestId: friendId }),
      });
      if (!res.ok) throw new Error("초대 실패");
    },
    onSettled: () => {
      // 성공이든, 이미 초대된 상태(409)로 실패했든 서버 기준으로 버튼 상태를 다시 맞춘다.
      queryClient.invalidateQueries({ queryKey: serverInvitesQueryKey(serverId) });
    },
  });
};
