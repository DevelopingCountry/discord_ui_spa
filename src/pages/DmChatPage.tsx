import { useParams } from "react-router-dom";
import { Bell, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionOne from "@/components/layout/sectionOne";
import SectionFour from "@/components/layout/sectionFour";
import SearchMessage from "@/components/dm/search-message";
import DmName from "@/components/dm/dm-name";
import DmChat2 from "@/components/dm/dm-chat2";

export default function DmChatPage() {
  const { dmId } = useParams<{ dmId: string }>();

  return (
    <>
      <SectionOne>
        <DmName dmId={dmId ?? ""} />
        <div className="p-3 flex flex-shrink-0 absolute right-1 z-10">
          <div className="text-[#b5bac1] pr-2 flex-shrink-0 bg-discord1and4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Users className="w-5 h-5" />
            </Button>
          </div>
          <SearchMessage />
        </div>
      </SectionOne>

      <SectionFour>
        <div className={"flex h-full w-full"}>
          <div className="flex-1 min-w-0 flex flex-col min-h-0">
            <DmChat2 dmId={dmId} />
          </div>

          {/* <OnlineFriendsPanel /> */}
        </div>
      </SectionFour>
    </>
  );
}
