import { useEffect, useRef } from "react";
import { subscribe } from "@/lib/socket";

export function useSocketSubscribe<T = unknown>(destination: string | null | undefined, onMessage: (body: T) => void) {
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage;

  useEffect(() => {
    if (!destination) return;
    return subscribe(destination, (body) => callbackRef.current(body as T));
  }, [destination]);
}
