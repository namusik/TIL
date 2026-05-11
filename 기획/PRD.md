# PRD (Product Requirements Document, 제품 요구사항 문서)

> 최종 업데이트: 2026-05-03 | Marty Cagan *INSPIRED* 표준 + AI 시대 Living Spec 진화 반영

## 개념

PRD는 **PM/PO가 "무엇을 만들지"를 구체화해 디자이너·엔지니어·QA·이해관계자에게 넘기는 표준 문서**다. 한국 회사의 "기획서"에 해당하지만, 보통 더 정밀하다 — 개발팀이 그대로 받아 구현 가능한 수준까지 작성된다.

> 비유: 건축 도면. 도면이 있어야 시공(개발)·인테리어(디자인)·검수(QA)·건축주(이해관계자)가 같은 그림을 본다. 도면이 모호하면 다 짓고 나서 "이게 아니었는데"가 나온다.

핵심 명제: **PRD는 코드가 아닌 "의도"를 담는 그릇이다.** 의도가 명확해야 구현이 정확해지고, 검증이 가능해지고, 변경에 대응할 수 있다.

## 배경/역사

PRD라는 양식은 1980~90년대 미국 소프트웨어 산업에서 **3단계 요구사항 위계**의 한 축으로 정립됐다.

| 문서 | 작성자 | 답하는 질문 |
|---|---|---|
| **MRD** (Market Requirements Document) | Marketing / BizDev | **왜** 만드나? 시장이 원하나? |
| **PRD** (Product Requirements Document) | PM / PO | **무엇을** 만드나? |
| **FRS** (Functional Requirements Spec) | Engineering | **어떻게** 만드나? |

### 핵심 진화 단계

- **1980~2000년대 초** Microsoft·IBM 등 대형 SW 기업에서 두툼한 워터폴 PRD가 표준. 수십~수백 페이지가 흔함
- **2008** **Marty Cagan**의 *INSPIRED: How To Create Tech Products Customers Love* 출간. PRD를 "두꺼운 문서"가 아닌 **"제품 발견(discovery)의 산출물"**로 재정의 — 현대 실리콘밸리 PRD의 기준점
- **2010년대** 애자일·린 스타트업 영향으로 **"Lean PRD"·"1-pager"** 양식 부상. Google·Facebook 등에서 짧고 살아있는 문서 선호
- **2020년대 초** Notion·Linear·Productboard 같은 협업 도구가 PRD 양식을 결정. 정적 문서에서 **링크·임베드·코멘트가 살아있는 페이지**로
- **2024~2026** AI 코드 생성 일반화 — PRD가 **AI가 직접 읽는 Living Spec**으로 진화. GitHub Spec Kit `/specify`, Anthropic CLAUDE.md, OpenAI AGENTS.md 같은 기계 가독 명세 부상

> Cagan의 *INSPIRED*는 PM 업계의 사실상 정전(canon). 한국에선 『인스파이어드: 감동을 전하는 제품은 어떻게 만들어지는가』로 번역됨.

## PRD에 들어가는 것 (표준 구성)

| 섹션 | 내용 | 예시 |
|---|---|---|
| **배경/문제** | 왜 이걸 만드나? 어떤 사용자 문제? | "신규 가입자 24시간 내 이탈률 60% — 인증 메일 미수신이 주 원인" |
| **목표·성공 지표** | 무엇이 성공인가? (정량) | "이메일 인증 완료율 70% → 90%, OKR Q3 핵심" |
| **사용자 시나리오** | 누가·언제·어떻게 쓰는가 | "신규 가입자가 메일을 못 받았을 때 인앱에서 재발송 가능" |
| **범위 (In scope)** | 만들 것 | "재발송 버튼, 횟수 제한, 발송 로그" |
| **범위 외 (Out of scope)** | 이번엔 안 만들 것 | "SMS 인증 — Q4 별도 프로젝트" |
| **기능 요구사항** | 무엇을 어떻게 동작? | 화면·플로우·룰 |
| **비기능 요구사항** | 응답속도·보안·가용성·접근성 | "재발송 응답 200ms 이내", "분당 3회 제한" |
| **엣지케이스** | 예외 상황 | "메일 서버 다운 시 큐 적재", "동일 메일 동시 가입 시도" |
| **수용 기준 (AC)** | "완료" 정의 | "통합 테스트 통과 + 이벤트 로깅 검증" |
| **일정·마일스톤** | 언제까지 | "디자인 1주 → 개발 2주 → QA 1주" |
| **이해관계자** | 누가 결정하고 누가 알아야 하는지 | DRI, 검토자, 알림 대상 |
| **부록** | 디자인 링크·메트릭 대시보드·관련 PRD | Figma 링크, Amplitude 대시보드 |

