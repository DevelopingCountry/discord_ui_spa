import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchMessage() {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 🔒 기본 제출 방지 (새로고침 X)
    // onSearch(input); // 🔍 검색 실행
  };
  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#96989d]" />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search"
        className="w-full bg-[#1e1f22] text-sm rounded-md py-1.5 pl-9 pr-3 text-[#dcddde] placeholder:text-[#96989d] focus:outline-none"
      />
    </form>
  );
}
