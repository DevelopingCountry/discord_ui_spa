import { connectVoiceSocket, disconnectVoiceSocket, onVoiceSignal, sendVoiceSignal } from "@/components/voice/voice-signaling";
import { useVoiceStore } from "@/components/voice/use-voice-store";
import { useVoiceSettingsStore } from "@/components/voice/use-voice-settings-store";
import type { VoiceSignal } from "@/components/voice/voice-types";

const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];
const SPEAKING_THRESHOLD = 12; // getByteFrequencyData 평균값 기준(0~255), 경험적으로 조정한 값
const SPEAKING_HANGOVER_MS = 300; // 말 사이 짧은 침묵에 테두리가 깜빡이지 않도록 유지하는 시간

const peers = new Map<string, RTCPeerConnection>();
const makingOffer = new Map<string, boolean>();
const ignoreOffer = new Map<string, boolean>();
const pendingCandidates = new Map<string, RTCIceCandidateInit[]>();
const audioEls = new Map<string, HTMLAudioElement>();
const videoSenders = new Map<string, RTCRtpSender>();
const remoteStreams = new Map<string, MediaStream>();
const speakingDetectors = new Map<string, () => void>();

let unsubscribeSignal: (() => void) | null = null;
let myUserId: string | null = null;
let myNickname = "";
let currentChannelId: string | null = null;

let localAudioTrack: MediaStreamTrack | null = null;
let localVideoTrack: MediaStreamTrack | null = null;
let micMutedBeforeDeafen = false;
let stopLocalSpeakingDetector: (() => void) | null = null;

// 마이크 음량 슬라이더용 오디오 그래프: 실제 마이크 캡처 → GainNode → 가상 목적지
// (그 결과 트랙을 피어에 전송 + 발화감지에도 사용)
let micAudioContext: AudioContext | null = null;
let micGainNode: GainNode | null = null;
let rawMicStream: MediaStream | null = null;

async function acquireMicTrack(): Promise<MediaStreamTrack> {
  rawMicStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  micAudioContext = new AudioContext();
  // getUserMedia 권한 프롬프트를 기다리는 동안(await) 브라우저의 "사용자 제스처" 유효기간이
  // 끝나버려 AudioContext가 suspended 상태로 생성될 수 있다 — resume()을 명시적으로 호출하지
  // 않으면 이 그래프를 지나는 오디오(피어 전송 + 발화 감지 둘 다)가 조용히 무음이 된다.
  await micAudioContext.resume();
  const source = micAudioContext.createMediaStreamSource(rawMicStream);
  micGainNode = micAudioContext.createGain();
  micGainNode.gain.value = useVoiceSettingsStore.getState().micVolume / 100;
  const destination = micAudioContext.createMediaStreamDestination();
  source.connect(micGainNode).connect(destination);

  return destination.stream.getAudioTracks()[0];
}

function teardownMicPipeline() {
  rawMicStream?.getTracks().forEach((t) => t.stop());
  rawMicStream = null;
  micGainNode?.disconnect();
  micGainNode = null;
  void micAudioContext?.close();
  micAudioContext = null;
}

export function setMicGainLevel(percent: number): void {
  useVoiceSettingsStore.getState().setMicVolume(percent);
  if (micGainNode) micGainNode.gain.value = percent / 100;
}

export function setSpeakerVolumeLevel(percent: number): void {
  useVoiceSettingsStore.getState().setSpeakerVolume(percent);
  audioEls.forEach((el) => {
    el.volume = percent / 100;
  });
}

// 노이즈 게이트 상태 — "사용자 지정" 프로필 + 수동 감도일 때만 음량이 임계값 아래로 내려가면
// 실제 전송 트랙을 자동으로 닫는다(무음 처리). 수동 음소거와는 별개 축이라 둘을 합쳐서 계산한다.
let micGateOpen = true;

function applyMicTrackEnabled() {
  if (!localAudioTrack) return;
  localAudioTrack.enabled = !useVoiceStore.getState().micMuted && micGateOpen;
}

