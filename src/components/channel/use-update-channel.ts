import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { channelsQueryKey } from "@/components/channel/use-channels-query";
import { API_URL } from "@/lib/config";

export const useUpdateChannel = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      serverId,
      channelId,
      channelname,
    }: {
      serverId: string;
      channelId: string;
      channelname: string;
    }) => {
      const res = await fetch(`${API_URL}/server/${serverId}/channel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ channelId: channelId, channelName: channelname }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "채널 업데이트 실패");
      }

      return { channelId, channelname };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: channelsQueryKey(variables.serverId) });
    },
    onError: (error) => {
      console.error("채널 업데이트 실패:", error);
      alert("채널 업데이트에 실패했습니다.");
    },
  });
};
