type Groupable = {
  messageId: string;
  userId: string;
  nickName: string;
  imageUrl?: string;
  content: string;
  createdAt: string;
};

export type MessageGroup = {
  userId: string;
  nickName: string;
  avatarUrl?: string;
  timeLabel: string;
  messages: { messageId: string; content: string; createdAt: string }[];
};

export type GroupedDay = { dateLabel: string; messageGroups: MessageGroup[] };

export function formatTime(d: string) {
  return new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "numeric", hour12: true }).format(new Date(d));
}

export function formatDate(d: string) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(d));
}

export function groupMessagesByDay<T extends Groupable>(messages: T[], groupingWindowMs: number): GroupedDay[] {
  const grouped: GroupedDay[] = [];
  let currentDateKey = "";
  let currentDay: GroupedDay | null = null;
  let currentGroup: MessageGroup | null = null;
  let lastMessageTime: Date | null = null;

  messages.forEach((msg) => {
    const date = new Date(msg.createdAt);
    const dateKey = date.toDateString();
    if (dateKey !== currentDateKey) {
      currentDateKey = dateKey;
      currentDay = { dateLabel: formatDate(msg.createdAt), messageGroups: [] };
      grouped.push(currentDay);
      currentGroup = null;
    }

    const sameGroup =
      currentGroup &&
      currentGroup.userId === msg.userId &&
      lastMessageTime &&
      date.getTime() - lastMessageTime.getTime() <= groupingWindowMs;

    if (sameGroup) {
      currentGroup!.messages.push({ messageId: msg.messageId, content: msg.content, createdAt: msg.createdAt });
    } else {
      currentGroup = {
        userId: msg.userId,
        nickName: msg.nickName,
        avatarUrl: msg.imageUrl,
        timeLabel: formatTime(msg.createdAt),
        messages: [{ messageId: msg.messageId, content: msg.content, createdAt: msg.createdAt }],
      };
      currentDay!.messageGroups.push(currentGroup);
    }
    lastMessageTime = date;
  });

  return grouped;
}
