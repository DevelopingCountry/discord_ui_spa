# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

Discord 클론의 **프론트엔드 전용** 저장소입니다. 원래 Next.js 15(App Router)로 작성되었던 `discord_ui`를 커밋 `b493342`("next에서 순수 react로 전환")에서 **Vite + React Router 기반 순수 SPA**로 새로 포팅한 저장소입니다.
백엔드는 별도 저장소(`discord_server`)이며 기본적으로 `http://localhost:8080`에서 동작한다고 가정합니다 (Spring Boot, STOMP `/ws-chat`, REST API 등을 제공).

주요 기능: 카카오 OAuth 로그인(+ 개발용 로그인), 서버/채널/DM 기반 텍스트 채팅(STOMP over SockJS), 친구 시스템, 알림함.
**음성 채널(WebRTC)은 아직 포팅되지 않았습니다** — `components/voice/*`는 전부 TODO 플레이스홀더이며, 이 도메인은 별도로 작업 중입니다(손대지 마세요).

## 명령어

```bash
npm run dev       # vite (포트 3000 고정, vite.config.ts)
npm run build      # tsc -b && vite build
npm run lint        # oxlint
npm run preview  # vite preview
```

- **테스트 프레임워크 없음.** `package.json`에 test 스크립트 자체가 없습니다.
- Lint는 ESLint가 아니라 **oxlint**입니다 (`.oxlintrc.json`, 규칙: `react/rules-of-hooks`, `react/only-export-components`). type-aware 규칙은 비활성 상태.
- Prettier/Husky/lint-staged 설정 없음 (구 `discord_ui`에는 있었지만 이 저장소에는 포팅되지 않음).

## 기술 스택

- Vite 8 + React 19 + TypeScript(strict) — `@vitejs/plugin-react` (Babel 기반, SWC 아님)
- 라우팅: `react-router-dom` 7 (`BrowserRouter`, `App.tsx`의 `<Routes>`)
- Tailwind CSS 3 + shadcn/ui 스타일 컴포넌트 (`components/ui/*`, Radix UI 프리미티브 기반)
- 상태관리: TanStack Query 5(실질적 서버 상태 캐시) + Zustand 5(소수의 전역 UI 상태) + React Context(인증/화면 스코프)
- 실시간 통신: `@stomp/stompjs` + `sockjs-client` (채팅). 음성 시그널링은 아직 없음.
- HTTP: 기본은 `fetch`(TanStack Query 훅들), 일부 컴포넌트는 `axios` 직접 사용 (메시지 CRUD, DM/채널 REST 등 — 혼용되어 있음, 통일 리팩터링 대상)
- Path alias: `@/*` → `src/*` (`vite.config.ts`의 `resolve.alias`, `tsconfig.app.json`)
- `vite.config.ts`에서 `global: "globalThis"`를 `define`으로 주입 — `sockjs-client`가 Node의 `global`을 참조하는데 Vite는 webpack과 달리 이를 폴리필하지 않기 때문. 이 설정을 지우면 SockJS 연결이 즉시 깨집니다.

## 라우팅 구조 (`App.tsx`, react-router-dom)

`main.tsx` — 최상위 wrapping 순서: `BrowserRouter` → `AuthProvider` → `AuthGuard` → `ReactQueryProvider` → `App`.
(Next.js 시절과 순서가 다릅니다: 서버 컴포넌트가 없으므로 전부 클라이언트 트리 안에 있고, `AuthGuard`가 라우트보다 항상 먼저 평가됩니다.)

```
/                                  공개 랜딩 페이지 (Home.tsx)
/login                             공개, 카카오 로그인 + (dev 전용) 테스트 계정 로그인 버튼
/auth/kakao                        공개, 카카오 OAuth 콜백 처리 (KakaoCallback.tsx)
ChannelsLayout (레이아웃, path 없음) — NotificationSubscribe + NotificationInbox + ServerSidebar 렌더
  ChannelsMeLayout (레이아웃)      — DM/친구 사이드바, MainScreenProvider
    /channels/me                  ChannelsMeHome (친구 목록/추가)
    /channels/me/:dmId            DmChatPage
  /channels/:serverId             ChannelsServerLayout — 채널 사이드바, ChannelSubscriber(STOMP)
    (index)                       ChannelsServerHome
    :channelId                    ChannelPage (텍스트 채널 채팅 / VOICE 타입이면 VoiceChannelPage 플레이스홀더)
```

