import { useEffect, useRef, useState } from "react";
import MessageInput from "@/components/messeage-input";
import SectionFour from "@/components/layout/sectionFour";
import { useAuth } from "@/components/auth/AuthContext";
import { publish } from "@/lib/socket";
import { dmMessagesQueryKey, useDmMessagesQuery } from "@/components/dm/use-dm-messages-query";
import { useUpdateDmMessage, useDeleteDmMessage } from "@/components/dm/use-dm-message-mutations";
import { useMessageSocketSync } from "@/components/hooks/useMessageSocketSync";
import { groupMessagesByDay } from "@/lib/message-grouping";
import { useDmsQuery, dmsQueryKey } from "@/components/dm/use-dms-query";
import { useQueryClient } from "@tanstack/react-query";
import type { DmList } from "@/components/type/response";

const GROUPING_WINDOW_MS = 60 * 1000;

export default function DmChat({ dmId }: { dmId: string | undefined }) {
  const [editingMessage, setEditingMessage] = useState<{ messageId: string; content: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const { data: dmList = [] } = useDmsQuery();

  const { data: messages = [] } = useDmMessagesQuery(dmId);
  const updateMessageMutation = useUpdateDmMessage(dmId ?? "");
  const deleteMessageMutation = useDeleteDmMessage(dmId ?? "");

  const currentDm = dmList.find((d) => d.dmId === dmId);
  const partnerName = currentDm?.targetNickname ?? "";
  const partnerAvatar = currentDm?.targetImageUrl || "/assets/discord_blue.png";

  useEffect(() => {
    if (!dmId) return;
    publish(`/app/dm/${dmId}/enter`, {});
    queryClient.setQueryData<DmList[]>(dmsQueryKey, (prev = []) =>
      prev.map((d) => (d.dmId === dmId ? { ...d, unreadCount: 0 } : d)),
    );
    return () => {
      publish(`/app/dm/${dmId}/leave`, {});
    };
  }, [dmId, queryClient]);

  useMessageSocketSync(dmId ? `/topic/dm/${dmId}` : null, dmMessagesQueryKey(dmId ?? ""));

  const sendMessage = (content: string) => {
    if (!dmId || !content.trim()) return;
    publish(`/app/dm/${dmId}`, { content });
  };

  const updateMessage = (messageId: string, content: string) => {
    if (!content.trim()) return;
    updateMessageMutation.mutate(
      { messageId, content },
      {
        onSuccess: () => setEditingMessage(null),
        onError: (err) => console.error("❌ 메시지 수정 실패:", err),
      },
    );
  };

  const deleteMessage = (messageId: string) => {
    deleteMessageMutation.mutate(messageId, {
      onError: (err) => console.error("❌ 메시지 삭제 실패:", err),
    });
  };

  const groupedMessages = groupMessagesByDay(messages, GROUPING_WINDOW_MS);

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
