import type React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ChevronRight, Users } from "lucide-react";
import { useState } from "react";
import { CustomizeServerModal } from "./customize-server-modal";

interface CreateServerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateServerModal = ({ isOpen, onClose }: CreateServerModalProps) => {
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  const handleCreateOwn = () => {
    setIsCustomizeModalOpen(true);
  };

  return (
    <>
      <Dialog
        open={isOpen && !isCustomizeModalOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="bg-[#313338] text-white border-none max-w-md p-0 overflow-hidden">
          <div className="px-4 pt-4 pb-6 text-center">
            <DialogTitle className="text-2xl font-bold mb-2">서버를 만들어보세요</DialogTitle>
            <DialogDescription className="text-[#B5BAC1] text-center mb-6">
              서버는 나와 친구들이 함께 어울리는 공간입니다. 내 서버를 만들고 대화를 시작해보세요.
            </DialogDescription>

            <div className="space-y-2">
              <ServerOption
                icon={
                  <div className="bg-[#5865F2] p-2 rounded-full">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                }
                label="직접 만들기"
                onClick={handleCreateOwn}
              />
            </div>

            <div className="mt-6 pt-6 border-t border-[#3F4147]">
              <div className="text-center mb-4">
                <p className="text-sm text-[#B5BAC1]">이미 초대장을 받으셨나요?</p>
              </div>
              <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white" onClick={() => {}}>
                서버 참가하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CustomizeServerModal
        isOpen={isCustomizeModalOpen}
        onClose={() => {
          setIsCustomizeModalOpen(false);
          onClose();
        }}
        onBack={() => setIsCustomizeModalOpen(false)}
      />
    </>
  );
};

interface ServerOptionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const ServerOption = ({ icon, label, onClick }: ServerOptionProps) => {
  return (
    <button
      className="w-full flex items-center justify-between p-3 rounded-md hover:bg-[#3F4147] transition"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-[#B5BAC1]" />
    </button>
  );
};