// 로컬 마이크 전용: 발화 테두리 표시(고정 임계값)와 감도 노이즈 게이트(설정된 임계값)를
// 하나의 analyser 루프에서 같이 처리한다. 원격 참가자 쪽은 여전히 attachSpeakingDetector를 쓴다.
function attachLocalMicControl(stream: MediaStream): () => void {
  if (stream.getAudioTracks().length === 0) return () => {};

  const audioContext = new AudioContext();
  void audioContext.resume(); // acquireMicTrack과 동일한 이유로 suspended 상태 방지
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);

  const data = new Uint8Array(analyser.frequencyBinCount);
  let speaking = false;
  let silenceStartedAt = 0;
  let rafId = 0;

  const tick = () => {
    analyser.getByteFrequencyData(data);
    const average = data.reduce((sum, v) => sum + v, 0) / data.length;

    if (average > SPEAKING_THRESHOLD) {
      silenceStartedAt = 0;
      if (!speaking) {
        speaking = true;
        useVoiceStore.getState().setLocalSpeaking(true);
      }
    } else if (speaking) {
      if (silenceStartedAt === 0) {
        silenceStartedAt = performance.now();
      } else if (performance.now() - silenceStartedAt > SPEAKING_HANGOVER_MS) {
        speaking = false;
        useVoiceStore.getState().setLocalSpeaking(false);
      }
    }

    const settings = useVoiceSettingsStore.getState();
    const gatingActive = settings.inputProfile === "custom" && !settings.autoSensitivity;
    const shouldOpen = !gatingActive || average / 255 > settings.sensitivityThreshold / 100;
    if (shouldOpen !== micGateOpen) {
      micGateOpen = shouldOpen;
      applyMicTrackEnabled();
    }

    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    source.disconnect();
    void audioContext.close();
  };
}

function attachSpeakingDetector(stream: MediaStream, onChange: (speaking: boolean) => void): () => void {
  if (stream.getAudioTracks().length === 0) return () => {};

  const audioContext = new AudioContext();
  void audioContext.resume(); // acquireMicTrack과 동일한 이유로 suspended 상태 방지
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser); // destination에는 연결하지 않음 — 재생이 아니라 분석 전용

  const data = new Uint8Array(analyser.frequencyBinCount);
  let speaking = false;
  let silenceStartedAt = 0;
  let rafId = 0;

  const tick = () => {
    analyser.getByteFrequencyData(data);
    const average = data.reduce((sum, v) => sum + v, 0) / data.length;

    if (average > SPEAKING_THRESHOLD) {
      silenceStartedAt = 0;
      if (!speaking) {
        speaking = true;
        onChange(true);
      }
    } else if (speaking) {
      if (silenceStartedAt === 0) {
        silenceStartedAt = performance.now();
      } else if (performance.now() - silenceStartedAt > SPEAKING_HANGOVER_MS) {
        speaking = false;
        onChange(false);
      }
    }

    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    source.disconnect();
    void audioContext.close();
  };
}

function isPolite(peerId: string): boolean {
  return myUserId! < peerId;
}

function attachRemoteAudio(peerId: string, stream: MediaStream) {
  let el = audioEls.get(peerId);
  if (!el) {
    el = document.createElement("audio");
    el.autoplay = true;
    el.muted = useVoiceStore.getState().deafened;
    el.volume = useVoiceSettingsStore.getState().speakerVolume / 100;
    document.body.appendChild(el);
    audioEls.set(peerId, el);
  }
  el.srcObject = stream;
}

function detachRemoteAudio(peerId: string) {
  const el = audioEls.get(peerId);
  if (el) {
    el.srcObject = null;
    el.remove();
    audioEls.delete(peerId);
  }
}

async function flushPendingCandidates(peerId: string) {
  const pc = peers.get(peerId);
  const queued = pendingCandidates.get(peerId);
  if (!pc || !queued) return;
  pendingCandidates.delete(peerId);
  for (const candidate of queued) {
    try {
      await pc.addIceCandidate(candidate);
    } catch (e) {
      if (!ignoreOffer.get(peerId)) console.error("ICE candidate 추가 실패", e);
    }
  }
}

function getOrCreatePeer(peerId: string): RTCPeerConnection {
  const existing = peers.get(peerId);
  if (existing) return existing;

  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  makingOffer.set(peerId, false);
  ignoreOffer.set(peerId, false);
  peers.set(peerId, pc);
  remoteStreams.set(peerId, new MediaStream());

  if (localAudioTrack) pc.addTrack(localAudioTrack);
  if (localVideoTrack) videoSenders.set(peerId, pc.addTrack(localVideoTrack));

  pc.onnegotiationneeded = async () => {
    try {
      makingOffer.set(peerId, true);
      await pc.setLocalDescription();
      sendVoiceSignal({
        type: "offer",
        channelId: currentChannelId!,
        userId: myUserId!,
        targetUserId: peerId,
        offer: pc.localDescription!,
      });
    } catch (e) {
      console.error("협상(offer) 생성 실패", e);
    } finally {
      makingOffer.set(peerId, false);
    }
  };

  pc.onicecandidate = ({ candidate }) => {
    if (!candidate) return;
    sendVoiceSignal({
      type: "ice-candidate",
      channelId: currentChannelId!,
      userId: myUserId!,
      targetUserId: peerId,
      candidate: candidate.toJSON(),
    });
  };

  pc.ontrack = (event) => {
    // 오디오/비디오 트랙이 서로 다른 시점에(별도 msid로) 도착할 수 있으므로,
    // 트랙별로 새 스트림을 쓰지 않고 참가자당 하나의 스트림에 계속 누적한다.
    // 그렇지 않으면 나중에 도착한 트랙이 이전 트랙의 스트림 참조를 덮어써 사라진다.
    const remoteStream = remoteStreams.get(peerId);
    if (!remoteStream) return;
    remoteStream.addTrack(event.track);
    if (event.track.kind === "audio") {
      attachRemoteAudio(peerId, remoteStream);
      speakingDetectors.set(
        peerId,
        attachSpeakingDetector(remoteStream, (speaking) =>
          useVoiceStore.getState().setParticipantSpeaking(peerId, speaking),
        ),
      );
    }
    useVoiceStore.getState().setParticipantStream(peerId, remoteStream);

    event.track.onended = () => {
      remoteStream.removeTrack(event.track);
      useVoiceStore.getState().setParticipantStream(peerId, remoteStream);
    };
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "failed" || pc.connectionState === "closed") {
      console.warn(`피어 ${peerId} 연결 상태: ${pc.connectionState}`);
    }
  };

  return pc;
}

