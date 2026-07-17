import { useLocation, useNavigate } from "react-router-dom";
import type { DmList } from "@/components/type/response";
import { useHideDm } from "@/components/dm/use-hide-dm";

export default function DirectMessage({ dm }: { dm: DmList }) {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const isActive = pathname === `/channels/me/${dm.dmId}`;
  const hideDm = useHideDm();

  const handleDelete = (dmId: string) => {
    hideDm.mutate(dmId, {
      onSuccess: () => {
        // 현재 열린 DM이면 친구 목록으로 이동
        if (pathname === `/channels/me/${dmId}`) {
          navigate("/channels/me");
        }
      },
      onError: (err) => console.error("❌ DM 숨기기 실패:", err),
    });
  };

  return (
    <button
      className={`flex items-center px-2 py-3 rounded hover:bg-[#35373c] cursor-pointer group w-full
      ${isActive ? "bg-[#393c41] text-white" : "text-[#96989d] hover:text-white hover:bg-[#35373c]"}`}
      onClick={() => navigate(`/channels/me/${dm?.dmId}`)}
    >
      <div className="relative mr-3">
        <img
          src={dm.targetImageUrl || "/assets/discord_blue.png"}
          alt={dm.targetNickname}
          width={40}
          height={40}
          className="rounded-full"
        />
      </div>
      <div className="flex-1 flex justify-between items-center">
        <span className="text-white text-sm font-medium">{dm?.targetNickname || "No Name"}</span>
        {/* <div
          className="ml-2 text-[#96989d] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(dm.dmId);
          }}
        >
          ✕
        </div> */}
      </div>
    </button>
  );
}
