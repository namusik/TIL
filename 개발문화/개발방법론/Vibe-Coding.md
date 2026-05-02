# Vibe Coding (바이브 코딩)

> 최종 업데이트: 2026-05-02 | Andrej Karpathy 원전 트윗(2025-02-02) 이후 1년+ 경과 시점

## 개념

> "There's a new kind of coding I call 'vibe coding', where you fully give in to the vibes, embrace exponentials, and forget that the code even exists."
> — **Andrej Karpathy**, [X 트윗 #1886192184808149383](https://x.com/karpathy/status/1886192184808149383), 2025-02-02

Vibe Coding은 **LLM이 생성한 코드를 검토하지 않고 "느낌"으로 받아들이는 AI 코딩 방식**이다. Karpathy 본인이 정의한 핵심 행동:
- diff를 검토하지 않고 변경 모두 수락
- 에러 메시지를 그대로 복사·붙여넣기
- 코드가 본인의 이해 범위를 넘어가는 것을 허용
- "throwaway weekend projects" 한정으로 제안

> 비유: 자율주행차에서 핸들·페달을 안 보고 졸면서 가는 것. 동네 한 바퀴는 어쩌면 괜찮지만, 고속도로에 올리면 사고 직전.

## 배경/역사

| 시점 | 사건 |
|---|---|
| **2025-02-02** | Andrej Karpathy가 X(Twitter)에 처음 명명. Cursor Composer + Claude Sonnet 환경에서 SuperWhisper로 음성 입력하며 "vibe coding" 발견 |
| **2025-03-19** | Simon Willison이 ["Not all AI-assisted programming is vibe coding"](https://simonwillison.net/2025/Mar/19/vibe-coding/)에서 용어 재정의. "리뷰 안 하는 것"이 본질 |
| **2025-06-25** | Kent Beck이 ["Augmented Coding: Beyond the Vibes"](https://tidyfirst.substack.com/p/augmented-coding-beyond-the-vibes)에서 vibe ↔ augmented coding 이분 제시 |
| **2025-07-14** | Amazon Kiro가 "vibe coding의 한계를 극복하는 SDD" 명목으로 출범 |
| **2025-09-02** | GitHub Spec Kit 출범 — "vibe-coding이 미션 크리티컬엔 부적합"이라 명시 |
| **2025-10-08** | Willison이 [Vibe engineering](https://simonw.substack.com/p/vibe-engineering) 발표 — vibe coding의 책임 있는 반대편 명명 |
| **2025-11** | ThoughtWorks Tech Radar Vol.34에서 SDD를 "Assess" 등급에 등재. 업계 패러다임 전환 인정 |
| **2025-12 ~** | 보안 취약점 정량 데이터 누적: AI 공동저작 코드의 취약점이 **2.74배** 높음 ([Wikipedia: Vibe coding](https://en.wikipedia.org/wiki/Vibe_coding) 정리) |

## 정의 논쟁: Karpathy vs Willison

### Karpathy의 원래 정의 (느슨함)
"코드를 잊고 vibe에 굴복" — throwaway 프로젝트 한정의 **놀이적 모드**.

### Simon Willison의 엄격 재정의
> "Vibe coding is **building software with an LLM without reviewing the code it writes**."
> — Simon Willison, 2025-03-19

핵심 분리: **AI 보조 코딩 ≠ vibe coding**. 리뷰·테스트·이해를 거치면 그건 그냥 소프트웨어 개발이다.

> Willison의 골든 룰: "**I won't commit any code to my repository if I couldn't explain exactly what it does to somebody else.**" — 본인이 설명할 수 없는 코드는 커밋 금지.

### Kent Beck의 "Augmented Coding"

| 구분 | Vibe Coding | Augmented Coding |
|---|---|---|
| 신경 쓰는 것 | **행동만** (system behavior) | 코드·복잡도·테스트·커버리지 모두 |
| 가치 체계 | "동작하면 OK" | "tidy code that works" (핸드 코딩과 동일) |
| AI의 역할 | 코드 생성기 | 협업 파트너 |
| TDD와의 관계 | 무관/회피 | TDD가 "**superpower**"가 됨 |

> Kent Beck (52년 경력 TDD 창시자), Pragmatic Engineer 인터뷰 2025-06-11:
> "Test driven development is a 'superpower' when working with AI agents. AI agents can (and do!) introduce regressions. An easy way to ensure this does not happen is to have unit tests."

## 위험성: 정량 데이터

[Wikipedia: Vibe coding](https://en.wikipedia.org/wiki/Vibe_coding)이 2025-12까지 누적된 연구를 정리:

| 지표 | 결과 |
|---|---|
| 보안 취약점 발생률 | AI 공동저작 코드가 **2.74배** 높음 |
| 주요 이슈 (logic errors, misconfig 등) | 1.7배, 특히 misconfiguration **75% 증가** |
| 경험 많은 OSS 개발자의 AI 사용 시 속도 | **19% 더 느림** (자기 예측과 반대) |
| 리팩터링 비율 (2024) | 25% → **10% 미만**으로 하락 |
| 코드 중복 (2024) | **4배 증가** |
| 실제 사례 | Tea/Sapphos: vibe-coded 앱 DB가 외부 접근 권한 과도 → 데이터 유출 |

> [Databricks: Dangers of Vibe Coding](https://www.databricks.com/blog/passing-security-vibe-check-dangers-vibe-coding), [Checkmarx: Security in Vibe Coding](https://checkmarx.com/blog/security-in-vibe-coding/), [Retool: Risks of Vibe Coding](https://retool.com/blog/vibe-coding-risks) 모두 엔터프라이즈 보안 관점에서 정면 비판.

## 빅테크 3사의 명시적 비판

| 회사 | 비판 형태 | 인용 |
|---|---|---|
| **GitHub** | Spec Kit 출범 글에서 직접 명명·비판 | "This 'vibe-coding' approach can be great for quick prototypes, but less reliable when building serious, mission-critical applications." (Den Delimarsky, 2025-09-02) |
| **Amazon** | Kiro 출범의 표어가 "Beyond Vibe Coding" | "Sometimes it's better to take a step back, think through decisions, and you'll end up with a better application." (Kiro 출범 블로그, 2025-07-14) |
| **Anthropic** | Claude Code 공식 가이드 | "Letting Claude jump straight to coding can produce code that solves the wrong problem. Use Plan Mode to separate exploration from execution." (Claude Code Best Practices) |
| **Google** | Gemini Agent Mode | "The agent never acts blindly. Before modifying any code, it presents a detailed plan." (Jerome Simms, 2025-07-17) |

> 4사 모두 "계획·명세 → 실행"을 강제하는 워크플로우를 도입하며 vibe coding의 정반대로 이동했다.

## Birgitta Böckeler의 균형 잡힌 시각

ThoughtWorks의 Birgitta Böckeler는 [To vibe or not to vibe](https://martinfowler.com/articles/exploring-gen-ai/to-vibe-or-not-vibe.html)(2025-09-23)에서 이분법 자체를 비판:

> "The discourse about to what level AI-generated code should be reviewed often feels very binary."

대신 **3축 평가**를 제안:
1. **오류 확률** — AI가 틀릴 가능성이 얼마나 되나?
2. **미발견 시 임팩트** — 틀렸을 때 피해는?
3. **본인 발견 능력** — 내가 그 오류를 잡아낼 수 있나?

→ 세 축의 곱이 크면 high-review, 작으면 vibe도 OK. 흑백 논리가 아닌 리스크 기반 사고.

## "70% 문제" (Addy Osmani)

Google의 Addy Osmani가 책 *Beyond Vibe Coding: From Coder to AI-Era Developer*(O'Reilly, 2025)에서 정의한 현상:

> AI는 작업의 **70%까지 빠르게 도달**하지만, **마지막 30%는 깊은 엔지니어링 지식 없이는 극복 불가**.

이 30%가 vibe coding으로는 안 된다는 게 핵심. 명세·테스트·도메인 이해가 마지막 30%를 메우는 도구다.

## 언제 vibe coding이 OK인가

엄격한 비판자들도 다음 영역엔 vibe coding 허용:

| 허용 영역 | 이유 |
|---|---|
| **Throwaway weekend 프로젝트** | Karpathy 본인이 한정한 범위 |
| **개인 자동화 스크립트** | Willison: "Everyone deserves the ability to automate tedious tasks" |
| **프로토타입·탐색적 학습** | 빠른 검증이 목적, 결과물 폐기 전제 |
| **로우코드/노코드 대체** | 비개발자가 일회성 도구 만드는 케이스 |

→ 공통점: **결과물이 폐기되거나 격리되며**, **타인·시스템에 영향이 없다**.

## 안티패턴

- **프로덕션에서 vibe coding** — 보안·일관성·유지보수 모두 붕괴
- **vibe로 작성 후 "AI가 짠 거니 책임 없다"** — Willison: "If you couldn't explain exactly what it does, don't commit"
- **테스트 통과 = 검증 완료로 간주** — Fowler: AI는 테스트를 통과시키려 테스트 자체를 지우기도 함
- **vibe coding으로 vibe coding을 디버깅** — 블랙박스 위에 블랙박스. 빠지면 못 빠져나옴

## 한 줄 요약

> **Vibe Coding = "LLM 코드를 리뷰 없이 받아들이는 모드"** (Willison 정의). Karpathy가 2025-02 throwaway 프로젝트용으로 명명했지만, 1년 만에 보안 취약점 2.74배 등 정량적 위험이 누적되며 빅테크 4사(GitHub/Amazon/Anthropic/Google) 모두 SDD/Plan Mode/Augmented Coding으로 정반대 방향 이동. **결정 기준은 "리뷰 가능성·임팩트·자기 능력"의 3축 리스크 평가**.

## 관련 문서

- [AI 시대의 코드 방법론 선택](AI-시대-방법론-선택.md) — Vibe Coding의 대안으로서 SDD/DDD/TDD 조합
- [SDD](SDD.md) — Vibe Coding의 직접적 안티테제
- [TDD](TDD.md) — Augmented Coding의 핵심 안전망

## 참조 (검증된 1차 출처)

### 원전·정의
- Andrej Karpathy, [원전 트윗](https://x.com/karpathy/status/1886192184808149383), 2025-02-02
- Andrej Karpathy, [1주년 회고 트윗](https://x.com/karpathy/status/2019137879310836075), 2026-02-02
- Simon Willison, [Not all AI-assisted programming is vibe coding](https://simonwillison.net/2025/Mar/19/vibe-coding/), 2025-03-19
- Simon Willison, [Vibe engineering](https://simonw.substack.com/p/vibe-engineering), 2025-10-08
- Kent Beck, [Augmented Coding: Beyond the Vibes](https://tidyfirst.substack.com/p/augmented-coding-beyond-the-vibes), 2025-06-25
- Kent Beck (Pragmatic Engineer 인터뷰), [TDD, AI agents and coding](https://newsletter.pragmaticengineer.com/p/tdd-ai-agents-and-coding-with-kent), 2025-06-11

### 비판/위험성
- Birgitta Böckeler (ThoughtWorks), [To vibe or not to vibe](https://martinfowler.com/articles/exploring-gen-ai/to-vibe-or-not-vibe.html), 2025-09-23
- Martin Fowler, [Some thoughts on LLMs and Software Development](https://martinfowler.com/articles/202508-ai-thoughts.html), 2025-08-28
- Addy Osmani, [Beyond Vibe Coding](https://beyond.addy.ie/) (O'Reilly), 2025
- Databricks, [Passing the Security Vibe Check](https://www.databricks.com/blog/passing-security-vibe-check-dangers-vibe-coding)
- Checkmarx, [Security in Vibe Coding](https://checkmarx.com/blog/security-in-vibe-coding/)
- Retool, [The Risks of Vibe Coding](https://retool.com/blog/vibe-coding-risks)
- [Wikipedia: Vibe coding](https://en.wikipedia.org/wiki/Vibe_coding) — 정량 통계 메타 출처

### 빅테크의 SDD 전환 (Vibe Coding 대안)
- Den Delimarsky (GitHub), [Spec-driven development with AI](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/), 2025-09-02
- Nikhil Swaminathan & Deepak Singh (Amazon), [Introducing Kiro](https://kiro.dev/blog/introducing-kiro/), 2025-07-14
- [Anthropic Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)
- Jerome Simms (Google), [Gemini Code Assist Agent Mode](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-code-assist-updates-july-2025/), 2025-07-17
- [InfoQ: Beyond Vibe Coding — Amazon Introduces Kiro](https://www.infoq.com/news/2025/08/aws-kiro-spec-driven-agent/)
- Ken Mugrage (ThoughtWorks), [From vibe coding to context engineering: 2025 in software development](https://www.thoughtworks.com/en-us/insights/blog/machine-learning-and-ai/vibe-coding-context-engineering-2025-software-development), 2025-11-05
