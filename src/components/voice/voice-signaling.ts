import { WS_URL } from "@/lib/config";
import type { VoiceSignal } from "@/components/voice/voice-types";

let ws: WebSocket | null = null;
const listeners = new Set<(msg: VoiceSignal) => void>();

export function connectVoiceSocket(accessToken: string): Promise<void> {
  if (ws && ws.readyState === WebSocket.OPEN) return Promise.resolve();
  if (ws) {
    ws.close();
    ws = null;
  }

  return new Promise((resolve, reject) => {
    const socket = new WebSocket(`${WS_URL}/ws/voice?token=${accessToken}`);

    socket.onopen = () => {
      resolve();
    };
    socket.onerror = () => {
      if (socket.readyState !== WebSocket.OPEN) reject(new Error("음성 서버 연결 실패"));
    };
    socket.onmessage = (event) => {
      let msg: VoiceSignal;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      listeners.forEach((cb) => cb(msg));
    };
    socket.onclose = () => {
      if (ws === socket) ws = null;
    };

    ws = socket;
  });
}

export function disconnectVoiceSocket(): void {
  ws?.close();
  ws = null;
}

export function sendVoiceSignal(msg: VoiceSignal): void {
  if (ws?.readyState !== WebSocket.OPEN) {
    console.warn("음성 소켓이 연결되어 있지 않아 메시지를 보낼 수 없습니다.", msg);
    return;
  }
  ws.send(JSON.stringify(msg));
}

export function onVoiceSignal(cb: (msg: VoiceSignal) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}