import { useLocation, useNavigate } from "react-router-dom";
import type { DmList } from "@/components/type/response";

export default function DirectMessage({ dm }: { dm: DmList }) {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const isActive = pathname === `/channels/me/${dm.dmId}`;

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
        {dm.unreadCount > 0 && (
          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-xs font-semibold">
            {dm.unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}