> 모든 섹션을 다 채울 필요는 없다. **필요한 정밀도는 프로젝트 규모·리스크에 비례**.

## PRD vs 한국식 "기획서"

| 비교축 | 한국식 기획서 (전형) | 실리콘밸리 PRD (전형) |
|---|---|---|
| 분량 | 와이어프레임 + 간단한 흐름 설명 | 텍스트 명세 위주, 도식은 보조 |
| 정밀도 | 컨셉·UI 중심 | 수용 기준·엣지케이스·비기능 요구까지 |
| 범위 외 명시 | 자주 누락 | 명시적으로 작성 (스코프 크리프 방지) |
| 메트릭/성공 지표 | 종종 누락 또는 정성적 | 정량 KPI 필수 |
| 변경 이력 | 버전 관리 약함 | git/Notion 변경 이력 강함 |
| 이해관계자 명시 | 모호한 경우 많음 | DRI(Directly Responsible Individual) 명시 |
| 작성자 | 기획자 단독 | PM이 작성하되 디자인·엔지니어 협업 작성 흔함 |

> 일반화된 비교일 뿐 실제 회사 별 편차 큼. 토스·당근·쿠팡 등 기술 중심 한국 기업은 PRD 양식 채택 추세.

## 좋은 PRD의 6가지 특징

| 특징 | 설명 |
|---|---|
| **What에 집중, How는 최소화** | "Redis 사용"이 아니라 "100ms 내 응답" 식으로 — 구현 결정을 엔지니어에게 위임 |
| **수용 기준이 검증 가능** | "사용자가 만족하도록" X / "테스트 X 통과 + 메트릭 Y > Z" O |
| **엣지케이스 명시** | 정상 흐름만 쓴 PRD는 절반짜리. "동시성·실패·타임아웃·재시도"를 못박아둠 |
| **범위 외 명시** | "이건 안 만든다"가 "이건 만든다"만큼 중요 |
| **메트릭 연결** | 성공/실패를 측정할 수 있게 — 정성적 표현 지양 |
| **변경에 강함** | 변경 이력·결정 근거를 남겨 6개월 뒤에도 "왜 이렇게 결정했지"가 답해짐 |

## 짧은 PRD 예시 (1-pager)

````markdown
# 회원가입 인증 메일 재발송

## 배경/문제
신규 가입자의 24시간 내 이탈률이 60%다. CS 티켓 분석 결과 70%가
"인증 메일을 받지 못했다". 현재는 재발송 수단이 없어 재가입을 유도하고 있음.

## 목표
- 이메일 인증 완료율 70% → 90% (Q3 OKR 핵심 결과)
- CS 티켓 "인증 메일 미수신" 50% 감소

## 사용자 시나리오
1. 가입 폼 제출 후 인증 메일 발송
2. 사용자가 인증 페이지에서 "다시 보내기" 버튼 클릭
3. 시스템이 새 인증 토큰 발급 + 메일 재발송
4. 사용자가 메일 클릭 시 인증 완료

## 범위
- 인앱 "다시 보내기" 버튼
- 재발송 횟수 제한 (1시간당 3회)
- 발송 로그 (분석/디버깅용)

## 범위 외
- SMS 인증 (Q4 별도 프로젝트)
- 가입 후 24시간 경과 시 자동 만료 정책 (현 로직 유지)

## 기능 요구사항
- POST /signup/resend-verification
- 본인 인증 필요 (가입 폼의 leadId 토큰)
- 응답: { sentAt, remainingAttempts }

