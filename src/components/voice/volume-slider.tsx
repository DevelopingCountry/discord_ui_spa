import { useEffect, useRef, useState } from "react";

// 마이크/스피커 음량용 단순 슬라이더 — 트랙 색은 값이 바뀌어도, 호버/드래그해도 항상 같은 색이고
// (파란 채움 + 회색 나머지) 손잡이는 흰 동그라미. 손잡이에 마우스를 올리면 퍼센트만 툴팁으로 보여준다.
export function VolumeSlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
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