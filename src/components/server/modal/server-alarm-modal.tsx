import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { server } from "@/components/type/response";
import { useUpdateServerAlarm } from "@/components/server/use-update-server-alarm";

interface ServerAlarmModalProps {
  currentServerName: string;
  onClose: () => void;
  isOpen: boolean;
  onBack: () => void;
  currentServer?: server;
}

export default function ServerAlarmModal({ isOpen, onClose, currentServer }: ServerAlarmModalProps) {
  const [disableChannelNotifications, setDisableChannelNotifications] = useState(currentServer?.alarm);
  const { mutate } = useUpdateServerAlarm();

  const handleSubmit = () => {
    mutate(
      { alarm: disableChannelNotifications, serverId: currentServer?.id },
      {
        onSuccess: () => onClose(),
        onError: (err) => console.error("알림 설정 변경 실패:", err),
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#313338] text-white border-none">
        <DialogHeader className="border-b border-[#3f4147] pb-4">
          <DialogTitle className="text-xl font-medium">알림 설정</DialogTitle>
          <div className="text-sm text-[#b5bac1]">{currentServer?.name}</div>
          <button onClick={onClose} className="absolute right-4 top-4 text-[#b5bac1] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* 채널 알림 끄기 */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">채널 알림 끄기</h3>
              <p className="text-xs text-[#b5bac1] mt-1">
                서버의 알림을 끄면 자신이 멘션된 경우 외에는 알림을 표시하지 않습니다.
              </p>
            </div>
            <Switch
              checked={disableChannelNotifications}
              onCheckedChange={setDisableChannelNotifications}
              className="data-[state=checked]:bg-[#5865f2]"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-4 border-[#3f4147]">
          <Button onClick={handleSubmit} className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
            완료
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
