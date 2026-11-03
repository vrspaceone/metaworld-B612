# 메타월드 (Meta World) - 웹 기반 3D 멀티플레이 프로토타입

웹 브라우저에서 별도 설치 없이 실행되는 Low Poly 3D 자연(Nature) 월드 메타버스 프로토타입입니다. 다수의 사용자가 동시에 접속하여 커스텀 컬러 인간형 3D 아바타를 WASD/마우스로 조작하고, 중앙 모닥불 광장과 호수를 탐험하며 실시간 이동 동기화 및 텍스트 채팅을 나눌 수 있습니다.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> 사전 질의응답을 통해 확정된 핵심 기획 사양을 반영하여 구축을 진행합니다.

- **확정된 캐릭터 스타일**: 스타일리시한 로우폴리 인간형 아바타 (플레이어 닉네임 입력 시 의상/피부/악센트 컬러 선택 가능, 걷기/점프/대기 절차적 애니메이션 탑재)
- **확정된 월드 테마**: 중앙 모닥불 광장과 호수, 잔디 언덕과 소나무/활엽수 숲, 로우폴리 바위가 어우러진 평화로운 자연(Nature) 랜드마크
- **확정된 멀티플레이 방식**: Express + Socket.IO 기반의 실제 브라우저 다중 동기화 (두 개 이상의 브라우저 탭이나 창에서 접속 시 실시간 이동 및 채팅 완벽 동기화)

---

## 1. Overview & Core Concept

- **What It Does**: 사용자가 웹 브라우저에서 닉네임과 캐릭터 컬러를 정하고 입장하면, 3인칭 카메라 시점으로 3D 자연 월드를 누비며 다른 접속자의 아바타와 실시간으로 마주치고 대화할 수 있는 소셜 메타버스 프로토타입입니다.
- **Target Audience**: 웹 기반 3D 가상 공간 및 소셜 멀티플레이 메타버스를 빠르고 가볍게 체험하고자 하는 사용자 및 개발자.
- **Key Value**: 설치 없는 즉시 실행, Socket.IO 기반 초저지연(Low-latency) 좌표 및 채팅 동기화, 부드러운 Three.js PBR 렌더링 및 로우폴리 감성의 아름다운 공간 경험.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **입장 화면 (Welcome & Avatar Setup)**:
   - 메인 타이틀과 함께 닉네임 입력 필드 및 아바타 의상 컬러(블루, 에메랄드, 앰버, 퍼플, 로즈, 다크슬레이트) 선택 제공.
   - 3D 실시간 아바타 미리보기 및 조작 키 안내 (WASD: 이동, Space: 점프, Mouse: 시점 회전, Enter: 채팅).
   - "월드 입장 (Enter Nature World)" 클릭 시 월드로 즉시 진입.
2. **3D 월드 탐험 (Exploration & Navigation)**:
   - 3인칭 추적 카메라로 플레이어 캐릭터를 조작 (부드러운 카메라 보간 및 장애물 감지).
   - 발걸음에 맞춘 팔/다리 보행 애니메이션과 점프 모션, 착지 피드백.
   - 중앙 모닥불(파티클 불꽃 효과 및 모닥불 소리 합성), 호수(부드러운 물 표면 쉐이딩), 잔디 언덕 및 나무 숲 탐험.
3. **실시간 멀티플레이 인터랙션 (Multiplayer & Chat)**:
   - 다른 사용자가 접속하면 월드에 즉시 해당 캐릭터가 생성되고 닉네임이 머리 위에 표시됨.
   - 상대방 이동 시 위치 및 회전이 끊김 없이 부드럽게 보간(Lerp/Damping)되어 렌더링.
   - `Enter` 키로 좌측 하단 채팅창 활성화, 메시지 입력 후 전송 시 전체 채팅 로그 및 캐릭터 머리 위 말풍선(Speech Bubble) 실시간 팝업.
