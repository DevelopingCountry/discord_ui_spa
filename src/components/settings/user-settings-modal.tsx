import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { VoiceVideoSettings } from "@/components/settings/voice-video-settings";
import { LogoutConfirmDialog } from "@/components/settings/logout-confirm-dialog";

export function UserSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { logout } = useAuth();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  return (
    <>
      <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className="fixed left-[50%] top-[50%] z-50 flex h-[80vh] w-[60vw] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogPrimitive.Title className="sr-only">사용자 설정</DialogPrimitive.Title>

            <DialogPrimitive.Close className="absolute right-4 top-4 z-10 text-[#96989d] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </DialogPrimitive.Close>

            <nav className="w-60 shrink-0 bg-[#2b2d31] py-6 px-2.5 overflow-y-auto">
              <p className="px-2.5 pb-1.5 text-xs font-semibold tracking-wide text-[#96989d] uppercase">경험</p>
              <button
                type="button"
                className="w-full text-left px-2.5 py-1.5 rounded text-sm font-medium bg-[#404249] text-white"
              >
                음성 및 비디오
              </button>

              <div className="my-2 h-px bg-[#3f4147]" />

              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(true)}
                className="w-full text-left px-2.5 py-1.5 rounded text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                로그아웃
              </button>
            </nav>

            <div className="flex-1 overflow-y-auto bg-[#313338]">
              <div className="py-10 px-10">
                <VoiceVideoSettings />
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <LogoutConfirmDialog
        open={logoutConfirmOpen}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          logout();
        }}
      />
    </>
  );
}