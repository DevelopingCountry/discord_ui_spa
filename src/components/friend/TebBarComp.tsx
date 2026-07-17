import TabItem from "@/components/friend/TabItem";
import { useState } from "react";
import { useActiveStore } from "@/components/friend/useSearchStore";
import { Button } from "@/components/ui/button";
import { type MainScreenContextProps, useMainScreenContext } from "@/components/friend/main-screen-context";

export function TabBarComp() {
  const { setIsActive } = useActiveStore();
  const [selectedTabId, setSelectedTabId] = useState(1);
  const useMainScreenContext1: MainScreenContextProps | null = useMainScreenContext();
  const setState = useMainScreenContext1?.setState;
  const TabItems: { id: number; label: string }[] = [
    { id: 1, label: "모두" },
    { id: 2, label: "대기중" },
  ];
  const addFriendHandler = () => {
    if (setState) {
      setState("addFriends");
      setSelectedTabId(3);
      setIsActive("친구추가하기");
    }
  };
  return (
    <div className={"flex py-3 items-center relative flex-1"}>
      <img src="/assets/friend_tap.png" alt="친구" width={40} height={35} />
      <p className="text-lg font-bold text-white mr-3">친구</p>
      <ul className={"flex font-semibold"}>
        {TabItems.map((item) => (
          <li key={item.id}>
            <TabItem
              label={item.label}
              isSelected={selectedTabId === item.id}
              onClick={() => {
                if (setState) {
                  setState("getFriends");
                }
                setSelectedTabId(item.id);
                setIsActive(item.label);
              }}
            />
          </li>
        ))}
        <li>
          <Button className="bg-[#5865f2] hover:bg-[#4752c4]font-semibold text-white ml-2" onClick={addFriendHandler}>
            친구 추가하기
          </Button>
        </li>
      </ul>
    </div>
  );
}
