import { MessageCircle, Check, X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateDm } from "@/components/dm/use-create-dm";
import { useRespondFriendRequest } from "@/components/friend/use-respond-friend-request";
import { useDeleteFriend } from "@/components/friend/use-delete-friend";

export default function ChatMessage({
  name,
  status,
  avatar,
  id,
  friendId,
  isOnline = false,
  isActive,
  isSender,
}: {
  name: string;
  status: string;
  id: string;
  friendId: string;
  avatar?: string | null;
  isOnline?: boolean;
  isActive: string;
  isSender: boolean;
}) {
  const navigate = useNavigate();
  const createDm = useCreateDm();
  const respondFriendRequest = useRespondFriendRequest();
  const deleteFriendMutation = useDeleteFriend();

  const openDm = () => {
    createDm.mutate(id, {
      onSuccess: (newDm) => {
        setTimeout(() => navigate(`/channels/me/${newDm.dmId}`), 0);
      },
      onError: (err) => console.error("❌ dm생성 실패:", err),
    });
  };
  const acceptFriend = () => {
    respondFriendRequest.mutate(
      { friendId, isFriend: "ACCEPTED" },
      { onError: (err) => console.error("❌ 수락 실패:", err) },
    );
  };

  const rejectFriend = () => {
    respondFriendRequest.mutate(
      { friendId, isFriend: "REJECTED" },
      { onError: (err) => console.error("❌ 거절 실패:", err) },
    );
  };

  const deleteFriend = () => {
    deleteFriendMutation.mutate(id, {
      onError: (err) => console.error("❌ 삭제 실패:", err),
    });
  };

  return (
    <div className="flex items-center px-10 py-4 rounded hover:bg-[#35373c] cursor-pointer group">
      {/* 아바타 */}
      <div className="relative mr-4 flex-shrink-0">
        <img src={avatar || "/assets/discord_blue.png"} alt={name} width={42} height={42} className="rounded-full" />
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#313338]" />
        )}
      </div>

      {/* 이름 */}
      <div className="flex-1 min-w-0">
        <div className="text-white text-md font-medium truncate">{name}</div>
        <div className="text-[#b5bac1] text-xs">
          {status === "ACCEPTED" ? "온라인" : isSender ? "요청 보냄" : "요청 받음"}
        </div>
      </div>
      <div className="flex space-x-2">
        {isActive === "모두" && (
          <>
            <button
              onClick={openDm}
              title="메시지 보내기"
              className="w-9 h-9 rounded-full bg-[#2b2d31] flex items-center justify-center hover:bg-[#35373c]"
            >
              <MessageCircle className="w-5 h-5 text-[#b5bac1]" />
            </button>
            <button
              onClick={deleteFriend}
              title="친구 삭제"
              className="w-9 h-9 rounded-full bg-[#2b2d31] flex items-center justify-center hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4 text-[#b5bac1]" />
            </button>
          </>
        )}
        {isActive === "대기중" && isSender && (
          // 내가 보낸 요청 → 취소 버튼만
          <button
            onClick={deleteFriend}
            title="요청 취소"
            className="w-9 h-9 rounded-full bg-[#2b2d31] flex items-center justify-center hover:bg-red-500/20"
          >
            <X className="w-5 h-5 text-[#b5bac1]" />
          </button>
        )}
        {isActive === "대기중" && !isSender && (
          <>
            <button
              onClick={acceptFriend}
              title="수락"
              className="w-9 h-9 rounded-full bg-[#2b2d31] flex items-center justify-center hover:bg-green-500/20"
            >
              <Check className="w-5 h-5 text-[#b5bac1]" />
            </button>
            <button
              onClick={rejectFriend}
              title="거절"
              className="w-9 h-9 rounded-full bg-[#2b2d31] flex items-center justify-center hover:bg-red-500/20"
            >
              <X className="w-5 h-5 text-[#b5bac1]" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
