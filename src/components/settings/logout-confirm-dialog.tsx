import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function LogoutConfirmDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="bg-[#313338] border-[#1e1f22] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">로그아웃</DialogTitle>
          <DialogDescription className="text-[#b5bac1]">정말로 로그아웃하시겠어요?</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            className="bg-[#4e5058] hover:bg-[#6d6f78] text-white"
            onClick={onCancel}
          >
            취소
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            로그아웃
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}