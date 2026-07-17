import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useLeaveServer } from "@/components/server/use-leave-server";

interface LeaveServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  serverName: string;
  serverId: string;
}

export const LeaveServerModal = ({ isOpen, onClose, onBack, serverName, serverId }: LeaveServerModalProps) => {
  const leaveServer = useLeaveServer();

  const handleDelete = () => {
    leaveServer.mutate({ serverId });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-[#313338] text-white border-none max-w-md p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-6 text-center">
          <DialogTitle className="text-2xl font-bold mb-2">{serverName} 떠나기</DialogTitle>
          <DialogDescription className="text-[#B5BAC1] text-center mb-6">
            이 서버에서 나가면 다시 초대를 받아야 하는데 정말 {serverName}에서 나가실 건가요?
          </DialogDescription>

          <div className="flex justify-between mt-6">
            <Button variant="ghost" className="text-white hover:bg-[#4E5058] hover:text-white" onClick={onBack}>
              뒤로 가기
            </Button>
            <Button
              className="bg-[#f2113e] hover:bg-[#ff0f13] text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              나가기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
