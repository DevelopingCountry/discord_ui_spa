import SectionOne from "@/components/layout/sectionOne";
import SectionFour from "@/components/layout/sectionFour";
import SectionOneAndFour from "@/components/layout/sectionOneAndFour";
import { Bell, Hash, Pencil, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChannelsQuery } from "@/components/channel/use-channels-query";
import MessageInput from "@/components/messeage-input";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "@/components/auth/AuthContext";
import { useParams } from "react-router-dom";
import { VoiceChannelPage } from "@/components/voice/voice-channel-page";
import { API_URL } from "@/lib/config";
import { publish } from "@/lib/socket";
import { useSocketSubscribe } from "@/components/hooks/useSocketSubscribe";

type ChannelMessage = {
  channelId: string;
  messageId: string;
  userId: string;
  nickName: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
};
type MessageGroup = {
  userId: string;
  nickName: string;
  avatarUrl?: string;
  timeLabel: string;
  messages: { messageId: string; content: string; createdAt: string }[];
  lastTime: Date;
};
type GroupedDay = { dateLabel: string; messageGroups: MessageGroup[] };
type Member = { userId: string; nickname: string; imageUrl: string; online: boolean };

function formatTime(d: string) {
  return new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "numeric", hour12: true }).format(new Date(d));
}
function formatDate(d: string) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(d));
}
function groupMessages(messages: ChannelMessage[]): GroupedDay[] {
  const grouped: GroupedDay[] = [];
  let currentDateKey = "";
  let currentDay: GroupedDay | null = null;
  let currentGroup: MessageGroup | null = null;

  messages.forEach((msg) => {
    const date = new Date(msg.createdAt);
    const dateKey = date.toDateString();
    if (dateKey !== currentDateKey) {
      currentDateKey = dateKey;
      currentDay = { dateLabel: formatDate(msg.createdAt), messageGroups: [] };
      grouped.push(currentDay);
      currentGroup = null;
    }
    const lastTime = currentGroup?.messages.at(-1) ? new Date(currentGroup!.messages.at(-1)!.createdAt) : null;
    const sameGroup =
      currentGroup &&
      currentGroup.userId === msg.userId &&
      lastTime &&
      date.getTime() - lastTime.getTime() <= 5 * 60 * 1000;

    if (sameGroup) {
      currentGroup!.messages.push({ messageId: msg.messageId, content: msg.content, createdAt: msg.createdAt });
    } else {
      currentGroup = {
        userId: msg.userId,
        nickName: msg.nickName,
        avatarUrl: msg.imageUrl,
        timeLabel: formatTime(msg.createdAt),
        lastTime: date,
        messages: [{ messageId: msg.messageId, content: msg.content, createdAt: msg.createdAt }],
      };
      currentDay!.messageGroups.push(currentGroup);
    }
  });
  return grouped;
}

