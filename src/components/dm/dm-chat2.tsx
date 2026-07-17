import { useEffect, useRef, useState } from "react";
import axios from "axios";
import MessageInput from "@/components/messeage-input";
import SectionFour from "@/components/layout/sectionFour";
import { useAuth } from "@/components/auth/AuthContext";
import { API_URL } from "@/lib/config";
import { publish } from "@/lib/socket";
import { useSocketSubscribe } from "@/components/hooks/useSocketSubscribe";
import { useDmsQuery, dmsQueryKey } from "@/components/dm/use-dms-query";
import { useDeleteFriend } from "@/components/friend/use-delete-friend";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

type Message = {
  messageId: string;
  userId: string;
  nickName: string;
  content: string;
  createdAt: string;
  avatarUrl?: string;
};

type MessageGroup = {
  userId: string;
  nickName: string;
  avatarUrl?: string;
  timeLabel: string;
  messages: { messageId: string; content: string; createdAt: string }[];
};

type GroupedDay = {
  dateLabel: string;
  messageGroups: MessageGroup[];
};

export default function DmChat({ dmId }: { dmId: string | undefined }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingMessage, setEditingMessage] = useState<{ messageId: string; content: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const { userId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: dmList = [] } = useDmsQuery();
  const deleteFriendMutation = useDeleteFriend();

  const currentDm = dmList.find((d) => d.dmId === dmId);
  const partnerName = currentDm?.targetNickname ?? "";
  const partnerAvatar = currentDm?.targetImageUrl || "/assets/discord_blue.png";
  const targetId = currentDm?.targetId ?? "";

  useEffect(() => {
    if (!token || !dmId) return;

    axios
      .get(`${API_URL}/dm/${dmId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setMessages(res.data.response || []))
      .catch((err) => console.error("❌ 메시지 불러오기 실패:", err));
  }, [token, dmId]);

  useEffect(() => {
    if (!dmId) return;
    publish(`/app/dm/${dmId}/enter`, {});
    return () => {
      publish(`/app/dm/${dmId}/leave`, {});
    };
  }, [dmId]);

  useSocketSubscribe<{ type: "SEND" | "UPDATE" | "DELETE"; message: Message }>(
    dmId ? `/topic/dm/${dmId}` : null,
    (data) => {
      if (data.type === "SEND") {
        setMessages((prev) => [...prev, data.message]);
      } else if (data.type === "UPDATE") {
        setMessages((prev) =>
          prev.map((m) => (m.messageId === data.message.messageId ? { ...m, content: data.message.content } : m)),
        );
      } else if (data.type === "DELETE") {
        setMessages((prev) => prev.filter((m) => m.messageId !== data.message.messageId));
      }
    },
  );

  const sendMessage = (content: string) => {
    if (!dmId || !content.trim()) return;
    publish(`/app/dm/${dmId}`, { content });
  };

  const updateMessage = async (messageId: string, content: string) => {
    if (!content.trim()) return;
    try {
      await axios.patch(
        `${API_URL}/dm/${dmId}/message/${messageId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );
      setMessages((prev) => prev.map((msg) => (msg.messageId === messageId ? { ...msg, content } : msg)));
      setEditingMessage(null);
    } catch (err) {
      console.error("❌ 메시지 수정 실패:", err);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await axios.delete(`${API_URL}/dm/${dmId}/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((msg) => msg.messageId !== messageId));
    } catch (err) {
      console.error("❌ 메시지 삭제 실패:", err);
    }
  };

  const deleteFriend = () => {
    if (!targetId) return;
    const confirmed = confirm(`${partnerName}님을 친구 목록에서 삭제하시겠습니까?`);
    if (!confirmed) return;
    deleteFriendMutation.mutate(targetId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: dmsQueryKey });
        navigate("/channels/me");
      },
      onError: (err) => console.error("❌ 친구 삭제 실패:", err),
    });
  };

  const groupMessages = (msgs: Message[]): GroupedDay[] => {
    const grouped: GroupedDay[] = [];
    let currentDateKey = "";
    let currentGroup: MessageGroup | null = null;
    let currentDay: GroupedDay | null = null;

    msgs.forEach((msg) => {
      const date = new Date(msg.createdAt);
      const dateKey = date.toDateString();
      const timeLabel = new Intl.DateTimeFormat("ko-KR", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(date);

      if (dateKey !== currentDateKey) {
        currentDateKey = dateKey;
        currentDay = {
          dateLabel: new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(date),
          messageGroups: [],
        };
        grouped.push(currentDay);
        currentGroup = null;
      }

      const lastMsg = currentGroup?.messages.at(-1);
      const lastTime = lastMsg ? new Date(lastMsg.createdAt) : null;
      const isSameGroup =
        currentGroup &&
        currentGroup.userId === msg.userId &&
        lastTime &&
        date.getTime() - lastTime.getTime() <= 60 * 1000;

      if (isSameGroup) {
        currentGroup!.messages.push({ messageId: msg.messageId, content: msg.content, createdAt: msg.createdAt });
      } else {
        currentGroup = {
          userId: msg.userId,
          nickName: msg.nickName,
          avatarUrl: msg.avatarUrl,
          timeLabel,
          messages: [{ messageId: msg.messageId, content: msg.content, createdAt: msg.createdAt }],
        };
        currentDay?.messageGroups.push(currentGroup);
      }
    });

    return grouped;
  };

  const groupedMessages = groupMessages(messages);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <SectionFour>
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-4">
        {/* DM 상단 헤더 */}
        <div className="pt-16 pb-6 border-b border-[#3f4147] mb-4">
          <img src={partnerAvatar} alt={partnerName} width={80} height={80} className="rounded-full mb-4" />
          <h2 className="text-3xl font-bold text-white mb-1">{partnerName}</h2>
          <p className="text-[#b5bac1] text-sm mb-3">{partnerName}</p>
          <p className="text-[#b5bac1] mb-4">{partnerName}님과 나눈 다이렉트 메시지의 첫 부분이에요.</p>
          <button
            onClick={deleteFriend}
            className="px-3 py-1.5 text-sm bg-[#2b2d31] hover:bg-[#36373d] text-white rounded border border-[#3f4147] transition-colors"
          >
            친구 삭제하기
          </button>
        </div>

        {/* 날짜별 메시지 */}
        {groupedMessages.map((day, dayIdx) => (
          <div key={dayIdx}>
            {/* 날짜 구분선 */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[#3f4147]" />
              <span className="text-xs text-[#949ba4] font-medium whitespace-nowrap">{day.dateLabel}</span>
              <div className="flex-1 h-px bg-[#3f4147]" />
            </div>

            {day.messageGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="flex gap-4 mb-1 group hover:bg-[#2e3035] rounded px-2 py-0.5 -mx-2">
                {/* 아바타 */}
                <div className="flex-shrink-0 mt-0.5">
                  <img
                    src={group.avatarUrl || "/assets/discord_blue.png"}
                    alt={group.nickName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>

                {/* 메시지 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{group.nickName}</span>
                    <span className="text-xs text-[#949ba4]">{group.timeLabel}</span>
                  </div>
                  {group.messages.map((msg) => (
                    <div key={msg.messageId} className="relative group/msg">
                      {editingMessage?.messageId === msg.messageId ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            value={editingMessage.content}
                            onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.nativeEvent.isComposing)
                                updateMessage(editingMessage.messageId, editingMessage.content);
                              if (e.key === "Escape") setEditingMessage(null);
                            }}
                            className="flex-1 p-1.5 rounded bg-[#383a40] text-white text-sm border border-[#5865f2] outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => updateMessage(editingMessage.messageId, editingMessage.content)}
                            className="text-xs px-2 py-1 bg-[#5865f2] text-white rounded hover:bg-[#4752c4]"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingMessage(null)}
                            className="text-xs px-2 py-1 bg-[#2b2d31] text-[#b5bac1] rounded hover:bg-[#36373d]"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <p className="text-[#dcddde] text-sm leading-relaxed break-words">{msg.content}</p>
                      )}
                      {group.userId === userId && !editingMessage && (
                        <div className="absolute top-0 right-0 hidden group-hover/msg:flex gap-1 bg-[#2b2d31] border border-[#3f4147] rounded px-1 shadow">
                          <button
                            onClick={() => setEditingMessage({ messageId: msg.messageId, content: msg.content })}
                            className="text-[#b5bac1] hover:text-white text-xs px-1.5 py-0.5"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("이 메시지를 삭제하시겠습니까?")) deleteMessage(msg.messageId);
                            }}
                            className="text-[#b5bac1] hover:text-red-400 text-xs px-1.5 py-0.5"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex-shrink-0 px-4 pb-4 bg-discord1and4">
        <MessageInput onSend={sendMessage} />
      </div>
    </SectionFour>
  );
}