function closePeer(peerId: string) {
  peers.get(peerId)?.close();
  peers.delete(peerId);
  makingOffer.delete(peerId);
  ignoreOffer.delete(peerId);
  pendingCandidates.delete(peerId);
  videoSenders.delete(peerId);
  remoteStreams.delete(peerId);
  speakingDetectors.get(peerId)?.();
  speakingDetectors.delete(peerId);
  detachRemoteAudio(peerId);
}

async function handleOffer(peerId: string, offer: RTCSessionDescriptionInit) {
  const pc = getOrCreatePeer(peerId);
  const polite = isPolite(peerId);
  const collision = makingOffer.get(peerId) || pc.signalingState !== "stable";
  ignoreOffer.set(peerId, !polite && collision);
  if (ignoreOffer.get(peerId)) return;

  await pc.setRemoteDescription(offer);
  await flushPendingCandidates(peerId);
  await pc.setLocalDescription();
  sendVoiceSignal({
    type: "answer",
    channelId: currentChannelId!,
    userId: myUserId!,
    targetUserId: peerId,
    answer: pc.localDescription!,
  });
}

async function handleAnswer(peerId: string, answer: RTCSessionDescriptionInit) {
  const pc = peers.get(peerId);
  if (!pc) return;
  await pc.setRemoteDescription(answer);
  await flushPendingCandidates(peerId);
}

async function handleIceCandidate(peerId: string, candidate: RTCIceCandidateInit) {
  const pc = peers.get(peerId);
  if (!pc?.remoteDescription) {
    const queue = pendingCandidates.get(peerId) ?? [];
    queue.push(candidate);
    pendingCandidates.set(peerId, queue);
    return;
  }
  try {
    await pc.addIceCandidate(candidate);
  } catch (e) {
    if (!ignoreOffer.get(peerId)) console.error("ICE candidate 추가 실패", e);
  }
}

function broadcastMediaState() {
  if (!currentChannelId || !myUserId) return;
  const { micMuted, cameraOn, screenSharing } = useVoiceStore.getState();
  sendVoiceSignal({
    type: "media-state",
    channelId: currentChannelId,
    userId: myUserId,
    nickname: myNickname,
    audioMuted: micMuted,
    videoEnabled: cameraOn,
    screenSharing,
  });
}

function handleSignal(msg: VoiceSignal) {
  switch (msg.type) {
    case "user-joined": {
      if (msg.userId === myUserId) return;
      useVoiceStore.getState().upsertParticipant(msg.userId);
      getOrCreatePeer(msg.userId);
      broadcastMediaState();
      return;
    }
    case "user-left": {
      closePeer(msg.userId);
      useVoiceStore.getState().removeParticipant(msg.userId);
      return;
    }
    case "offer":
      if (msg.targetUserId === myUserId) void handleOffer(msg.userId, msg.offer);
      return;
    case "answer":
      if (msg.targetUserId === myUserId) void handleAnswer(msg.userId, msg.answer);
      return;
    case "ice-candidate":
      if (msg.targetUserId === myUserId) void handleIceCandidate(msg.userId, msg.candidate);
      return;
    case "media-state":
      useVoiceStore.getState().setParticipantMediaState(msg.userId, {
        nickname: msg.nickname,
        audioMuted: msg.audioMuted,
        videoEnabled: msg.videoEnabled,
        screenSharing: msg.screenSharing,
      });
      return;
  }
}

