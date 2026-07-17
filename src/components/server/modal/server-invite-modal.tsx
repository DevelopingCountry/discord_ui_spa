import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/components/auth/AuthContext";
import { useFriendsQuery } from "@/components/friend/use-friends-query";
import { Search } from "lucide-react";
import { API_URL } from "@/lib/config";

interface ServerInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  serverName: string;
}

export function ServerInviteModal({ isOpen, onClose, serverId, serverName }: ServerInviteModalProps) {
  const { accessToken } = useAuth();
  const { data: allFriends = [] } = useFriendsQuery();
  const friends = allFriends.filter((f) => f.status === "ACCEPTED");
  const [search, setSearch] = useState("");
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const handleInvite = async (friendId: string) => {
    if (invited.has(friendId) || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/server/${serverId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ guestId: friendId }),
      });
      if (res.ok) {
        setInvited((prev) => new Set(prev).add(friendId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = friends.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#313338] text-white border-none max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-lg font-bold">친구를 {serverName} 그룹으로 초대하기</DialogTitle>
          <p className="text-sm text-[#b5bac1]">친구에게 서버 초대장을 보냅니다</p>
        </DialogHeader>

        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 bg-[#1e1f22] rounded px-3 py-2">
            <Search className="w-4 h-4 text-[#b5bac1]" />
            <input
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-[#b5bac1]"
              placeholder="친구 찾기"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="px-2 pb-4 max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-[#b5bac1] text-sm py-6">친구가 없습니다</p>
          ) : (
            filtered.map((friend) => (
              <div key={friend.friendId} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-[#3f4147]">
                <div className="relative w-8 h-8 flex-shrink-0">
                  {friend.imageUrl && friend.imageUrl.trim() !== "" ? (
                    <img
                      src={friend.imageUrl}
                      alt={friend.name}
                      width={32}
                      height={32}
                      className="rounded-full w-8 h-8 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-sm font-bold">
                      {friend.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="flex-1 text-sm font-medium">{friend.name}</span>
                <button
                  onClick={() => handleInvite(friend.friendId)}
                  disabled={invited.has(friend.friendId)}
                  className={`text-sm px-3 py-1 rounded font-medium transition-colors ${
                    invited.has(friend.friendId)
                      ? "bg-[#3ba55c]/20 text-[#3ba55c] cursor-default"
                      : "bg-[#5865f2] hover:bg-[#4752c4] text-white"
                  }`}
                >
                  {invited.has(friend.friendId) ? "초대됨" : "초대하기"}
                </button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
