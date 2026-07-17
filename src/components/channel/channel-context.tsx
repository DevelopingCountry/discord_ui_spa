import { createContext, useContext } from "react";

const ChannelContext = createContext<{ channelId: string } | null>(null);

export const useChannelContext = () => useContext(ChannelContext);

export const ChannelProvider = ({ channelId, children }: { channelId: string; children: React.ReactNode }) => {
  return <ChannelContext.Provider value={{ channelId }}>{children}</ChannelContext.Provider>;
};
