import { useEffect, useRef, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useVoiceSettingsStore, type InputProfile } from "@/components/voice/use-voice-settings-store";
import { setMicGainLevel, setSpeakerVolumeLevel } from "@/components/voice/voice-connection";

// TODO: 지금은 UI 껍데기 — 실제 마이크/스피커 장치 전환과 발화 감도는 voice-connection.ts와
// 연동하는 다음 단계에서 구현 예정. 마이크 테스트, 마이크/스피커 음량은 실제 오디오를 다룬다.

const INPUT_PROFILES: { value: InputProfile; title: string; desc: string }[] = [
  { value: "isolation", title: "음성 격리", desc: "멋진 목소리만 들려 드릴게요. 소음은 Discord가 알아서 처리할게요" },
  { value: "studio", title: "스튜디오", desc: "순수 오디오: 프로세싱 없이 마이크 열기" },
  { value: "custom", title: "사용자 지정", desc: "고급 모드: 모든 버튼과 다이얼을 주세요!" },
];

const METER_BAR_COUNT = 32;

// 항상 같은 개수/모양의 바를 그리고, 음량(level)만큼만 색을 채운다 — on/off에 따라 막대 개수나
// 모양 자체가 달라지면 안 되므로 배열 길이는 절대 level에 의존하지 않는다.
function LevelMeter({ level, activeColor = "#f0b232" }: { level: number; activeColor?: string }) {
  const filled = Math.round(Math.min(1, Math.max(0, level)) * METER_BAR_COUNT);
  return (
    <div className="flex items-center gap-0.5 h-6 w-full">
      {Array.from({ length: METER_BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-full rounded-[1px] transition-colors"
          style={{ backgroundColor: i < filled ? activeColor : "#4e5058" }}
        />
      ))}
    </div>
  );
}

