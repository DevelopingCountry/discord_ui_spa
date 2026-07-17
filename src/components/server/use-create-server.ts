import { useMutation, useQueryClient } from "@tanstack/react-query";
import { serversQueryKey } from "@/components/server/use-servers-query";
import { useAuth } from "@/components/auth/AuthContext";
import { API_URL } from "@/lib/config";

export const useCreateServer = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  return useMutation({
    mutationFn: async (data: { serverName: string; imageUrl?: string | null }) => {
      const res = await fetch(`${API_URL}/server`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("서버 생성 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serversQueryKey });
    },
  });
};
