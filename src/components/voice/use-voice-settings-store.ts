import { create } from "zustand";

export type InputProfile = "isolation" | "studio" | "custom";

interface VoiceSettingsState {
  inputDeviceId: string | null;
  outputDeviceId: string | null;
  micVolume: number; // 0~100
  speakerVolume: number; // 0~100
  inputProfile: InputProfile;
  autoSensitivity: boolean;
  sensitivityThreshold: number; // 0~100, 사용자 지정 프로필 + 수동 감도일 때만 사용

  setInputDeviceId: (id: string | null) => void;
  setOutputDeviceId: (id: string | null) => void;
  setMicVolume: (v: number) => void;
  setSpeakerVolume: (v: number) => void;
  setInputProfile: (p: InputProfile) => void;
  setAutoSensitivity: (v: boolean) => void;
  setSensitivityThreshold: (v: number) => void;
}

export const useVoiceSettingsStore = create<VoiceSettingsState>((set) => ({
  inputDeviceId: null,
  outputDeviceId: null,
  micVolume: 100,
  speakerVolume: 100,
  inputProfile: "isolation",
  autoSensitivity: true,
  sensitivityThreshold: 15,

  setInputDeviceId: (id) => set({ inputDeviceId: id }),
  setOutputDeviceId: (id) => set({ outputDeviceId: id }),
  setMicVolume: (v) => set({ micVolume: v }),
  setSpeakerVolume: (v) => set({ speakerVolume: v }),
  setInputProfile: (p) => set({ inputProfile: p }),
  setAutoSensitivity: (v) => set({ autoSensitivity: v }),
  setSensitivityThreshold: (v) => set({ sensitivityThreshold: v }),
}));