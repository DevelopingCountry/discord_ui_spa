import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import VoiceChannelItem from "@/components/channel/voiceChannel-item";
import ChatChannelItem from "@/components/channel/chatChannel-item";
import { CreateChannelModal } from "@/components/channel/modal/create-channel-modal";
import { useChannelsQuery } from "@/components/channel/use-channels-query";

export default function ChannelSidebar({ serverId }: { serverId: string }) {
  const [isTextOpen, setIsTextOpen] = useState(true);
  const [isVoiceOpen, setIsVoiceOpen] = useState(true);
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [createChannelType, setCreateChannelType] = useState<"CHAT" | "VOICE">("CHAT");
  const { data: channels = [] } = useChannelsQuery(serverId);

  const handleHashClick = (e: React.MouseEvent, type: "CHAT" | "VOICE") => {
    e.stopPropagation();
    setCreateChannelType(type);
    setIsCreateChannelModalOpen(true);
  };
  return (
    <div className="flex flex-col w-full bg-[#2b2d31]">
      <div className="flex-1 overflow-y-auto p-2">
        <Collapsible open={isTextOpen} onOpenChange={setIsTextOpen} className="mb-2">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full p-1 text-xs font-semibold text-[#96989d] hover:text-white">
              <div className="flex items-center">
                <ChevronDown className={`w-3 h-3 mr-0.5 transition-transform ${isTextOpen ? "" : "-rotate-90"}`} />
                <span className="text-xs font-semibold text-[#96989d] hover:text-white">TEXT CHANNELS</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-4 h-4 rounded-sm"
                onClick={(e) => handleHashClick(e, "CHAT")}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul>
              {channels
                .filter((channel) => channel.type === "CHAT")
                .map((channel, index) => (
                  <li key={index}>
                    <ChatChannelItem
                      name={channel.name}
                      channelId={channel.id}
                      serverId={serverId}
                      creatorId={channel.creatorId}
                    />
                  </li>
                ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={isVoiceOpen} onOpenChange={setIsVoiceOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full p-1 text-xs font-semibold text-[#96989d] hover:text-white">
              <div className="flex items-center">
                <ChevronDown className={`w-3 h-3 mr-0.5 transition-transform ${isVoiceOpen ? "" : "-rotate-90"}`} />
                <span className="text-xs font-semibold text-[#96989d] hover:text-white">VOICE CHANNELS</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-4 h-4 rounded-sm"
                onClick={(e) => handleHashClick(e, "VOICE")}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul>
              {channels
                .filter((channel) => channel.type === "VOICE")
                .map((channel, index) => (
                  <li key={index}>
                    <VoiceChannelItem
                      name={channel.name}
                      channelId={channel.id}
                      serverId={serverId}
                      creatorId={channel.creatorId}
                    />
                  </li>
                ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </div>
      <CreateChannelModal
        isOpen={isCreateChannelModalOpen}
        onClose={() => setIsCreateChannelModalOpen(false)}
        serverId={serverId}
        defaultType={createChannelType}
      />
    </div>
  );
}