Next.js 때 `app/channels/layout.tsx` 등 서버 레이아웃이 하던 "로그인 여부 확인 후 리다이렉트"는 이제 전부 클라이언트의 `AuthGuard` 하나로 통합되었습니다 (아래 참고).

## 인증 흐름과 주의할 점

1. `pages/Login.tsx` → 카카오 OAuth URL로 리다이렉트. `KAKAO_CLIENT_ID`와 `redirect_uri`(`http://localhost:3000/auth/kakao`)가 **하드코딩**되어 있고 `lib/config.ts`의 `API_URL`을 쓰지 않습니다.
   - 개발 모드(`import.meta.env.DEV`)에서는 `DEV_TEST_USERS` 3명을 `${API_URL}/auth/dev-login`으로 바로 로그인시키는 버튼도 렌더됩니다. 백엔드 `DevAuthController`는 `@Profile("!prod")`라 prod에서는 등록되지 않으니, 이 버튼이 보이는데 로그인이 실패한다면 백엔드가 prod 프로필로 떠 있는지 먼저 의심하세요.
2. `pages/KakaoCallback.tsx`가 `?code=`를 받아 `http://localhost:8080/auth/login/kakao`를 호출합니다. **이 URL도 `API_URL`을 쓰지 않고 하드코딩**되어 있습니다 (Next.js 시절과 동일한 이슈가 그대로 이전됨) — 배포 환경 변경 시 여기를 놓치기 쉽습니다.
3. 로그인 성공 시 토큰을 **두 곳에 저장**합니다: `localStorage`(`AuthContext`가 실제로 읽는 곳)와 `document.cookie`(`accessToken=...`). 이 SPA에는 서버 컴포넌트가 없어 쿠키를 읽는 코드가 어디에도 없습니다 — **쿠키 저장은 Next.js 포팅 잔재로, 사실상 죽은 코드**입니다. 지워도 안전한지 확인 후 정리 대상.
4. `AuthContext.logout()`은 `localStorage`만 지우고 소켓을 끊은 뒤 `/login`으로 이동합니다. 쿠키는 애초에 안 쓰이므로 지울 필요도 없습니다(위 3번 참고).
5. 인증 가드는 **`components/auth/AuthGuard.tsx` 한 곳**뿐입니다 (Next.js 시절엔 클라이언트+서버 레이아웃 4곳이 개별적으로 체크했음). `localStorage` 로드를 기다리기 위해 50ms 지연 후 `publicPaths`(`/`, `/auth/kakao`, `/login`)에 없으면 `/login`으로 리다이렉트합니다.

## 상태관리: TanStack Query / Zustand / Context 역할 분담

Next.js 버전과 가장 크게 달라진 지점입니다. 예전에는 Zustand가 "실질적 클라이언트 DB"였지만, 이 SPA에서는 **TanStack Query가 그 역할을 가져갔습니다**.

- **TanStack Query** — 서버/채널/DM/친구/프로필 **목록** 데이터의 실제 캐시입니다. `useQuery`가 정상적으로 캐싱하고, mutation은 `onSuccess`에서 `invalidateQueries`를 호출하거나(대부분), 실시간 이벤트 수신 시 `setQueryData`로 캐시를 직접 갱신합니다(`ChannelSubscriber.tsx`가 대표 예시). 쿼리 키 정의는 각 `use-*-query.ts` 파일 상단에 `xxxQueryKey` 상수/함수로 export되어 있으니, 새 mutation을 추가할 때는 반드시 이 키를 import해서 invalidate하세요.
  - `serversQueryKey`, `channelsQueryKey(serverId)`, `dmsQueryKey`, `friendsQueryKey`, `profileQueryKey`
  - `ReactQueryProvider`(`components/provider/react-query-provider.tsx`)가 `QueryClient`를 한 번만 생성해 공급. 커스텀 `defaultOptions` 없음(전부 TanStack Query 기본값).
