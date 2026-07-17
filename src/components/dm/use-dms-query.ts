import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { API_URL } from "@/lib/config";
import type { DmList } from "@/components/type/response";

export const dmsQueryKey = ["dms"] as const;

export const useDmsQuery = () => {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: dmsQueryKey,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/dm`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("DM 목록 조회 실패");
      const data = await res.json();
      return (data.response ?? []) as DmList[];
    },
    enabled: !!accessToken,
  });
};
