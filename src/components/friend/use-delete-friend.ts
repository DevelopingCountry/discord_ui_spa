import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { friendsQueryKey } from "@/components/friend/use-friends-query";
import { API_URL } from "@/lib/config";

export const useDeleteFriend = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`${API_URL}/friend`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("친구 삭제 실패");
      return { userId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendsQueryKey });
    },
  });
};
