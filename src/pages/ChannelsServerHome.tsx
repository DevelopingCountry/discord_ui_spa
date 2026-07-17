import SectionFour from "@/components/layout/sectionFour";
import SectionOneAndFour from "@/components/layout/sectionOneAndFour";
import { useParams } from "react-router-dom";
import { useServersQuery } from "@/components/server/use-servers-query";

export default function ChannelsServerHome() {
  const { serverId } = useParams<{ serverId: string }>();
  const { data: servers = [] } = useServersQuery();
  const currentServer = servers.find((server) => server.id === serverId);
  return (
    <SectionOneAndFour>
      <SectionFour>
        <section className="relative h-screen w-full bg-discord1and4 text-white flex flex-col items-center justify-center px-4">
          <div className="z-10 text-center">
            <h1 className="text-4xl font-bold mb-2">Welcome to the {currentServer?.name}</h1>
            <p className="text-gray-300 mb-6">Feel free to hang out, chat, and vibe 🎧</p>
            <span className="text-white font-semibold px-6 py-2 rounded-lg shadow-md">Join the Chat</span>
          </div>
        </section>
      </SectionFour>
    </SectionOneAndFour>
  );
}
