import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { dmsQueryKey } from "@/components/dm/use-dms-query";
import { API_URL } from "@/lib/config";

export const useHideDm = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dmId: string) => {
      const res = await fetch(`${API_URL}/dm/visible`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ dmId }),
      });
      if (!res.ok) throw new Error("DM 숨기기 실패");
      return { dmId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dmsQueryKey });
    },
  });
};
