import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSendFriendRequest } from "@/components/friend/use-send-friend-request";

export default function AddFriend() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const sendFriendRequest = useSendFriendRequest();

  const clickhandler = () => {
    sendFriendRequest.mutate(username, {
      onSuccess: () => setStatus("success"),
      onError: (err) => {
        console.error("❌ 친구 요청 실패:", err);
        setStatus("error");
      },
    });
  };

  return (
    <div className="flex-1 p-4 md:p-8">
      <header className="relative flex flex-col mb-8">
        <img
          src="/assets/harmonica_bear.png"
          alt="Harmonica Bear"
          width={120}
          height={120}
          className="absolute right-0 object-contain"
        />
        <h1 className="text-2xl font-bold text-white mb-1">친구 추가하기</h1>
        <p className="text-[#B5BAC1]">Discord 사용자명을 사용하여 친구를 추가할 수 있어요.</p>
      </header>
      <div className="border-b border-[#3F4147] pb-8">
        <div className="relative">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Discord 사용자명을 사용하여 친구를 추가할 수 있어요."
            className="bg-[#1E1F22] py-7 border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 pr-32"
          />
          <Button
            onClick={clickhandler}
            disabled={!username.trim()}
            className="absolute right-0 top-0 h-full bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-l-none"
          >
            친구 요청 보내기
          </Button>
        </div>

        {status === "success" && (
          <div className="mt-4 p-3 bg-green-500/20 text-green-400 rounded-md">성공적으로 친구 요청을 보냈습니다!</div>
        )}

        {status === "error" && (
          <div className="mt-4 p-3 bg-red-500/20 text-red-400 rounded-md">
            친구 요청을 보내는 데 실패했습니다. 사용자명을 확인해주세요.
          </div>
        )}
      </div>
    </div>
  );
}
