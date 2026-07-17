import { useEffect } from "react";
import { API_URL } from "@/lib/config";
import { useOnlineFriendsStore } from "@/components/friend/use-online-friends-store";

export default function OnlineFriendsPanel() {
  const { onlineFriends, setOnlineFriends } = useOnlineFriendsStore();
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/friend/online`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const result = data.response;
        setOnlineFriends(Array.isArray(result) ? result : []);
      })
      .catch(console.error);
  }, [token, setOnlineFriends]);

  return (
    <div className="min-w-[358px] bg-discordDark hidden xl:flex flex-col shadow-elevationLeft">
      <h2 className="text-white text-xl font-extrabold px-5 pt-6 pb-3">현재 활동 중</h2>
      {onlineFriends.length === 0 ? (
        <div className="flex flex-col items-center text-center px-6 pt-8">
          <div className="text-[#96989d] text-base font-bold mb-2">지금은 조용하네요...</div>
          <div className="text-[#72767d] text-sm">친구가 온라인 상태가 되면 여기에 표시돼요!</div>
        </div>
      ) : (
        <ul className="px-2">
          {onlineFriends.map((f) => (
            <li key={f.friendId} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-[#35373c]">
              <div className="relative">
                <img src={f.imageUrl || "/assets/discord_blue.png"} alt={f.name} width={32} height={32} className="rounded-full" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2b2d31]" />
              </div>
              <div>
                <div className="text-white text-sm font-medium">{f.name}</div>
                <div className="text-[#b5bac1] text-xs">온라인</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
