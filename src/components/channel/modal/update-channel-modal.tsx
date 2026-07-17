import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useUpdateChannel } from "@/components/channel/use-update-channel";

interface DeleteChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  channelName: string;
  channelId: string;
  serverId: string;
}

export const UpdateChannelModal = ({
  isOpen,
  onClose,
  onBack,
  channelName,
  channelId,
  serverId,
}: DeleteChannelModalProps) => {
  const [channelname, setChannelName] = useState(channelName);
  const updateChannel = useUpdateChannel();

  useEffect(() => {
    if (isOpen) {
      console.log("UpdateChannelModal이 열렸습니다.", { channelId, serverId });
    }
  }, [isOpen, channelId, serverId]);

  const handleUpdate = () => {
    console.log("채널 업데이트");
    updateChannel.mutate({ serverId, channelId, channelname });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-[#313338] text-white border-none max-w-md p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-6 text-center">
          <DialogTitle className="text-2xl font-bold mb-2">채널 이름 변경</DialogTitle>
          <DialogDescription className="text-[#B5BAC1] text-center mb-6">채널 이름 변경하세요</DialogDescription>

          <div className="flex flex-col items-center mb-6">
            <div className="w-full space-y-2">
              <div className="text-left text-xs font-semibold text-[#B5BAC1]">채널 이름</div>
              <Input
                value={channelname}
                onChange={(e) => setChannelName(e.target.value)}
                className="bg-[#1E1F22] border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="ghost" className="text-white hover:bg-[#4E5058] hover:text-white" onClick={onBack}>
              뒤로 가기
            </Button>
            <Button
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
              disabled={!channelname.trim()}
              onClick={(e) => {
                e.stopPropagation();
                handleUpdate();
              }}
            >
              변경
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
