import { useLocation, useNavigate } from "react-router-dom";

const SidebarItem = ({ icon, label }: { icon: string; label: string }) => {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const isActive = pathname === `/channels/me`;
  return (
    <div
      className={`flex items-center p-1 mb-3 mt-1 rounded-md cursor-pointer w-full ${
        isActive ? "bg-gray-600 text-white" : "bg-discord2and3 text-gray-300 hover:bg-gray-600 hover:text-white"
      }`}
      onClick={() => navigate("/channels/me/")}
    >
      <img src={icon} alt={"User Avatar"} width={42} height={30} className={"rounded-full ml-2"} />
      <span className="ml-2 text-lg font-bold">{label}</span>
    </div>
  );
};

export default SidebarItem;