- **Zustand** — 이제 딱 3개 스토어만 존재하고, 전부 실시간 알림/검색 관련 **UI 상태**입니다(목록 데이터 캐시 용도 아님):
  - `components/friend/use-online-friends-store.ts` — 현재 온라인인 친구 목록
  - `components/notification/use-notification-inbox-store.ts` — 알림함 아이템 + 안읽음 카운트
  - `components/friend/useSearchStore.ts` — 친구 검색어(`useSearchStore`) + 친구 탭 활성 상태(`useActiveStore`), 파일명과 달리 스토어 2개가 들어있음
- **React Context** — 세 가지:
  1. `components/auth/AuthContext.tsx` — 앱 전역 싱글턴 (토큰/유저ID, localStorage 동기화)
  2. `components/friend/main-screen-context.tsx` — `/channels/me` 하위 화면 전환용 (`"getFriends"` / `"addFriends"`)
  3. `components/channel/channel-context.tsx` — **데드 코드**. `ChannelProvider`/`useChannelContext`를 export하지만 앱 어디에서도 import되지 않습니다. `ChannelPage.tsx`는 대신 `useParams()`로 `channelId`를 직접 읽습니다.
- **메시지 자체(채널/DM 채팅 메시지)는 TanStack Query 캐시에 없습니다.** `ChannelPage.tsx`와 `dm-chat2.tsx` 둘 다 `useState`로 로컬 배열을 들고, 최초 진입 시 `axios.get`으로 REST 호출 후 STOMP 구독으로 append/update/delete하는 방식입니다. 새로고침하면 다시 REST부터 로드합니다.

## 실시간 통신 아키텍처 (STOMP over SockJS)

- `lib/socket.ts` — 앱 전역 공유 **싱글턴** STOMP 클라이언트(`connectSocket`/`disconnectSocket`/`subscribe`/`publish`). 목적지(destination)별로 콜백을 `Set`으로 모아 실제 STOMP subscription은 목적지당 1개만 유지합니다. 구독자가 모두 사라지면 자동 unsubscribe.
  - `components/notification/NotificationSubscribe.tsx`가 `accessToken`이 생기는 즉시 `connectSocket`으로 전역 연결을 수립하고 `/user/queue/notifications`를 구독합니다. `ChannelsLayout`에 마운트되어 있어 로그인 후 보호된 라우트에 들어가면 항상 켜져 있습니다.
  - `AuthContext.logout()`이 `disconnectSocket()`으로 연결을 종료합니다.
  - `components/hooks/useSocketSubscribe.ts` — `subscribe`를 감싼 훅. destination이 `null`/`undefined`면 구독하지 않음(조건부 구독에 사용, 예: `dmId`가 아직 없을 때).
- 구독 목적지:
  - `/topic/server/{serverId}/channels` — `ChannelSubscriber.tsx`, 채널 생성/수정 이벤트를 받아 `channelsQueryKey`의 TanStack Query 캐시를 `setQueryData`로 직접 갱신
  - `/topic/dm/{dmId}` — `dm-chat2.tsx`, SEND/UPDATE/DELETE
  - `/topic/channel/{channelId}` — `ChannelPage.tsx`, SEND/UPDATE/DELETE
  - `/user/queue/notifications` — `NotificationSubscribe.tsx`, `action` 필드로 `INVITE`/`DM`/`FRIEND_REQUEST`/`FRIEND_ONLINE`/`FRIEND_OFFLINE`/`FRIEND_ACCEPTED`/`FRIEND_REJECTED`/`FRIEND_DELETED` 분기 처리
- 발행(publish): `/app/dm/{dmId}`, `/app/dm/{dmId}/enter`\/`leave`(presence), `/app/channel/{channelId}`
- 메시지 수정/삭제는 STOMP가 아니라 REST(`axios.patch`/`delete`)로 처리됩니다 (Next.js 버전과 동일한 패턴).