4. **인체공학적 하단 독 (Bottom Control Dock)**:
   - Three.js 가이드라인에 따른 중앙 뷰포트 무간섭 하단 제어 바: 카메라 시점 모드(근접/원거리/탑다운), 사운드 토글(발걸음 및 모닥불 Web Audio 효과음), 조작법 안내 토글, 현재 동시 접속자 수 표시.

### Visual Identity & Theme
- **Aesthetic Direction**: 자연의 싱그러움과 감성을 담은 Low Poly PBR 아트 스타일. 깔끔한 각진 폴리곤 지형과 부드러운 일출/주간 자연광.
- **Color Palette**:
  - Sky/Fog: 부드러운 스카이 블루 및 연한 지평선 포그 (`#C8E6F5`)
  - Terrain & Foliage: 생동감 있는 올리브/그린 잔디 (`#4E8752`), 딥 포레스트 그린 침엽수 (`#2D5A3A`), 웜 베이지 흙길 (`#C2A679`)
  - Campfire & Lake: 따뜻한 모닥불 앰버 오렌지 (`#F59E0B`), 청량한 호수 터콰이즈 (`#38BDF8`)
  - UI Canvas: 딥 슬레이트와 반투명 다크 글래스 (`rgba(15, 23, 42, 0.75)`), 고대비 화이트 타이포그래피
- **Typography**: 헤드라인에 현대적인 기하학적 산세리프 `Plus Jakarta Sans`, 본문 및 채팅에 가독성 높은 인터페이스 폰트 사용.
- **Zero-Pill Discipline & Anti-Slop**: 인위적인 네온 불빛이나 번쩍이는 불필요한 장식 제거. 정갈한 텍스트 메타데이터와 직관적인 게임 HUD.

---

## 3. Key Product Decisions & Trade-Offs

- **전송 데이터 최소화 및 클라이언트 외삽 (Client-Side Interpolation)**:
  - *접근법*: 3D 에셋이나 물리 연산 전체를 네트워크로 전송하지 않고, `{ playerId, nickname, color, position: {x,y,z}, rotation, isMoving, isJumping }` 페이로드만 초당 20~30회 압축 전송. 수신측 브라우저는 `THREE.MathUtils.damp`를 통해 프레임 단위로 부드럽게 렌더링.
  - *이유*: 네트워크 대역폭을 최소화하고 지연(Lag)이 있어도 캐릭터가 뚝뚝 끊기지 않고 자연스럽게 활보하도록 보장.
- **단일 풀스택 서버 아키텍처 (Express + Socket.IO + Vite)**:
  - *접근법*: AI Studio의 포트 3000 단일 포트 제약에 맞춰, `server.ts`에서 Express와 Node.js `http` 서버를 결합하고 동일 포트에서 Socket.IO 웹소켓 업그레이드를 처리하며 Vite 미들웨어를 서비스.
  - *이유*: 별도의 외부 웹소켓 서버 배포 없이도 현재 개발/미리보기 환경에서 여러 브라우저 탭을 열어 즉시 완벽한 100% 리얼 멀티플레이를 테스트할 수 있음.
- **100% 무결점 절차적 3D 지형 및 모델링 (Zero 404 Assets)**:
  - *접근법*: 외부 미호스팅 `.glb`/`.gltf` 의존성 없이 Three.js의 `BufferGeometry`, `Group`, `CylinderGeometry`, `DodecahedronGeometry` 등으로 3~12개 부품이 유기적으로 결합된 로우폴리 캐릭터, 모닥불, 텐트, 나무, 바위, 지형을 코드로 직접 생성.
  - *이유*: 네트워크 에셋 로딩 실패나 CORS, 404 오류 없이 언제 어디서나 1초 이내에 즉시 렌더링됨.

---

## 4. Technical Architecture & Data Strategy

