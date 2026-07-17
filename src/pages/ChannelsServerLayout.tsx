import { Outlet, useParams } from "react-router-dom";
import ResizableSidebar from "@/components/layout/resizable-sidebar";
import SectionTwo from "@/components/layout/sectionTwo";
import ServerName from "@/components/server/server-name";
import SectionThree from "@/components/layout/sectionThree";
import UserProfileBarUi from "@/components/layout/UserProfileBarUi";
import UserProfileBar from "@/components/layout/UserProfileBar";
import ChannelSidebar from "@/components/channel/channel-sidebar";
import ChannelSubscriber from "@/components/channel/ChannelSubscriber";

export default function ChannelsServerLayout() {
  const { serverId } = useParams<{ serverId: string }>();

  return (
    <div className={"flex flex-1"}>
      <ChannelSubscriber serverId={serverId ?? ""} />
      <ResizableSidebar>
        <SectionTwo>
          <ServerName />
        </SectionTwo>
        <SectionThree>
          <ChannelSidebar serverId={serverId ?? ""} />
        </SectionThree>
        <UserProfileBarUi>
          <UserProfileBar stateIcon="/assets/status-online.svg" statusMessage="온라인" />
        </UserProfileBarUi>
      </ResizableSidebar>
      <Outlet />
    </div>
  );
}