## 비기능 요구사항
- 응답 200ms 이내 (P95)
- 동시 가입 시도 시 최신 1건만 유효

## 엣지케이스
- 메일 서버 다운: 큐 적재 + 지수 백오프 재시도 (최대 3회)
- 한도 초과(3회/시간): 429 응답 + 다음 가능 시각 안내
- 이미 인증 완료된 leadId: 200 + "이미 인증됨" 메시지

## 수용 기준
- [ ] 통합 테스트 통과 (정상 + 모든 엣지케이스)
- [ ] 응답시간 P95 < 200ms 검증
- [ ] 발송 로그 이벤트 Amplitude 대시보드에 표시

## 일정
- 디자인: 2026-05-06 ~ 05-13
- 개발: 05-14 ~ 05-27
- QA: 05-28 ~ 06-03
- 배포: 06-04

## 이해관계자
- DRI: PM 김OO
- 검토: 디자인 이OO, 백엔드 박OO, QA 최OO
- 알림: CS팀, 마케팅팀

## 부록
- Figma: [링크]
- 현재 메트릭 대시보드: [Amplitude 링크]
- 관련 PRD: [회원가입 플로우 v2](링크)
````

## AI 시대의 PRD 변화: Living Spec

2024~2026년 AI 코드 생성이 일반화되며 PRD 자체가 변하고 있다.

| 전통 PRD | Living Spec (AI 시대) |
|---|---|
| 사람이 읽는 정적 문서 | AI가 직접 읽고 구현 입력으로 사용 |
| 한 번 쓰고 슬랙에 던짐 | 변경 시 자동으로 코드·테스트 재생성 트리거 |
| 마크다운/Notion 자유 양식 | 구조화된 양식 권장 (Goal/Context/Constraints/Done-when) |
| 출시 후 안 봄 | 운영 메트릭이 다시 spec으로 피드백 |

### 빅테크의 표준 패턴

