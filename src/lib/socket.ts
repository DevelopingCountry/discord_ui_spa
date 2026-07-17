import SockJS from "sockjs-client";
import { Client, type StompSubscription } from "@stomp/stompjs";
import { API_URL } from "@/lib/config";

type SubscriptionEntry = {
  sub: StompSubscription | null;
  callbacks: Set<(body: unknown) => void>;
};

let client: Client | null = null;
let currentToken: string | null = null;
const subscriptions = new Map<string, SubscriptionEntry>();

function subscribeAll() {
  if (!client?.connected) return;
  subscriptions.forEach((entry, destination) => {
    entry.sub = client!.subscribe(destination, (msg) => {
      const body = JSON.parse(msg.body);
      entry.callbacks.forEach((cb) => cb(body));
    });
  });
}

export function connectSocket(token: string) {
  if (client && currentToken === token) return;
  if (client) {
    client.deactivate();
  }
  currentToken = token;
  client = new Client({
    webSocketFactory: () => new SockJS(`${API_URL}/ws-chat?token=${token}`),
    reconnectDelay: 5000,
    onConnect: subscribeAll,
  });
  client.activate();
}

export function disconnectSocket() {
  client?.deactivate();
  client = null;
  currentToken = null;
  subscriptions.clear();
}

export function subscribe(destination: string, callback: (body: unknown) => void): () => void {
  let entry = subscriptions.get(destination);
  if (!entry) {
    entry = { sub: null, callbacks: new Set() };
    subscriptions.set(destination, entry);
    if (client?.connected) {
      entry.sub = client.subscribe(destination, (msg) => {
        entry!.callbacks.forEach((cb) => cb(JSON.parse(msg.body)));
      });
    }
  }
  entry.callbacks.add(callback);

  return () => {
    entry!.callbacks.delete(callback);
    if (entry!.callbacks.size === 0) {
      entry!.sub?.unsubscribe();
      subscriptions.delete(destination);
    }
  };
}

export function publish(destination: string, body: unknown) {
  if (!client?.connected) return;
  client.publish({ destination, body: JSON.stringify(body) });
}
