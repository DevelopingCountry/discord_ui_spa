export type VoiceSignal =
  | { type: "join"; channelId: string; userId: string }
  | { type: "leave"; channelId: string; userId: string }
  | { type: "user-joined"; channelId: string; userId: string }
  | { type: "user-left"; channelId: string; userId: string }
  | { type: "offer"; channelId: string; userId: string; targetUserId: string; offer: RTCSessionDescriptionInit }
  | { type: "answer"; channelId: string; userId: string; targetUserId: string; answer: RTCSessionDescriptionInit }
  | {
      type: "ice-candidate";
      channelId: string;
      userId: string;
      targetUserId: string;
      candidate: RTCIceCandidateInit;
    }
  | {
      type: "media-state";
      channelId: string;
      userId: string;
      nickname: string;
      audioMuted: boolean;
      videoEnabled: boolean;
      screenSharing: boolean;
    };

export type VoiceConnectionStatus = "idle" | "connecting" | "connected";