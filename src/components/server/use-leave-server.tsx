import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { serversQueryKey } from "@/components/server/use-servers-query";
import { API_URL } from "@/lib/config";

export const useLeaveServer = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async ({ serverId }: { serverId: string }) => {
      const res = await fetch(`${API_URL}/server/${serverId}/leave`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "서버 나가기 실패");
      }

      return { serverId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serversQueryKey });
    },
    onError: (error) => {
      console.error("서버 나가기 실패:", error);
      alert("서버 나가기에 실패했습니다.");
    },
  });
};
