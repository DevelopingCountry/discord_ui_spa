import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Menu, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CreateServerModal } from "@/components/server/modal/server-create-modal";
import { useServersQuery } from "@/components/server/use-servers-query";

const COLORS = ["#5865f2", "#57f287", "#fee75c", "#eb459e", "#ed4245", "#3ba55c", "#faa61a", "#00aff4"];

function getColor(id: string) {
  const n = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[n % COLORS.length];
}

export default function ServerSidebar() {
  const { data: servers = [] } = useServersQuery();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const [isCreateServerModalOpen, setIsCreateServerModalOpen] = useState(false);
  return (
    <TooltipProvider>
      <div className="flex flex-col items-center min-w-[72px] bg-[#1e1f22] py-3 gap-2 overflow-y-auto hide-scrollbar h-screen">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-[24px] bg-[#313338] text-white hover:rounded-[16px] hover:bg-[#5865f2] transition-all duration-200",
                pathname.startsWith(`/channels/me`) ? "bg-[#5865f2]" : "bg-[#313338]",
              )}
              onClick={() => navigate("/channels/me")}
            >
              <Menu className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Home</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-8 h-[2px] bg-[#35363c] rounded-full my-1" />
        <ul>
          {servers.map((server) => (
            <li key={server.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-[24px] overflow-hidden text-white hover:rounded-[16px] transition-all duration-200",
                      pathname.startsWith(`/channels/${server.id}`) ? "rounded-[16px]" : "",
                    )}
                    onClick={() => navigate(`/channels/${server.id}`)}
                  >
                    {pathname.startsWith(`/channels/${server.id}`) && (
                      <div className="absolute left-0 w-1 h-10 bg-white rounded-r-full z-10" />
                    )}
                    {server.imageUrl ? (
                      <img
                        src={server.imageUrl}
                        alt={server.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: getColor(server.id) }}
                      >
                        {server.name?.charAt(0) ?? "?"}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{server?.name || "서버 이름 없음"}</p>
                </TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="flex items-center justify-center w-12 h-12 rounded-[24px] bg-[#313338] text-[#3ba55c] hover:rounded-[16px] hover:bg-[#3ba55c] hover:text-white transition-all duration-200"
              onClick={() => setIsCreateServerModalOpen(true)}
            >
              <Plus className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add a Server</p>
          </TooltipContent>
        </Tooltip>
        <CreateServerModal isOpen={isCreateServerModalOpen} onClose={() => setIsCreateServerModalOpen(false)} />
      </div>
    </TooltipProvider>
  );
}
