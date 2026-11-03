# Meta World (메타월드) - 웹 기반 3D 멀티플레이 프로토타입

웹 브라우저에서 실행 가능한 Low Poly 3D 자연(Nature) 월드 메타버스 프로토타입입니다.  
**Vercel(프론트엔드)**과 **Render(실시간 소켓 서버)** 분리 배포(방법 1)를 완벽하게 지원하도록 구성되어 있습니다.

---

## 🏛️ 시스템 아키텍처

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│     Vercel (웹 클라이언트)       │  WebSocket│     Render (실시간 게임 서버)     │
│   https://meta-world.vercel.app │◄─────────►│ https://meta-server.onrender.com│
│                                 │           │                                 │
│  - React 19 + Three.js PBR      │  (이동/   │  - Node.js + Express            │
│  - 3인칭 카메라 & 애니메이션     │   채팅    │  - Socket.IO Server             │
│  - 2D HUD & 말풍선 시스템       │   동기화) │  - 플레이어 상태 인메모리 관리  │
└─────────────────────────────────┘           └─────────────────────────────────┘
```

---

## 🚀 1. 로컬 환경에서 실행하기

```bash
# 1. 의존성 설치
npm install

# 2. 로컬 통합 서버 실행 (포트 3000)
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 시 즉시 로컬에서 동작하며, 새 탭을 열어 2명 이상의 접속을 바로 테스트할 수 있습니다.

---

## 📦 2. GitHub에 코드 올리기

1. [GitHub](https://github.com)에서 새로운 레포지토리(예: `meta-world`)를 생성합니다.
2. 터미널에서 다음 명령어를 실행하여 소스코드를 푸시합니다:

```bash
git init
git add .
git commit -m "feat: Meta World 3D multiplayer prototype"
git branch -M main
git remote add origin https://github.com/<당신의-깃허브-아이디>/<레포지토리명>.git
git push -u origin main
```

---

## 🖥️ 3. 백엔드 배포: Render (실시간 게임 서버)

> 💡 **Render**는 상시 지속형 Node.js 컨테이너를 무료로 제공하므로 Socket.IO 서버 운영에 가장 적합합니다.

1. [Render.com](https://render.com)에 로그인합니다.
2. 대시보드 우측 상단 **New +** ➔ **Web Service**를 클릭합니다.
3. 깃허브의 `meta-world` 레포지토리를 선택하고 연결합니다.
4. 아래 설정값을 입력합니다:
   - **Name**: `meta-world-server` (원하는 이름)
   - **Region**: `Singapore` 또는 `Oregon`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
5. **Create Web Service**를 클릭합니다.
6. 배포가 완료되면 상단에 부여되는 **공개 URL**을 복사합니다.  
   *(예: `https://meta-world-server.onrender.com`)*

---

## 🌐 4. 프론트엔드 배포: Vercel (웹 클라이언트)

1. [Vercel.com](https://vercel.com)에 로그인합니다.
2. **Add New...** ➔ **Project**를 클릭합니다.
3. 깃허브의 `meta-world` 레포지토리를 선택하여 **Import**합니다.
4. **Build and Output Settings** 확인:
   - **Framework Preset**: `Vite` (자동 감지됨)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. ⚠️ **Environment Variables (환경 변수) 설정 (가장 중요!)**:
   - **Key**: `VITE_SOCKET_URL`
   - **Value**: `https://meta-world-server.onrender.com` *(앞서 3단계에서 복사한 Render 서버 주소)*
6. **Deploy** 버튼을 클릭합니다!

---

## 🔍 5. 연동 확인 및 팁

- Vercel 배포 완료 후 제공되는 주소(예: `https://meta-world.vercel.app`)에 접속합니다.
- 상단 바 우측에 **[온라인]** 녹색 인디케이터가 뜨면 Render 서버와 정상적으로 연결된 것입니다.
- 💡 **참고 (Render 무료 티어 슬립 모드)**:  
  Render 무료 플랜은 15분간 접속이 없으면 대기(Sleep) 모드로 전환됩니다. 대기 상태일 때는 첫 접속 후 서버가 깨어나는 데 약 30~50초 정도 소요될 수 있으며, 상단에 `연결 중...` 상태가 유지되다가 서버가 깨어나면 자동으로 `온라인`으로 전환됩니다.
