import { create } from "zustand";
import type { VoiceConnectionStatus } from "@/components/voice/voice-types";

export interface VoiceParticipant {
  userId: string;
  nickname: string | null;
  stream: MediaStream | null;
  audioMuted: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  speaking: boolean;
}

interface VoiceStoreState {
  status: VoiceConnectionStatus;
  serverId: string | null;
  channelId: string | null;
  channelName: string | null;
  micMuted: boolean;
  deafened: boolean;
  cameraOn: boolean;
  screenSharing: boolean;
  localStream: MediaStream | null;
  localSpeaking: boolean;
  participants: Record<string, VoiceParticipant>;

  setStatus: (status: VoiceConnectionStatus) => void;
  setChannel: (info: { serverId: string; channelId: string; channelName?: string } | null) => void;
  setLocalMic: (muted: boolean) => void;
  setLocalDeafen: (deafened: boolean) => void;
  setLocalCamera: (on: boolean) => void;
  setLocalScreenShare: (on: boolean) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setLocalSpeaking: (speaking: boolean) => void;
  upsertParticipant: (userId: string) => void;
  removeParticipant: (userId: string) => void;
  setParticipantStream: (userId: string, stream: MediaStream | null) => void;
  setParticipantSpeaking: (userId: string, speaking: boolean) => void;
  setParticipantMediaState: (
    userId: string,
    patch: Partial<Pick<VoiceParticipant, "audioMuted" | "videoEnabled" | "screenSharing" | "nickname">>,
  ) => void;
  reset: () => void;
}

const initialState = {
  status: "idle" as VoiceConnectionStatus,
  serverId: null,
  channelId: null,
  channelName: null,
  micMuted: false,
  deafened: false,
  cameraOn: false,
  screenSharing: false,
  localStream: null,
  localSpeaking: false,
  participants: {},
};

export const useVoiceStore = create<VoiceStoreState>((set) => ({
  ...initialState,

  setStatus: (status) => set({ status }),
  setChannel: (info) =>
    set(
      info
        ? { serverId: info.serverId, channelId: info.channelId, channelName: info.channelName ?? null }
        : { serverId: null, channelId: null, channelName: null },
    ),
  setLocalMic: (muted) => set({ micMuted: muted }),
  setLocalDeafen: (deafened) => set({ deafened }),
  setLocalCamera: (on) => set({ cameraOn: on }),
  setLocalScreenShare: (on) => set({ screenSharing: on }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setLocalSpeaking: (speaking) =>
    set((state) => (state.localSpeaking === speaking ? state : { localSpeaking: speaking })),

  upsertParticipant: (userId) =>
    set((state) => {
      if (state.participants[userId]) return state;
      return {
        participants: {
          ...state.participants,
          [userId]: {
            userId,
            nickname: null,
            stream: null,
            audioMuted: false,
            videoEnabled: false,
            screenSharing: false,
            speaking: false,
          },
        },
      };
    }),
  removeParticipant: (userId) =>
    set((state) => {
      const next = { ...state.participants };
      delete next[userId];
      return { participants: next };
    }),
  setParticipantStream: (userId, stream) =>
    set((state) => {
      const existing = state.participants[userId];
      if (!existing) return state;
      return { participants: { ...state.participants, [userId]: { ...existing, stream } } };
    }),
  setParticipantSpeaking: (userId, speaking) =>
    set((state) => {
      const existing = state.participants[userId];
      if (!existing || existing.speaking === speaking) return state;
      return { participants: { ...state.participants, [userId]: { ...existing, speaking } } };
    }),
  setParticipantMediaState: (userId, patch) =>
    set((state) => {
      const existing = state.participants[userId];
      if (!existing) return state;
      return { participants: { ...state.participants, [userId]: { ...existing, ...patch } } };
    }),

  reset: () => set({ ...initialState, participants: {} }),
}));