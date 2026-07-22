import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useVoiceSettingsStore, type InputProfile } from "@/components/voice/use-voice-settings-store";


const INPUT_PROFILES: { value: InputProfile; title: string; desc: string }[] = [
  { value: "custom", title: "사용자 지정", desc: "고급 모드: 모든 버튼과 다이얼을 주세요!" },
];

function LevelMeter({ level }: { level: number }) {
  const barCount = 32;
  const filled = Math.round(Math.min(1, level) * barCount);
  return (
    <div className="flex items-center gap-0.5 h-6 w-full">
      {Array.from({ length: barCount }).map((_, i) => (
        <div key={i} className={cn("flex-1 h-full rounded-[1px]", i < filled ? "bg-[#5865f2]" : "bg-[#1e1f22]")} />
      ))}
    </div>
  );
}

export function VoiceVideoSettings() {
  const inputDeviceId = useVoiceSettingsStore((s) => s.inputDeviceId);
  const outputDeviceId = useVoiceSettingsStore((s) => s.outputDeviceId);
  const micVolume = useVoiceSettingsStore((s) => s.micVolume);
  const speakerVolume = useVoiceSettingsStore((s) => s.speakerVolume);
  const inputProfile = useVoiceSettingsStore((s) => s.inputProfile);
  const autoSensitivity = useVoiceSettingsStore((s) => s.autoSensitivity);
  const sensitivityThreshold = useVoiceSettingsStore((s) => s.sensitivityThreshold);
  const setInputDeviceId = useVoiceSettingsStore((s) => s.setInputDeviceId);
  const setOutputDeviceId = useVoiceSettingsStore((s) => s.setOutputDeviceId);
  const setMicVolume = useVoiceSettingsStore((s) => s.setMicVolume);
  const setSpeakerVolume = useVoiceSettingsStore((s) => s.setSpeakerVolume);
  const setInputProfile = useVoiceSettingsStore((s) => s.setInputProfile);
  const setAutoSensitivity = useVoiceSettingsStore((s) => s.setAutoSensitivity);
  const setSensitivityThreshold = useVoiceSettingsStore((s) => s.setSensitivityThreshold);

  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);
  const [micTestOn, setMicTestOn] = useState(false);

  // 장치 "목록"만 조회(마이크 접근 권한 없이도 가능) — 실제 캡처/분석은 하지 않는다.
  useEffect(() => {
    let cancelled = false;
    const loadDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      if (cancelled) return;
      setAudioInputs(devices.filter((d) => d.kind === "audioinput"));
      setAudioOutputs(devices.filter((d) => d.kind === "audiooutput"));
    };
    void loadDevices();
    navigator.mediaDevices.addEventListener("devicechange", loadDevices);
    return () => {
      cancelled = true;
      navigator.mediaDevices.removeEventListener("devicechange", loadDevices);
    };
  }, []);

  return (
    <div className="text-white">
      <h2 className="text-xl font-semibold mb-6">음성</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-[#96989d] uppercase mb-2">마이크</label>
          <select
            value={inputDeviceId ?? ""}
            onChange={(e) => setInputDeviceId(e.target.value || null)}
            className="w-full bg-[#1e1f22] border border-[#1e1f22] text-white text-sm rounded px-2.5 py-2 focus:outline-none focus:border-[#5865f2]"
          >
            <option value="">시스템 기본 장치</option>
            {audioInputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `마이크 (${d.deviceId.slice(0, 6)})`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#96989d] uppercase mb-2">스피커</label>
          <select
            value={outputDeviceId ?? ""}
            onChange={(e) => setOutputDeviceId(e.target.value || null)}
            className="w-full bg-[#1e1f22] border border-[#1e1f22] text-white text-sm rounded px-2.5 py-2 focus:outline-none focus:border-[#5865f2]"
          >
            <option value="">시스템 기본 장치</option>
            {audioOutputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `스피커 (${d.deviceId.slice(0, 6)})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-[#96989d] uppercase mb-2">마이크 음량</label>
          <input
            type="range"
            min={0}
            max={100}
            value={micVolume}
            onChange={(e) => setMicVolume(Number(e.target.value))}
            className="w-full accent-[#5865f2]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#96989d] uppercase mb-2">스피커 음량</label>
          <input
            type="range"
            min={0}
            max={100}
            value={speakerVolume}
            onChange={(e) => setSpeakerVolume(Number(e.target.value))}
            className="w-full accent-[#5865f2]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={() => setMicTestOn((v) => !v)}
          className="px-4 py-2 rounded text-sm font-medium bg-[#4e5058] hover:bg-[#6d6f78] text-white transition-colors shrink-0"
        >
          {micTestOn ? "테스트 중지" : "마이크 테스트"}
        </button>
        <LevelMeter level={micTestOn ? 0.35 : 0} />
      </div>
      <p className="text-sm text-[#96989d] mb-6">도움이 필요하신가요? 문제 해결 가이드를 확인하세요.</p>

      <div className="h-px bg-[#3f4147] mb-6" />

      <h3 className="text-xs font-semibold text-[#96989d] uppercase mb-3">입력 프로필</h3>
      <RadioGroup value={inputProfile} onValueChange={(v) => setInputProfile(v as InputProfile)} className="mb-6">
        {INPUT_PROFILES.map((opt) => (
          <label
            key={opt.value}
            className="flex items-start gap-3 p-3 rounded-lg border border-[#3f4147] hover:bg-[#2b2d31] cursor-pointer"
          >
            <RadioGroupItem value={opt.value} className="mt-0.5" />
            <span>
              <span className="block text-sm font-semibold text-white">{opt.title}</span>
              <span className="block text-xs text-[#96989d]">{opt.desc}</span>
            </span>
          </label>
        ))}
      </RadioGroup>

      {inputProfile === "custom" && (
        <div>
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <p className="text-sm font-semibold text-white">입력 감도 자동 조정하기</p>
              <p className="text-xs text-[#96989d]">
                Discord가 마이크에서 전송하는 소리의 양을 조절합니다. 마이크 감도를 테스트하려면 말을 해보세요.
                Discord가 여러분의 멋진 목소리를 제대로 전송하고 있다면 미터가 채워질 거예요.
              </p>
            </div>
            <Switch checked={autoSensitivity} onCheckedChange={setAutoSensitivity} className="shrink-0" />
          </div>
          <LevelMeter level={0.2} />
          {!autoSensitivity && (
            <input
              type="range"
              min={0}
              max={100}
              value={sensitivityThreshold}
              onChange={(e) => setSensitivityThreshold(Number(e.target.value))}
              className="w-full accent-red-500 mt-2"
            />
          )}
        </div>
      )}
    </div>
  );
}