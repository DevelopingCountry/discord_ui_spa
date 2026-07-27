import type React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Camera, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useUpdateProfile } from "@/components/profile/use-update-profile";

interface UpdateProfileModalProps {
  isOpen: boolean;
  currentNickname: string;
  currentImageUrl?: string | null;
  onClose: () => void;
}

export const UpdateProfileModal = ({ isOpen, currentNickname, currentImageUrl, onClose }: UpdateProfileModalProps) => {
  const [nickname, setNickname] = useState(currentNickname);
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl ?? null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate } = useUpdateProfile();

  useEffect(() => {
    if (isOpen) {
      setNickname(currentNickname);
      setImageUrl(currentImageUrl ?? null);
      setErrorMessage(null);
    }
  }, [isOpen, currentNickname, currentImageUrl]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    mutate(
      { nickname, imageUrl },
      {
        onSuccess: () => {
          setErrorMessage(null);
          onClose();
        },
        onError: (err) => setErrorMessage(err.message),
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#313338] text-white border-none max-w-md p-0 overflow-hidden">
        <div className="px-4 pt-8 pb-6 text-center">
          <DialogTitle className="text-2xl font-bold mb-2">프로필 변경</DialogTitle>
          <DialogDescription className="text-[#B5BAC1] text-center mb-6">
            닉네임과 프로필 이미지를 변경하세요
          </DialogDescription>

          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-6">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden ${
                  imageUrl ? "" : "border-2 border-dashed border-[#5865F2]"
                }`}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="bg-[#5865F2] rounded-full p-2">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-[#5865F2] rounded-full p-1 cursor-pointer">
                  <label htmlFor="profile-image" className="cursor-pointer">
                    <Plus className="h-4 w-4 text-white" />
                  </label>
                  <input
                    type="file"
                    id="profile-image"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
              <div className="text-xs text-[#B5BAC1] mt-2">UPLOAD</div>
            </div>

            <div className="w-full space-y-2">
              <div className="text-left text-xs font-semibold text-[#B5BAC1]">닉네임</div>
              <Input
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setErrorMessage(null);
                }}
                className="bg-[#1E1F22] border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {errorMessage && <p className="text-left text-xs text-red-400 mt-1">{errorMessage}</p>}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="ghost" className="text-white hover:bg-[#4E5058] hover:text-white" onClick={onClose}>
              취소
            </Button>
            <Button
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
              onClick={handleSubmit}
              disabled={!nickname.trim()}
            >
              변경하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
