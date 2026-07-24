import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { channelsQueryKey } from "@/components/channel/use-channels-query";
import { API_URL } from "@/lib/config";

export const useCreateChannel = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  return useMutation({
    mutationFn: async (data: { channelName: string; type: "CHAT" | "VOICE"; serverId: string }) => {
      const res = await fetch(`${API_URL}/server/${data.serverId}/channel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ channelName: data.channelName, type: data.type }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "채널 생성 실패");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: channelsQueryKey(variables.serverId) });
    },
  });
};
