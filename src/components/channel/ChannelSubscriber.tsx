import { useQueryClient } from "@tanstack/react-query";
import type { channel } from "@/components/type/response";
import { useSocketSubscribe } from "@/components/hooks/useSocketSubscribe";
import { channelsQueryKey } from "@/components/channel/use-channels-query";

interface ChannelSubscriberProps {
  serverId: string;
}

export default function ChannelSubscriber({ serverId }: ChannelSubscriberProps) {
  const queryClient = useQueryClient();

  useSocketSubscribe<channel & { serverId: string; action: "create" | "update" }>(
    serverId ? `/topic/server/${serverId}/channels` : null,
    (data) => {
      const { action, id, name, type, creatorId } = data;
      const filteredData: channel = { id, name, type, creatorId };

      queryClient.setQueryData<channel[]>(channelsQueryKey(serverId), (prev = []) => {
        if (action === "create") {
          if (prev.some((c) => c.id === id)) return prev;
          return [...prev, filteredData];
        }
        if (action === "update") {
          return prev.map((c) => (c.id === id ? { ...c, name } : c));
        }
        return prev;
      });
    },
  );

  return null;
}
