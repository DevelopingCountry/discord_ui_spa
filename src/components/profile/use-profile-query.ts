import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { API_URL } from "@/lib/config";
import type { Profile } from "@/components/type/response";

export const profileQueryKey = ["profile"] as const;

export const useProfileQuery = () => {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("프로필 조회 실패");
      const data = await res.json();
      return data.response as Profile;
    },
    enabled: !!accessToken,
  });
};
