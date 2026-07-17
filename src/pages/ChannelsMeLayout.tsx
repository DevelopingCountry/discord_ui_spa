import { Outlet } from "react-router-dom";
import ResizableSidebar from "@/components/layout/resizable-sidebar";
import SectionTwo from "@/components/layout/sectionTwo";
import { SectionTwoMain } from "@/components/dm/sectionTwoMain";
import SectionThree from "@/components/layout/sectionThree";
import SectionThreeMain from "@/components/dm/sectionThreeMain";
import UserProfileBarUi from "@/components/layout/UserProfileBarUi";
import UserProfileBar from "@/components/layout/UserProfileBar";
import SectionOneAndFour from "@/components/layout/sectionOneAndFour";
import { MainScreenProvider } from "@/components/friend/main-screen-context";

export default function ChannelsMeLayout() {
  return (
    <div className={"flex flex-1"}>
      <ResizableSidebar>
        <SectionTwo>
          <SectionTwoMain />
        </SectionTwo>
        <SectionThree>
          <SectionThreeMain />
        </SectionThree>
        <UserProfileBarUi>
          <UserProfileBar stateIcon="/assets/status-online.svg" statusMessage="온라인" />
        </UserProfileBarUi>
      </ResizableSidebar>
      <SectionOneAndFour>
        <MainScreenProvider>
          <Outlet />
        </MainScreenProvider>
      </SectionOneAndFour>
    </div>
  );
}
