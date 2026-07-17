import SidebarItem from "@/components/dm/sidebarItem";
import DirectMessage from "@/components/dm/direct-message";
import { useDmsQuery } from "@/components/dm/use-dms-query";
import { useCreateDm } from "@/components/dm/use-create-dm";
import { useFriendsQuery } from "@/components/friend/use-friends-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SectionThreeMain = () => {
  const { data: dmList = [] } = useDmsQuery();
  const createDm = useCreateDm();
  const { data: friendsData } = useFriendsQuery();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const acceptedFriends = friendsData?.filter((f) => f.status === "ACCEPTED") ?? [];
  const filtered = acceptedFriends.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  const openDm = () => {
    if (!selectedId) return;
    createDm.mutate(selectedId, {
      onSuccess: (newDm) => {
        setShowModal(false);
        setSelectedId(null);
        setSearch("");
        navigate(`/channels/me/${newDm.dmId}`);
      },
      onError: (err) => console.error("❌ DM 생성 실패:", err),
    });
  };
  
  useEffect(() => {
    console.log(dmList);
  }, [dmList]);

  
  return (
    <div className={"mt-2"}>
      <div className={"relative ml-[8px] pr-2"}>
        <SidebarItem icon={"/assets/friend_tap.png"} label={"친구"} />
      </div>
      <div className="mx-2 my-2 h-px bg-[#3f4147]" />
      <h2 className={"flex items-center pl-[18px] pt-[18px] pb-[4px] pr-[8px] h-[40px] text-[12px]/[16px] font-[600]"}>
        <span className={"flex-1 text-amber-50"}>다이렉트 메시지</span>
        <button onClick={() => setShowModal(true)} className={"mr-[2px] text-[#96989d] hover:text-white"}>
          <img src={"/assets/channel-plus.svg"} alt={"dm생성"} width={16} height={16} />
        </button>
      </h2>
      <ul>
        {dmList?.map((dm) => (
          <li key={dm.dmId} className={"flex flex-1 w-full"}>
            <DirectMessage dm={dm} />
          </li>
        ))}
      </ul>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#313338] rounded-lg w-[440px] shadow-xl flex flex-col" style={{ maxHeight: "520px" }}>
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div>
                <h2 className="text-white font-bold text-lg">새로운 메시지</h2>
                <p className="text-[#b5bac1] text-xs mt-0.5">대화할 친구를 선택하세요.</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedId(null);
                  setSearch("");
                }}
                className="text-[#b5bac1] hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* 선택된 친구 + 검색 */}
            <div className="mx-4 mb-2 flex flex-wrap items-center gap-1 bg-[#1e1f22] rounded px-2 py-1 min-h-[36px]">
              {selectedId &&
                (() => {
                  const f = acceptedFriends.find((f) => f.friendId === selectedId);
                  return f ? (
                    <span className="flex items-center gap-1 bg-[#5865f2] text-white text-xs px-2 py-0.5 rounded">
                      {f.name}
                      <button onClick={() => setSelectedId(null)} className="ml-1 hover:text-gray-300">
                        ✕
                      </button>
                    </span>
                  ) : null;
                })()}
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={selectedId ? "" : "친구 찾기"}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-[#96989d] min-w-[80px]"
              />
            </div>

            {/* 친구 목록 */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">
              {filtered.length === 0 ? (
                <p className="text-[#96989d] text-sm text-center py-6">찾을 수 없습니다</p>
              ) : (
                filtered.map((f) => (
                  <button
                    key={f.friendId}
                    onClick={() => setSelectedId(f.friendId === selectedId ? null : f.friendId)}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-[#35373c] ${selectedId === f.friendId ? "bg-[#35373c]" : ""}`}
                  >
                    <img
                      src={f.imageUrl || "/assets/discord_blue.png"}
                      alt={f.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div className="flex-1 text-left">
                      <div className="text-white text-sm font-medium">{f.name}</div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedId === f.friendId ? "bg-[#5865f2] border-[#5865f2]" : "border-[#96989d]"}`}
                    >
                      {selectedId === f.friendId && <span className="text-white text-[10px]">✓</span>}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 p-4 border-t border-[#1e1f22]">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedId(null);
                  setSearch("");
                }}
                className="flex-1 py-2 rounded bg-[#1e1f22] text-white hover:bg-[#2b2d31]"
              >
                취소
              </button>
              <button
                onClick={openDm}
                disabled={!selectedId}
                className="flex-1 py-2 rounded bg-[#5865f2] text-white hover:bg-[#4752c4] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                메시지 만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionThreeMain;