// 마이크/스피커 음량용 단순 슬라이더 — 트랙 색은 값이 바뀌어도, 호버/드래그해도 항상 같은 색이고
// (파란 채움 + 회색 나머지) 손잡이는 흰 동그라미. 손잡이에 마우스를 올리면 퍼센트만 툴팁으로 보여준다.
function VolumeSlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);

  const updateFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onChange(Math.round(ratio * 100));
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: PointerEvent) => updateFromClientX(e.clientX);
    const handleUp = () => setDragging(false);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  return (
    <div
      ref={trackRef}
      className="relative h-1.5 w-full cursor-pointer select-none rounded-full bg-[#4e5058]"
      onPointerDown={(e) => {
        setDragging(true);
        updateFromClientX(e.clientX);
      }}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-[#5865f2]" style={{ width: `${value}%` }} />
      <div
        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
        style={{ left: `${value}%` }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {(hovering || dragging) && (
          <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#111214] px-2 py-1 text-xs text-white shadow">
            {value}%
          </div>
        )}
      </div>
    </div>
  );
}

// 감도 임계값(드래그 가능한 손잡이, 초록/회색 트랙)과 실시간 마이크 음량(손잡이 위를 오가는
// 어두운 바)을 한 트랙에 같이 보여준다. 손잡이에 마우스를 올리면 대략적인 dB 값을 툴팁으로 표시.
function SensitivitySlider({
  value,
  onChange,
  liveLevel,
}: {
  value: number;
  onChange: (value: number) => void;
  liveLevel: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);

  const updateFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onChange(Math.round(ratio * 100));
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: PointerEvent) => updateFromClientX(e.clientX);
    const handleUp = () => setDragging(false);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  const levelPercent = Math.min(100, Math.max(0, liveLevel * 100));
  const dbLabel = Math.round((value / 100) * 60 - 60); // 0~100을 -60~0dB 느낌으로 근사 변환한 표시용 값

  return (
    <div
      ref={trackRef}
      className="relative mt-3 h-1.5 w-full cursor-pointer select-none rounded-full bg-[#4e5058]"
      onPointerDown={(e) => {
        setDragging(true);
        updateFromClientX(e.clientX);
      }}
    >
      <div className="absolute inset-y-0 left-0 rounded-full bg-[#23a55a]" style={{ width: `${value}%` }} />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-black/40 transition-[width] duration-75"
        style={{ width: `${levelPercent}%` }}
      />
      <div
        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#23a55a] bg-white shadow"
        style={{ left: `${value}%` }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {(hovering || dragging) && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#111214] px-2 py-1 text-xs text-white shadow">
            {dbLabel}dB
          </div>
        )}
      </div>
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
  const setInputProfile = useVoiceSettingsStore((s) => s.setInputProfile);
  const setAutoSensitivity = useVoiceSettingsStore((s) => s.setAutoSensitivity);
  const setSensitivityThreshold = useVoiceSettingsStore((s) => s.setSensitivityThreshold);

  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);
  const [micTestOn, setMicTestOn] = useState(false);
  const [micTestLevel, setMicTestLevel] = useState(0);
  const [sensitivityLevel, setSensitivityLevel] = useState(0);

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

  // 마이크 테스트: 켜져 있는 동안만 실제로 마이크를 잡아 음량을 실시간으로 미터에 반영한다.
  useEffect(() => {
    if (!micTestOn) {
      setMicTestLevel(0);
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let rafId = 0;

    void (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: inputDeviceId ? { deviceId: { exact: inputDeviceId } } : true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(data);
          const average = data.reduce((sum, v) => sum + v, 0) / data.length;
          setMicTestLevel(average / 255);
          rafId = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) {
        console.error("마이크 테스트 실패", e);
        setMicTestOn(false);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      stream?.getTracks().forEach((t) => t.stop());
      void audioContext?.close();
    };
  }, [micTestOn, inputDeviceId]);

  // 입력 감도(수동) 화면이 보이는 동안 실시간 음량을 슬라이더 위에 표시한다.
  useEffect(() => {
    const shouldTrack = inputProfile === "custom" && !autoSensitivity;
    if (!shouldTrack) {
      setSensitivityLevel(0);
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let rafId = 0;

    void (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: inputDeviceId ? { deviceId: { exact: inputDeviceId } } : true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(data);
          const average = data.reduce((sum, v) => sum + v, 0) / data.length;
          setSensitivityLevel(average / 255);
          rafId = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) {
        console.error("입력 감도 미리듣기 실패", e);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      stream?.getTracks().forEach((t) => t.stop());
      void audioContext?.close();
    };
  }, [inputProfile, autoSensitivity, inputDeviceId]);

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
          <VolumeSlider value={micVolume} onChange={setMicGainLevel} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#96989d] uppercase mb-2">스피커 음량</label>
          <VolumeSlider value={speakerVolume} onChange={setSpeakerVolumeLevel} />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={() => setMicTestOn((v) => !v)}
          className={
            micTestOn
              ? "px-4 py-2 rounded text-sm font-medium bg-[#5865f2] hover:bg-[#4752c4] text-white transition-colors shrink-0"
              : "px-4 py-2 rounded text-sm font-medium bg-[#4e5058] hover:bg-[#6d6f78] text-white transition-colors shrink-0"
          }
        >
          {micTestOn ? "테스트 정지하기" : "마이크 테스트"}
        </button>
        <LevelMeter level={micTestLevel} />
      </div>
      {micTestOn ? (
        <p className="text-sm text-[#96989d] mb-6">멋진 목소리를 재생하고 있어요</p>
      ) : (
        <p className="text-sm text-[#96989d] mb-6">도움이 필요하신가요? 문제 해결 가이드를 확인하세요.</p>
      )}

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
          <div className="flex items-center justify-between gap-4 mb-1">
            <div>
              <p className="text-sm font-semibold text-white">입력 감도 자동 조정하기</p>
              <p className="text-xs text-[#96989d]">
                {autoSensitivity
                  ? "Discord가 마이크에서 전송하는 소리의 양을 조절합니다. 마이크 감도를 테스트하려면 말을 해보세요. Discord가 여러분의 멋진 목소리를 제대로 전송하고 있다면 미터가 채워질 거예요."
                  : "Discord가 마이크에서 전송하는 소리의 양을 조절해요."}
              </p>
            </div>
            <Switch checked={autoSensitivity} onCheckedChange={setAutoSensitivity} className="shrink-0" />
          </div>
          {!autoSensitivity && (
            <SensitivitySlider value={sensitivityThreshold} onChange={setSensitivityThreshold} liveLevel={sensitivityLevel} />
          )}
        </div>
      )}
    </div>
  );
}