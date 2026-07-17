import { Search, X } from "lucide-react";
import { useSearchStore } from "@/components/friend/useSearchStore";

export default function SearchBar() {
  const { searchText, setSearchText } = useSearchStore();
  return (
    <div className="px-3 py-3 border-b border-[#1f2023]">
      <div className="relative">
        <input
          type="text"
          placeholder="검색하기"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full bg-[#1e1f22] text-[#dcddde] rounded-md py-2 px-2 pl-8 text-sm focus:outline-none"
        />
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b5bac1]" />
        {searchText && (
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b5bac1]"
            onClick={() => setSearchText("")}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
