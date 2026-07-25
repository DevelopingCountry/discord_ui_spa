export function appendMessage<T extends { messageId: string }>(prev: T[] = [], msg: T): T[] {
  if (prev.some((m) => m.messageId === msg.messageId)) return prev;
  return [...prev, msg];
}

export function patchMessageContent<T extends { messageId: string; content: string }>(
  prev: T[] = [],
  messageId: string,
  content: string,
): T[] {
  return prev.map((m) => (m.messageId === messageId ? { ...m, content } : m));
}

export function removeMessage<T extends { messageId: string }>(prev: T[] = [], messageId: string): T[] {
  return prev.filter((m) => m.messageId !== messageId);
}
