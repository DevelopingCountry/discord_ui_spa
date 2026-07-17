import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { API_URL } from "@/lib/config";
import type { friendsDataType } from "@/components/type/response";

export const friendsQueryKey = ["friends"] as const;

export const useFriendsQuery = () => {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: friendsQueryKey,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/friend`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("친구 목록 조회 실패");
      const data = await res.json();
      return (data.response ?? []) as friendsDataType[];
    },
    enabled: !!accessToken,
  });
};
