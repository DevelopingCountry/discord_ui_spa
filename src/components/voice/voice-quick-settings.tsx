import { useEffect, useState, type ReactNode } from "react";
import { ChevronRight, Settings } from "lucide-react";
import { VolumeSlider } from "@/components/voice/volume-slider";
import { useVoiceSettingsStore, type InputProfile } from "@/components/voice/use-voice-settings-store";
import { setMicGainLevel, setSpeakerVolumeLevel } from "@/components/voice/voice-connection";

const INPUT_PROFILE_LABELS: Record<InputProfile, string> = {
  isolation: "음성 격리",
  studio: "스튜디오",
  custom: "사용자 지정",
};

function deviceLabel(devices: MediaDeviceInfo[], deviceId: string | null): string {
  if (!deviceId) return "시스템 기본 설정";
  return devices.find((d) => d.deviceId === deviceId)?.label || "시스템 기본 설정";
}

function ExpandableRow({
  title,
  value,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  value: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 rounded px-1 py-1 text-left hover:bg-[#3f4147] transition-colors"
      >
        <span className="min-w-0">
          <span className="block text-xs font-semibold text-[#96989d] uppercase">{title}</span>
          <span className="block truncate text-sm text-white">{value}</span>
        </span>
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-[#96989d] transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>
      {expanded && <div className="mt-1 mb-2 space-y-0.5 pl-1">{children}</div>}
    </div>
  );
}

function DeviceOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full truncate rounded px-2 py-1.5 text-left text-sm ${
        active ? "bg-[#5865f2] text-white" : "text-[#dbdee1] hover:bg-[#3f4147]"
      }`}
    >
      {label}
    </button>
  );
}

function QuickSettingsPanel({ children }: { children: ReactNode }) {
  return <div className="w-72 rounded-lg bg-[#111214] p-3 text-white shadow-lg">{children}</div>;
}

function VoiceSettingsShortcut({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded px-1 py-1.5 text-left text-sm font-medium text-white transition-colors hover:bg-[#3f4147]"
    >
      음성 설정
      <Settings className="h-4 w-4 text-[#96989d]" />
    </button>
  );
}

export function MicQuickSettings({ onOpenFullSettings }: { onOpenFullSettings: () => void }) {
  const inputDeviceId = useVoiceSettingsStore((s) => s.inputDeviceId);
  const inputProfile = useVoiceSettingsStore((s) => s.inputProfile);
  const micVolume = useVoiceSettingsStore((s) => s.micVolume);
  const setInputDeviceId = useVoiceSettingsStore((s) => s.setInputDeviceId);
  const setInputProfile = useVoiceSettingsStore((s) => s.setInputProfile);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceExpanded, setDeviceExpanded] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);

  useEffect(() => {
    if (!deviceExpanded) return;
    void navigator.mediaDevices.enumerateDevices().then((all) => {
      setDevices(all.filter((d) => d.kind === "audioinput"));
    });
  }, [deviceExpanded]);

  return (
    <QuickSettingsPanel>
      <ExpandableRow
        title="녹음 장치"
        value={deviceLabel(devices, inputDeviceId)}
        expanded={deviceExpanded}
        onToggle={() => {
          setDeviceExpanded((v) => !v);
          setProfileExpanded(false);
        }}
      >
        <DeviceOption label="시스템 기본 설정" active={!inputDeviceId} onClick={() => setInputDeviceId(null)} />
        {devices.map((d) => (
          <DeviceOption
            key={d.deviceId}
            label={d.label || "마이크"}
            active={inputDeviceId === d.deviceId}
            onClick={() => setInputDeviceId(d.deviceId)}
          />
        ))}
      </ExpandableRow>

      <div className="my-2 h-px bg-[#3f4147]" />

      <ExpandableRow
        title="입력 프로필"
        value={INPUT_PROFILE_LABELS[inputProfile]}
        expanded={profileExpanded}
        onToggle={() => {
          setProfileExpanded((v) => !v);
          setDeviceExpanded(false);
        }}
      >
        {(Object.keys(INPUT_PROFILE_LABELS) as InputProfile[]).map((p) => (
          <DeviceOption
            key={p}
            label={INPUT_PROFILE_LABELS[p]}
            active={inputProfile === p}
            onClick={() => setInputProfile(p)}
          />
        ))}
      </ExpandableRow>

      <div className="my-2 h-px bg-[#3f4147]" />

      <div className="px-1 pb-1">
        <span className="mb-2 block text-xs font-semibold text-[#96989d] uppercase">입력 음량</span>
        <VolumeSlider value={micVolume} onChange={setMicGainLevel} />
      </div>

      <div className="my-2 h-px bg-[#3f4147]" />

      <VoiceSettingsShortcut onClick={onOpenFullSettings} />
    </QuickSettingsPanel>
  );
}

export function SpeakerQuickSettings({ onOpenFullSettings }: { onOpenFullSettings: () => void }) {
  const outputDeviceId = useVoiceSettingsStore((s) => s.outputDeviceId);
  const speakerVolume = useVoiceSettingsStore((s) => s.speakerVolume);
  const setOutputDeviceId = useVoiceSettingsStore((s) => s.setOutputDeviceId);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceExpanded, setDeviceExpanded] = useState(false);

  useEffect(() => {
    if (!deviceExpanded) return;
    void navigator.mediaDevices.enumerateDevices().then((all) => {
      setDevices(all.filter((d) => d.kind === "audiooutput"));
    });
  }, [deviceExpanded]);

  return (
    <QuickSettingsPanel>
      <ExpandableRow
        title="출력 장치"
        value={deviceLabel(devices, outputDeviceId)}
        expanded={deviceExpanded}
        onToggle={() => setDeviceExpanded((v) => !v)}
      >
        <DeviceOption label="시스템 기본 설정" active={!outputDeviceId} onClick={() => setOutputDeviceId(null)} />
        {devices.map((d) => (
          <DeviceOption
            key={d.deviceId}
            label={d.label || "스피커"}
            active={outputDeviceId === d.deviceId}
            onClick={() => setOutputDeviceId(d.deviceId)}
          />
        ))}
      </ExpandableRow>

      <div className="my-2 h-px bg-[#3f4147]" />

      <div className="px-1 pb-1">
        <span className="mb-2 block text-xs font-semibold text-[#96989d] uppercase">출력 음량</span>
        <VolumeSlider value={speakerVolume} onChange={setSpeakerVolumeLevel} />
      </div>

      <div className="my-2 h-px bg-[#3f4147]" />

      <VoiceSettingsShortcut onClick={onOpenFullSettings} />
    </QuickSettingsPanel>
  );
}