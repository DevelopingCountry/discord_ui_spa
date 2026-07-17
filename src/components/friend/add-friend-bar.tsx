import { useSendFriendRequest } from "@/components/friend/use-send-friend-request";

export default function AddFriendBar({
  name,
  status,
  avatar,
  id,
  isOnline = false,
  isPlaying = false,
}: {
  name: string;
  status: string;
  id: string;
  avatar?: string | null;
  isOnline?: boolean;
  isPlaying?: boolean;
}) {
  const sendFriendRequest = useSendFriendRequest();
  const clickHandle = () => {
    sendFriendRequest.mutate(id, {
      onError: (err) => console.error("❌ 친구 요청 실패:", err),
    });
  };
  return (
    <div className="flex items-center px-2 py-3 rounded hover:bg-[#35373c] cursor-pointer group">
      <div className="relative mr-3">
        <img src={avatar || "/assets/discord_blue.png"} alt={name} width={40} height={40} className="rounded-full" />
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#313338]"></div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center">
          <span className="text-white text-sm font-medium">{name}</span>
          {isPlaying && (
            <div className="ml-2 flex items-center">
              <div className="w-3 h-3 mr-1">
                <svg width="12" height="12" viewBox="0 0 24 24">
                  <path
                    fill="#3ba55c"
                    d="M3.3,13.5l4.8,4.6c0.4,0.4,1.1,0.1,1.1-0.5V9.9c0-0.6-0.7-0.9-1.1-0.5L3.3,13.5z M9.6,17.6l4.8,4.6 c0.4,0.4,1.1,0.1,1.1-0.5v-7.7c0-0.6-0.7-0.9-1.1-0.5L9.6,17.6z M16,13.5l4.8,4.6c0.4,0.4,1.1,0.1,1.1-0.5V9.9 c0-0.6-0.7-0.9-1.1-0.5L16,13.5z"
                  ></path>
                </svg>
              </div>
            </div>
          )}
        </div>
        <div className="text-[#b5bac1] text-sm">{status}</div>
      </div>
      <div className="flex space-x-2">
        <button className="w-9 h-9 rounded-full bg-[#2b2d31] flex items-center justify-center" onClick={clickHandle}>
          <img src={"/assets/channel-plus.svg"} alt={"dm생성"} width={16} height={16} />
        </button>
      </div>
    </div>
  );
}