## 음성(WebRTC) — 아직 미포팅

`components/voice/voice-panel.tsx`, `components/voice/voice-channel-page.tsx` 둘 다 파일 최상단에 `// TODO: voice 도메인은 아직 포팅 전` 주석과 함께 항상 `null`/플레이스홀더 UI만 반환합니다. 구 `discord_ui`에 있던 `useWebRTC.ts`, `voiceStore.ts` 같은 실제 시그널링 로직은 이 저장소로 옮겨지지 않았습니다.
**음성 도메인은 이 대화의 범위 밖입니다 — voice 관련 파일은 별도로 작업 중이니 수정하지 마세요.**

## 알려진 중복/하드코딩/데드 코드 (수정 전 반드시 확인)

| 파일 | 상태 |
|---|---|
| `components/channel/channel-context.tsx` | **데드 코드**. `ChannelProvider`/`useChannelContext` 어디서도 import 안 됨 |
| `components/messeage-input.tsx` | 파일명 오타(message → messeage)지만 **실사용 중**인 메시지 입력 컴포넌트 (DM/채널 공용) |
| `components/friend/TebBarComp.tsx` | 파일명 오타(Tab → Teb)지만 **실사용 중**, export명은 `TabBarComp` |
| `components/dm/search-message.tsx` | UI만 있고 검색 로직 미구현 (`onSearch` 호출부가 주석 처리됨) |
| `components/dm/direct-message.tsx` | DM 숨기기(`useHideDm`) 버튼 UI가 통째로 주석 처리되어 있어 `handleDelete`가 미사용 상태 |
| `pages/Login.tsx`, `pages/KakaoCallback.tsx` | 카카오 관련 URL이 `lib/config.ts`의 `API_URL`을 쓰지 않고 `localhost:3000`/`localhost:8080`을 하드코딩. API 엔드포인트 변경 시 여기 놓치기 쉬움 |
| `document.cookie`에 `accessToken` 저장 (Login.tsx, KakaoCallback.tsx) | 이 SPA엔 쿠키를 읽는 코드가 없음 — Next.js 포팅 잔재로 추정되는 죽은 코드 |
| `pages/ChannelPage.tsx`의 `/server/{serverId}/members` 호출 | **백엔드에 이 엔드포인트가 없습니다** (`discord_server`의 `ServerController`/`ChannelController` 어디에도 `/members` 라우트 없음). 채널 우측 멤버 패널은 항상 빈 목록으로 렌더됩니다 — 백엔드 작업 없이는 못 고치는 알려진 갭 |
| `components/channel/use-update-channel.ts`, `use-delete-channel.ts` | `console.log` 디버그 로그가 남아있음(기능엔 문제 없음) |
| `components/channel/channel-sidebar.tsx` | 렌더마다 `console.log("channel-sidebar")` 출력 — 정리 대상 |

## 설정

- API 기본 URL: `lib/config.ts`의 `API_URL`(env `VITE_API_URL`, 기본값 `http://localhost:8080`). `WS_URL`은 `API_URL`의 `http`를 `ws`로 치환해 파생되지만 **`lib/socket.ts`는 `WS_URL`을 쓰지 않고 `API_URL` + SockJS를 그대로 사용**합니다(SockJS가 내부적으로 http(s) 엔드포인트에 폴링/웹소켓 업그레이드를 처리하기 때문).
- 단, 위 "인증 흐름"/"데드 코드" 섹션에서 언급했듯 카카오 콜백 등 일부 파일은 이 상수를 쓰지 않고 URL을 하드코딩하고 있으니, API 엔드포인트를 바꿀 때는 `lib/config.ts` 외에 하드코딩된 곳도 함께 검색하세요.
- dev 서버 포트는 `vite.config.ts`에서 `3000`으로 고정(백엔드 CORS 허용 origin과 카카오 redirect_uri가 이 포트를 전제로 하드코딩되어 있으므로 임의로 바꾸지 마세요).