| 회사 | 명세 파일 | 공식 문서 |
|---|---|---|
| Anthropic Claude Code | `CLAUDE.md` | [Best Practices](https://code.claude.com/docs/en/best-practices) |
| OpenAI Codex | `AGENTS.md` | [Codex Best Practices](https://developers.openai.com/codex/learn/best-practices) |
| Google Gemini Code Assist | `GEMINI.md` | [5 Best Practices](https://cloud.google.com/blog/topics/developers-practitioners/five-best-practices-for-using-ai-coding-assistants) |
| GitHub | Spec Kit `/specify` 산출물 (`spec.md`) | [github/spec-kit](https://github.com/github/spec-kit) |

> Anthropic, [Product management on the AI exponential](https://claude.com/blog/product-management-on-the-ai-exponential) (Cat Wu, 2026-03-19):
> **"When a product manager can go from idea to working prototype in an afternoon, the gap between 'what if we tried…' and 'here, try this' nearly disappears."**

### OpenAI Codex의 4요소 PRD 압축본

> "A good default is to include four things in your prompt: **Goal, Context, Constraints, Done when**." — [Codex Best Practices](https://developers.openai.com/codex/learn/best-practices)

전통 PRD를 4요소로 줄이면 AI가 가장 잘 받아들이는 형태가 된다.

| 4요소 | 전통 PRD 매핑 |
|---|---|
| Goal | 목표·사용자 시나리오 |
| Context | 배경·이해관계자·기존 시스템 |
| Constraints | 비기능 요구·엣지케이스·금지사항 |
| Done when | 수용 기준 (AC) |

> 자세한 변화·도구 생태계는 [AI 시대의 IT 기능 기획](AI-시대-기능기획.md), [SDD](../개발문화/개발방법론/SDD.md) 참조.

## 안티패턴

| 안티패턴 | 왜 위험한가 |
|---|---|
| **두툼한 워터폴 PRD** | 50페이지 PRD는 아무도 안 읽음. 길이가 정밀도와 같지 않음 |
| **What에 How 섞기** | "Redis 사용해서..." → 구현 결정을 PM이 대신함. 엔지니어 자율성·최선 결정 박탈 |
| **수용 기준 정성화** | "사용자가 만족하도록" → 검증 불가능. 정량적 가능 기준 필수 |
| **범위 외 누락** | 스코프 크리프 → 일정 폭발. "안 만들 것"을 명시하는 게 보호장치 |
| **이해관계자 모호** | 결정자가 누군지 모르면 무한 검토 루프 |
| **변경 이력 없음** | 6개월 뒤 "왜 이렇게 결정했지?"에 답할 사람이 없음 |
| **AI가 한 줄로 PRD 자동생성** | "회원가입 PRD 써줘" → 도메인 누락·일반론적 결과. AI는 모호한 입력에 모호하게 답함 |
| **vibe planning** | AI 결과 그대로 PRD 채택 → vibe coding의 결과물 양산. 자세한 위험은 [Vibe Coding](../개발문화/개발방법론/Vibe-Coding.md) |

## 백엔드 개발자가 PRD에서 챙겨야 할 것

PM이 작성한 PRD를 받았을 때 개발자가 점검할 항목:

- **수용 기준이 자동화 테스트로 표현 가능한가?** — 정성적이면 PM과 함께 정량화
- **엣지케이스가 충분한가?** — 동시성·재시도·타임아웃·실패 시 보상 트랜잭션 명시 여부
- **비기능 요구의 P95/P99 명시** — "200ms 이내"가 평균인지 P95인지 못박기
- **트랜잭션 경계가 명시됐나?** — 여러 Aggregate 경계를 넘는 작업은 도메인 이벤트/보상 설계 필요
- **데이터 마이그레이션 영향** — 기존 데이터에 어떻게 적용? 롤백 가능?
- **외부 시스템 의존성** — 메일·결제·SMS 등 SLA·실패 처리 정책
- **모니터링·알림 요구** — 어떤 메트릭을 어떤 임계치에서 알릴지
- **개인정보·보안** — PII 로그 출력 금지, 암호화 정책

> 좋은 PRD는 위 항목 대부분이 이미 명시돼 있다. 빠져있으면 PM과 함께 보완하는 것이 개발 시작 전 단계의 일.

## 한 줄 요약

> **PRD = "무엇을 만들지" 의도를 정밀하게 담아 팀이 같은 그림을 보게 하는 PM의 핵심 산출물.** Marty Cagan *INSPIRED*가 현대 표준의 기준점이며, 1-pager 같은 가벼운 양식부터 두툼한 엔터프라이즈 양식까지 스펙트럼이 넓다. **2024~2026년 AI 코드 생성 일반화로 PRD가 사람용 정적 문서에서 AI가 읽는 Living Spec(CLAUDE.md/AGENTS.md/`spec.md`)으로 진화 중**이라는 것이 가장 큰 변화. 좋은 PRD는 What에 집중·수용 기준이 검증 가능·범위 외 명시·메트릭 연결.

## 관련 문서

- [서비스 설계](서비스-설계.md) — PRD가 들어가는 더 큰 설계 단계
- [AI 시대의 IT 기능 기획](AI-시대-기능기획.md) — PM 역할 자체의 변화
- [SDD](../개발문화/개발방법론/SDD.md) — Living Spec의 표준 워크플로우
- [DDD](../개발문화/개발방법론/DDD.md) — PRD 용어집(Ubiquitous Language) 작성 근거
- [Vibe Coding](../개발문화/개발방법론/Vibe-Coding.md) — vibe planning의 위험성

## 참조

- Marty Cagan, *INSPIRED: How To Create Tech Products Customers Love* (Wiley, 2008 / 2판 2017) — 현대 PRD/PM 표준
- Marty Cagan, *EMPOWERED* (2020), *TRANSFORMED* (2024)
- Lenny Rachitsky, [How AI will impact product management](https://www.lennysnewsletter.com/p/how-ai-will-impact-product-management), 2024-04-09
- Anthropic, [Product management on the AI exponential](https://claude.com/blog/product-management-on-the-ai-exponential) (Cat Wu), 2026-03-19
- GitHub, [Spec Kit](https://github.com/github/spec-kit) + [SDD 매니페스토](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- OpenAI Codex, [Best Practices](https://developers.openai.com/codex/learn/best-practices)
- Anthropic, [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)
