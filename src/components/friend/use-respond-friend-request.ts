import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { friendsQueryKey } from "@/components/friend/use-friends-query";
import { API_URL } from "@/lib/config";

export const useRespondFriendRequest = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ friendId, isFriend }: { friendId: string; isFriend: "ACCEPTED" | "REJECTED" }) => {
      const res = await fetch(`${API_URL}/friend`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ friendId, isFriend }),
      });
      if (!res.ok) throw new Error("친구 요청 응답 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendsQueryKey });
    },
  });
};
