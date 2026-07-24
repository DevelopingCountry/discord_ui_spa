import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Hash, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCreateChannel } from "@/components/channel/use-create-channel";

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  defaultType: "CHAT" | "VOICE";
}

export const CreateChannelModal = ({ isOpen, onClose, serverId, defaultType }: CreateChannelModalProps) => {
  const [channelType, setChannelType] = useState<"CHAT" | "VOICE">("CHAT");
  const [channelName, setChannelName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate } = useCreateChannel();

  useEffect(() => {
    if (isOpen) setErrorMessage(null);
  }, [isOpen]);

  const handleClose = () => {
    setChannelName("");
    onClose();
  };
  const handleCreateChannel = () => {
    mutate(
      {
        channelName: channelName,
        type: defaultType,
        serverId: serverId,
      },
      {
        onSuccess: () => {
          setErrorMessage(null);
          onClose();
        },
        onError: (err) => {
          setErrorMessage(err.message);
        },
      },
    );
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#313338] text-white border-none max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">채널 만들기</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#B5BAC1]">채널 유형</h4>
            <RadioGroup value={channelType} onValueChange={(value) => setChannelType(value as "CHAT" | "VOICE")}>
              {defaultType === "CHAT" ? (
                <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-[#3F4147]">
                  <div className="flex-1">
                    <Label htmlFor="text" className="text-sm font-medium">
                      텍스트
                    </Label>
                    <p className="text-xs text-[#B5BAC1]">메시지, 이미지, GIF, 이모지, 의견, 농담을 전송하세요</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-[#3F4147]">
                  <div className="flex-1">
                    <Label htmlFor="voice" className="text-sm font-medium">
                      음성
                    </Label>
                    <p className="text-xs text-[#B5BAC1]">음성, 영상, 화면 공유로 함께 어울려요</p>
                  </div>
                </div>
              )}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#B5BAC1]">채널 이름</h4>
            <div className="relative">
              {defaultType === "CHAT" ? (
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#B5BAC1]" />
              ) : (
                <Volume2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#B5BAC1]" />
              )}
              <Input
                value={channelName}
                onChange={(e) => {
                  setChannelName(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="새로운 채널"
                className="pl-10 bg-[#1E1F22] border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            {errorMessage && <p className="text-left text-xs text-red-400 mt-1">{errorMessage}</p>}
          </div>

          <div className="space-y-2"></div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button variant="ghost" onClick={handleClose} className="text-white hover:bg-[#4E5058] hover:text-white">
            취소
          </Button>
          <Button
            onClick={handleCreateChannel}
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
            disabled={!channelName.trim()}
          >
            채널 만들기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
