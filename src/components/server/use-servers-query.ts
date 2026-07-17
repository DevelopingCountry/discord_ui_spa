import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { API_URL } from "@/lib/config";
import type { server } from "@/components/type/response";

export const serversQueryKey = ["servers"] as const;

export const useServersQuery = () => {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: serversQueryKey,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/server`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("서버 목록 조회 실패");
      const data = await res.json();
      return (data.response ?? []) as server[];
    },
    enabled: !!accessToken,
  });
};
