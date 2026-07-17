import SectionOne from "@/components/layout/sectionOne";
import { TabBarComp } from "@/components/friend/TebBarComp";
import SectionFour from "@/components/layout/sectionFour";
import SearchFriend from "@/components/friend/searchFriend";
import { type MainScreenContextProps, useMainScreenContext } from "@/components/friend/main-screen-context";
import AddFriend from "@/components/friend/add-friend";
import OnlineFriendsPanel from "@/components/friend/online-friends-panel";

export default function ChannelsMeHome() {
  const useMainScreenContext1: MainScreenContextProps | null = useMainScreenContext();
  const state = useMainScreenContext1?.state;

  return (
    <>
      <SectionOne>
        <TabBarComp />
      </SectionOne>
      <SectionFour>
        <div className={"flex"}>
          {state === "getFriends" ? <SearchFriend /> : <AddFriend />}
          <OnlineFriendsPanel />
        </div>
      </SectionFour>
    </>
  );
}
