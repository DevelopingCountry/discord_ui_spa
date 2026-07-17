import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { friendsQueryKey } from "@/components/friend/use-friends-query";
import { API_URL } from "@/lib/config";
import type { friendsDataType } from "@/components/type/response";

export const useSendFriendRequest = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const res = await fetch(`${API_URL}/friend`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ targetId }),
      });
      if (!res.ok) throw new Error("친구 요청 실패");
      const data = await res.json();
      return data.response as friendsDataType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendsQueryKey });
    },
  });
};
