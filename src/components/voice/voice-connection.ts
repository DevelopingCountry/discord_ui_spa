import { connectVoiceSocket, disconnectVoiceSocket, onVoiceSignal, sendVoiceSignal } from "@/components/voice/voice-signaling";
import { useVoiceStore } from "@/components/voice/use-voice-store";
import type { VoiceSignal } from "@/components/voice/voice-types";

const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

const peers = new Map<string, RTCPeerConnection>();
const makingOffer = new Map<string, boolean>();
const ignoreOffer = new Map<string, boolean>();
const pendingCandidates = new Map<string, RTCIceCandidateInit[]>();
const audioEls = new Map<string, HTMLAudioElement>();
const videoSenders = new Map<string, RTCRtpSender>();
const remoteStreams = new Map<string, MediaStream>();

let unsubscribeSignal: (() => void) | null = null;
let myUserId: string | null = null;
let myNickname = "";
let currentChannelId: string | null = null;

let localAudioTrack: MediaStreamTrack | null = null;
let localVideoTrack: MediaStreamTrack | null = null;
let micMutedBeforeDeafen = false;

function isPolite(peerId: string): boolean {
  return myUserId! < peerId;
}

function attachRemoteAudio(peerId: string, stream: MediaStream) {
  let el = audioEls.get(peerId);
  if (!el) {
    el = document.createElement("audio");
    el.autoplay = true;
    el.muted = useVoiceStore.getState().deafened;
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
    if (event.track.kind === "audio") attachRemoteAudio(peerId, remoteStream);
    useVoiceStore.getState().setParticipantStream(peerId, remoteStream);

    event.track.onended = () => {
      remoteStream.removeTrack(event.track);
      useVoiceStore.getState().setParticipantStream(peerId, remoteStream);
    };
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "failed" || pc.connectionState === "closed") {
      // leave cleanup to explicit user-left/leave handling; nothing to do here beyond logging
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
    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localAudioTrack = micStream.getAudioTracks()[0] ?? null;

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

  localAudioTrack?.stop();
  localAudioTrack = null;
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

  useVoiceStore.getState().reset();
}

export function setMicMuted(muted: boolean): void {
  if (localAudioTrack) localAudioTrack.enabled = !muted;
  useVoiceStore.getState().setLocalMic(muted);
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