export default function ChannelPage() {
  const { serverId, channelId } = useParams<{ serverId: string; channelId: string }>();
  const { data: channels = [] } = useChannelsQuery(serverId);
  const currentChannel = channels.find((ch) => ch.id === channelId);
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const { userId } = useAuth();

  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState<{ messageId: string; content: string } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [showMembers, setShowMembers] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token || !serverId) return;
    axios
      .get(`${API_URL}/server/${serverId}/members`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setMembers(res.data.response || []))
      .catch(() => {});
  }, [token, serverId]);

  useEffect(() => {
    if (!token || !channelId) return;
    setIsLoading(true);
    axios
      .get(`${API_URL}/channel/${channelId}/messages`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setMessages(res.data.response || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [token, channelId]);

  useSocketSubscribe<{ type: "SEND" | "UPDATE" | "DELETE"; message: ChannelMessage }>(
    channelId ? `/topic/channel/${channelId}` : null,
    (data) => {
      if (data.type === "SEND") setMessages((prev) => [...prev, data.message]);
      else if (data.type === "UPDATE")
        setMessages((prev) =>
          prev.map((m) => (m.messageId === data.message.messageId ? { ...m, content: data.message.content } : m)),
        );
      else if (data.type === "DELETE")
        setMessages((prev) => prev.filter((m) => m.messageId !== data.message.messageId));
    },
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = (content: string) => {
    if (!channelId || !content.trim()) return;
    publish(`/app/channel/${channelId}`, { content });
  };
  const updateMessage = async (messageId: string, content: string) => {
    if (!content.trim()) return;
    try {
      await axios.patch(
        `${API_URL}/channel/${channelId}/message/${messageId}`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        },
      );
      setMessages((prev) => prev.map((m) => (m.messageId === messageId ? { ...m, content } : m)));
      setEditingMessage(null);
    } catch (err) {
      console.error("❌ 메시지 수정 실패:", err);
    }
  };
  const deleteMessage = async (messageId: string) => {
    try {
      await axios.delete(`${API_URL}/channel/${channelId}/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((m) => m.messageId !== messageId));
    } catch (err) {
      console.error("❌ 메시지 삭제 실패:", err);
    }
  };

  const grouped = groupMessages(messages);
  const onlineMembers = members.filter((m) => m.online);
  const offlineMembers = members.filter((m) => !m.online);

  if (currentChannel?.type === "VOICE") {
    return (
      <SectionOneAndFour>
        <VoiceChannelPage channelId={channelId ?? ""} channelName={currentChannel.name} serverId={serverId} />
      </SectionOneAndFour>
    );
  }
  return (
    <SectionOneAndFour>
      <SectionOne>
        <div className="flex items-center h-12 px-2 w-full">
          <Hash className="w-5 h-5 mr-2 text-[#96989d] flex-shrink-0" />
          <h3 className="font-bold text-white flex-1">{currentChannel?.name || "채널"}</h3>
          <div className="flex items-center gap-1 text-[#b5bac1]">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowMembers((v) => !v)}>
              <Users className="w-5 h-5" />
            </Button>
            <div className="relative ml-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#96989d]" />
              <input
                type="text"
                placeholder="검색"
                className="bg-[#1e1f22] text-sm rounded-md py-1.5 pl-9 pr-3 text-[#dcddde] placeholder:text-[#96989d] focus:outline-none w-36"
              />
            </div>
          </div>
        </div>
      </SectionOne>

      <SectionFour>
        <div className="flex flex-1 overflow-hidden">
          {/* 메시지 영역 */}
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-[80px]">
            {/* 채널 환영 헤더 */}
            <div className="px-4 pt-16 mb-8">
              <div className="w-20 h-20 bg-[#4e5058] rounded-full flex items-center justify-center mb-4">
                <Hash className="w-11 h-11 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                #{currentChannel?.name || "채널"}에 오신 걸 환영합니다!
              </h1>
              <p className="text-[#b5bac1] text-base mb-5">#{currentChannel?.name || "채널"} 채널의 시작이에요.</p>
          
            </div>

            {/* 날짜 구분선 + 메시지 */}
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-[#96989d]">로딩 중...</div>
            ) : (
              grouped.map((day, dayIdx) => (
                <div key={dayIdx}>
                  <div className="flex items-center gap-3 my-5 px-4">
                    <div className="flex-1 h-px bg-[#3f4147]" />
                    <span className="text-xs text-[#949ba4] font-medium">{day.dateLabel}</span>
                    <div className="flex-1 h-px bg-[#3f4147]" />
                  </div>
                  {day.messageGroups.map((g, i) => (
                    <div key={i} className="group/msg px-4 py-0.5 hover:bg-[#2e3035] flex gap-4">
                      <div className="flex-shrink-0 mt-0.5">
                        <img
                          src={g.avatarUrl || "/assets/discord_blue.png"}
                          alt={g.nickName}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-white font-medium text-sm">{g.nickName}</span>
                          <span className="text-[#949ba4] text-xs">{g.timeLabel}</span>
                        </div>
                        {g.messages.map((msg) => (
                          <div key={msg.messageId} className="group/line relative">
                            {editingMessage?.messageId === msg.messageId ? (
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="text"
                                  value={editingMessage.content}
                                  onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      updateMessage(editingMessage.messageId, editingMessage.content);
                                    if (e.key === "Escape") setEditingMessage(null);
                                  }}
                                  className="flex-1 p-2 rounded bg-[#383a40] text-white text-sm focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={() => updateMessage(editingMessage.messageId, editingMessage.content)}
                                  className="px-3 py-1 bg-[#5865f2] text-white text-xs rounded hover:bg-[#4752c4]"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={() => setEditingMessage(null)}
                                  className="px-3 py-1 bg-[#4e5058] text-white text-xs rounded"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <p className="text-[#dcddde] text-sm leading-relaxed break-words">{msg.content}</p>
                            )}
                            {g.userId === userId && !editingMessage && (
                              <div className="absolute right-2 top-0 hidden group-hover/line:flex gap-1 bg-[#313338] border border-[#3f4147] rounded px-1">
                                <button
                                  onClick={() => setEditingMessage({ messageId: msg.messageId, content: msg.content })}
                                  className="text-[#b5bac1] hover:text-white text-xs px-1 py-0.5"
                                >
                                  편집
                                </button>
                                <button
                                  onClick={() => deleteMessage(msg.messageId)}
                                  className="text-[#b5bac1] hover:text-red-400 text-xs px-1 py-0.5"
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          
        </div>

        {/* 메시지 입력창 */}
        <div className="flex-shrink-0 px-4 pb-4 bg-discord1and4">
          <MessageInput onSend={sendMessage} />
        </div>
      </SectionFour>
    </SectionOneAndFour>
  );
}