export async function joinVoiceChannel(params: {
  serverId: string;
  channelId: string;
  channelName?: string;
  userId: string;
  nickname: string;
  accessToken: string;
}): Promise<void> {
  const { status, channelId: activeChannelId } = useVoiceStore.getState();

  if (status !== "idle" && activeChannelId === params.channelId) return; // already in this channel
  if (status !== "idle") leaveVoiceChannel();

  useVoiceStore.getState().setStatus("connecting");
  myUserId = params.userId;
  myNickname = params.nickname;
  currentChannelId = params.channelId;

  try {
    localAudioTrack = await acquireMicTrack();
    micGateOpen = true;
    applyMicTrackEnabled();
    stopLocalSpeakingDetector = attachLocalMicControl(new MediaStream([localAudioTrack]));

    await connectVoiceSocket(params.accessToken);
    unsubscribeSignal = onVoiceSignal(handleSignal);

    sendVoiceSignal({ type: "join", channelId: params.channelId, userId: params.userId });

    useVoiceStore.getState().setChannel({
      serverId: params.serverId,
      channelId: params.channelId,
      channelName: params.channelName,
    });
    useVoiceStore.getState().setStatus("connected");
  } catch (e) {
    console.error("음성 채널 입장 실패", e);
    leaveVoiceChannel();
    throw e;
  }
}

export function leaveVoiceChannel(): void {
  if (currentChannelId && myUserId) {
    sendVoiceSignal({ type: "leave", channelId: currentChannelId, userId: myUserId });
  }

  peers.forEach((_pc, peerId) => closePeer(peerId));
  peers.clear();

  stopLocalSpeakingDetector?.();
  stopLocalSpeakingDetector = null;

  localAudioTrack?.stop();
  localAudioTrack = null;
  teardownMicPipeline();
  localVideoTrack?.stop();
  localVideoTrack = null;
  videoSenders.clear();

  audioEls.forEach((el) => {
    el.srcObject = null;
    el.remove();
  });
  audioEls.clear();

  unsubscribeSignal?.();
  unsubscribeSignal = null;
  disconnectVoiceSocket();

  myUserId = null;
  myNickname = "";
  currentChannelId = null;
  micMutedBeforeDeafen = false;
  micGateOpen = true;

  useVoiceStore.getState().reset();
}

export function setMicMuted(muted: boolean): void {
  useVoiceStore.getState().setLocalMic(muted);
  applyMicTrackEnabled();
  broadcastMediaState();
}

export function setDeafened(deafened: boolean): void {
  audioEls.forEach((el) => {
    el.muted = deafened;
  });

  if (deafened) {
    micMutedBeforeDeafen = useVoiceStore.getState().micMuted;
    setMicMuted(true);
  } else {
    setMicMuted(micMutedBeforeDeafen);
  }

  useVoiceStore.getState().setLocalDeafen(deafened);
}

async function replaceOrAddVideoTrack(track: MediaStreamTrack) {
  if (peers.size === 0) return;
  for (const [peerId, pc] of peers) {
    const sender = videoSenders.get(peerId);
    if (sender) {
      await sender.replaceTrack(track);
    } else {
      videoSenders.set(peerId, pc.addTrack(track));
    }
  }
}

function removeVideoTrackFromPeers() {
  peers.forEach((pc, peerId) => {
    const sender = videoSenders.get(peerId);
    if (sender) {
      pc.removeTrack(sender);
      videoSenders.delete(peerId);
    }
  });
}

function stopLocalVideo() {
  localVideoTrack?.stop();
  localVideoTrack = null;
  removeVideoTrackFromPeers();
  useVoiceStore.getState().setLocalStream(null);
}

export async function setCameraEnabled(enabled: boolean): Promise<void> {
  if (!enabled) {
    stopLocalVideo();
    useVoiceStore.getState().setLocalCamera(false);
    broadcastMediaState();
    return;
  }

  if (useVoiceStore.getState().screenSharing) await setScreenShareEnabled(false);

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  const track = stream.getVideoTracks()[0];
  localVideoTrack = track;
  await replaceOrAddVideoTrack(track);

  useVoiceStore.getState().setLocalStream(stream);
  useVoiceStore.getState().setLocalCamera(true);
  broadcastMediaState();
}

export async function setScreenShareEnabled(enabled: boolean): Promise<void> {
  if (!enabled) {
    stopLocalVideo();
    useVoiceStore.getState().setLocalScreenShare(false);
    broadcastMediaState();
    return;
  }

  if (useVoiceStore.getState().cameraOn) await setCameraEnabled(false);

  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  const track = stream.getVideoTracks()[0];
  localVideoTrack = track;
  await replaceOrAddVideoTrack(track);

  track.onended = () => {
    void setScreenShareEnabled(false);
  };

  useVoiceStore.getState().setLocalStream(stream);
  useVoiceStore.getState().setLocalScreenShare(true);
  broadcastMediaState();
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (currentChannelId) leaveVoiceChannel();
  });
}