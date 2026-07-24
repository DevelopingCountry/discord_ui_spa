import type React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { useCreateServer } from "@/components/server/use-create-server";
import { useProfileQuery } from "@/components/profile/use-profile-query";

interface CustomizeServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

const compressImage = (file: File, maxSize = 256): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = maxSize;
      canvas.height = maxSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("no ctx"));
        return;
      }
      ctx.drawImage(img, 0, 0, maxSize, maxSize);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = reject;
    img.src = url;
  });

export const CustomizeServerModal = ({ isOpen, onClose, onBack }: CustomizeServerModalProps) => {
  const { data: profile } = useProfileQuery();
  const [serverName, setServerName] = useState("내 서버");
  const [serverImage, setServerImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate } = useCreateServer();

  useEffect(() => {
    if (profile?.nickname) setServerName(`${profile.nickname}님의 서버`);
  }, [profile?.nickname]);

  useEffect(() => {
    if (isOpen) setErrorMessage(null);
  }, [isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setServerImage(compressed);
    } catch {
      console.error("이미지 압축 실패");
    }
  };

  const handleSubmit = () => {
    mutate(
      { serverName, imageUrl: serverImage },
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
          <DialogTitle className="text-2xl font-bold mb-2">서버 커스터마이즈하기</DialogTitle>
          <DialogDescription className="text-[#B5BAC1] text-center mb-6">
            새로운 서버에 이름과 아이콘을 부여해 개성을 드러내 보세요. 나중에 언제든 바꿀 수 있어요.
          </DialogDescription>

          <div className="flex flex-col items-center mb-6">
            <label htmlFor="server-image" className="cursor-pointer mb-6 group">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden group-hover:opacity-80 transition-opacity ${
                  serverImage ? "" : "border-2 border-dashed border-[#5865F2]"
                }`}
              >
                {serverImage ? (
                  <img src={serverImage} alt="Server Icon" width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  <div className="bg-[#5865F2] rounded-full p-2">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              <div className="text-xs text-[#B5BAC1] mt-2">UPLOAD</div>
            </label>
            <input type="file" id="server-image" className="hidden" accept="image/*" onChange={handleImageUpload} />

            <div className="w-full space-y-2">
              <div className="text-left text-xs font-semibold text-[#B5BAC1]">서버 이름</div>
              <Input
                value={serverName}
                onChange={(e) => {
                  setServerName(e.target.value);
                  setErrorMessage(null);
                }}
                className="bg-[#1E1F22] border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {errorMessage && <p className="text-left text-xs text-red-400 mt-1">{errorMessage}</p>}
            </div>

            <div className="w-full text-left text-xs text-[#B5BAC1] mt-4">
              서버를 만들면 Discord의{" "}
              <a href="#" className="text-[#00A8FC] hover:underline">
                커뮤니티 지침
              </a>
              에 동의하게 됩니다.
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="ghost" className="text-white hover:bg-[#4E5058] hover:text-white" onClick={onBack}>
              뒤로 가기
            </Button>
            <Button
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
              onClick={handleSubmit}
              disabled={!serverName.trim()}
            >
              만들기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
