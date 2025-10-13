# Color Scale Configurator

이 프로젝트는 OKLCH 기반 컬러 스케일 생성기를 실시간 Configurator UI로 확장한 애플리케이션입니다. 색상 선택, 스케일 생성, 대비(WCAG) 확인, 다양한 내보내기 포맷, URL 공유를 한 곳에서 제공합니다.

- Tech: Next.js, TypeScript, Tailwind CSS v4, Vitest
- Goals: 입력 공간 전환, 글로벌 명도(Lightness) 쉬프트, 토큰 네이밍 패턴, WCAG 배지, 여러 내보내기, URL 공유, a11y, 웹 워커 성능, 테스트

## 시작하기

1. 의존성 설치

```bash
npm install
```

2. 개발 서버 실행

```bash
npm run dev
```

- 개발 서버: http://localhost:3000 (포트가 사용 중이면 자동으로 다른 포트를 사용합니다)

3. 프로덕션 빌드

```bash
npm run build
```

- next.config.ts에 `output: "export"`가 설정되어 있어 정적 사이트로 내보내기 준비가 되어 있습니다.

## 메타데이터 및 아이콘

이 프로젝트는 최신 Next.js Metadata API를 사용하여 검색/공유 메타를 구성합니다.

- 구성 파일: `src/app/layout.tsx`
- 아이콘/파비콘: `public/tiltle.png`를 `icons.icon`, `icons.shortcut`, `icons.apple`로 사용
- Open Graph/Twitter 카드: `tiltle.png`를 공유 이미지로 사용
- 권장 OG 이미지 크기: 1200x630 (필요 시 동일 경로로 교체 후 재빌드)

도메인은 `metadataBase: https://color.oswarld.com`으로 설정되어 있으며, 배포 도메인 변경 시 업데이트하세요.

## 스크립트

- `dev`: 개발 서버 시작
- `build`: 프로덕션 빌드 생성
- `export`: (참고용) 정적 내보내기는 `next.config.ts`의 설정으로 처리
- `predeploy`/`deploy`: GitHub Pages로 배포 (CNAME: `color.oswarld.com`)

## 폴더 구조 하이라이트

- `src/components`: Configurator UI 컴포넌트 (picker, controls, swatches, export tabs, preview, toast)
- `src/lib/color`: 변환, 스케일, 대비, 직렬화
- `src/lib/a11y`: WCAG 헬퍼
- `src/lib/worker`: 팔레트 Web Worker
- `src/store`: 팔레트 상태 (추후 Zustand로 교체 가능)
- `src/tests`: Vitest 테스트 스위트

## 테스트

- 실행:

```bash
npm run test
```

- UI 모드:

```bash
npm run test:ui
```

Vitest 환경은 `happy-dom`으로 구성되어 있으며, 브라우저 API(mock)와 타임아웃은 `src/tests/setup.ts`에서 설정합니다.

## 다음 단계

- 컴포넌트 간 상태를 페이지에 연결하고, URL 동기화 추가
- 로컬 스토어를 Zustand로 교체
- 내보내기 페이로드 구현 및 클립보드 토스트 정리
