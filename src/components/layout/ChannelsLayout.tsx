import { Outlet } from "react-router-dom";
import SideUi from "@/components/layout/sideUi";
import ServerSidebar from "@/components/server/server-sidebar";
import NotificationSubscribe from "@/components/notification/NotificationSubscribe";
import NotificationInbox from "@/components/notification/notification-inbox";

export default function ChannelsLayout() {
  return (
    <>
      <NotificationSubscribe />
      <NotificationInbox />
      <div className="bg-discordSidebar w-screen h-screen flex overflow-x-hidden overflow-y-hidden">
        <SideUi>
          <ServerSidebar />
        </SideUi>
        <Outlet />
      </div>
    </>
  );
}
