import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { dmsQueryKey } from "@/components/dm/use-dms-query";
import { API_URL } from "@/lib/config";
import type { DmList } from "@/components/type/response";

export const useCreateDm = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const res = await fetch(`${API_URL}/dm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ targetId }),
      });
      if (!res.ok) throw new Error("DM 생성 실패");
      const data = await res.json();
      return data.response as DmList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dmsQueryKey });
    },
  });
};