### System Layout & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Meta World Application                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌────────────────────────┐           ┌─────────────────────────────┐  │
│  │   Node/Express Server  │  Socket   │      Client (React 19)      │  │
│  │      (server.ts)       │◄─════════►│                             │  │
│  │  - Socket.IO Server    │  Events   │  - Socket.IO Client Hook    │  │
│  │  - Player State Store  │           │  - Local Player Controller  │  │
│  │  - Broadcast Engine    │           │  - Remote Players Manager   │  │
│  │  - Chat Message Broker │           │  - Procedural Audio Engine  │  │
│  └────────────────────────┘           └──────────────┬──────────────┘  │
│                                                      │                 │
│                                                      ▼                 │
│                                       ┌─────────────────────────────┐  │
│                                       │   Three.js 3D Viewport      │  │
│                                       │  - Nature World Terrain     │  │
│                                       │  - Central Campfire & Lake  │  │
│                                       │  - 3rd-Person Follow Cam    │  │
│                                       │  - Procedural Humanoid Mesh │  │
│                                       └──────────────┬──────────────┘  │
│                                                      │                 │
│                                                      ▼                 │
│                                       ┌─────────────────────────────┐  │
│                                       │   Clean 2D Overlay HUD      │  │
│                                       │  - Player Nickname/Bubbles  │  │
│                                       │  - Realtime Chat Window     │  │
│                                       │  - Online Player List       │  │
│                                       │  - Bottom Control Dock      │  │
│                                       └─────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & WebSocket Events

```typescript
// 플레이어 상태 모델
interface PlayerState {
  id: string;
  nickname: string;
  color: string;
  position: { x: number; y: number; z: number };
  rotationY: number;
  isMoving: boolean;
  isJumping: boolean;
}

// 실시간 채팅 메시지
interface ChatMessage {
  id: string;
  playerId: string;
  nickname: string;
  color: string;
  text: string;
  timestamp: number;
}

// Socket.IO 이벤트 계약
// [Client -> Server]
// - "player:join": { nickname, color }
// - "player:move": { position, rotationY, isMoving, isJumping }
// - "chat:send": { text }

// [Server -> Client]
// - "init:world": { selfId, players: PlayerState[], chatHistory: ChatMessage[] }
// - "player:joined": PlayerState
// - "player:moved": { id, position, rotationY, isMoving, isJumping }
// - "player:left": { id }
// - "chat:message": ChatMessage
```

### 구현 단계 계획 (Execution Phases)
1. **의존성 설치 및 백엔드 서버 구성**:
   - `three`, `@types/three`, `socket.io`, `socket.io-client` 패키지 설치.
   - `server.ts` 풀스택 진입점 작성 (Express + HTTP + Socket.IO + Vite 미들웨어).
   - `package.json`의 `"dev"` 및 `"start"` 스크립트 연결.
2. **Three.js 로우폴리 3D 자연 월드 구축**:
   - 지형 굴곡(Heightmap/Vertex Noise), 중앙 모닥불 랜드마크, 절차적 소나무/단풍나무 및 바위 군락, 잔잔한 수면의 호수.
   - 부드러운 태양광 섀도우 맵, RoomEnvironment 환경광, 대기 포그(Atmospheric Fog).
3. **플레이어 시스템 및 3인칭 카메라 조작**:
   - 로우폴리 인간형 아바타(머리, 몸통, 팔, 다리) 계층 구조 및 걷기/점프 애니메이션.
   - WASD 이동, 마우스 드래그 또는 포인터 락 기반의 3인칭 추적 카메라 및 시점 댐핑.
4. **실시간 멀티플레이 및 채팅 연동**:
   - Socket.IO 클라이언트 훅을 통한 위치/회전 틱 브로드캐스트.
   - 타 플레이어 렌더링 및 머리 위 3D 닉네임 라벨/말풍선.
   - 좌측 하단 대화창 및 Enter 키 포커스 채팅 입력창.
5. **사운드 및 UI 다듬기**:
   - Web Audio 기반의 발걸음 소리 및 모닥불 백그라운드 앰비언스.
   - 하단 컨트롤 도크 (시점 전환, 볼륨, 접속자 명단) 배치 및 빌드 검증 (`compile_applet`).
