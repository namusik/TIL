# OWASP Top 10 (2025)

> 최종 업데이트: 2026-07-29 | OWASP Top 10:2025 기준

## 개념

**OWASP Top 10**은 웹 애플리케이션에서 **가장 위험하고 흔한 보안 리스크 10가지**를 정리한 목록이다. 전 세계 보안 데이터(CVE·CWE)와 실무자 설문을 근거로 주기적으로 갱신되며, 백엔드 개발자의 **보안 기본 체크리스트**로 통한다.

> 병원의 "가장 흔한 질병 10가지 예방 수칙"과 같다. 모든 병을 다루진 않지만, **제일 자주·크게 터지는 것부터** 막게 해준다.

## OWASP란

**OWASP(Open Worldwide Application Security Project)**는 웹·애플리케이션 보안 **베스트프랙티스를 무료로 만드는 비영리 국제 재단**(2001년 설립)이다. 계수나 수치가 아니라 **단체 이름**이다. 대표 산출물은 다음과 같다.

| 산출물 | 내용 |
|--------|------|
| **Top 10** | 가장 위험한 웹 앱 취약점 10가지 (이 문서) |
| **Cheat Sheet Series** | 주제별 실무 가이드 (예: Password Storage → Argon2id 권장) |
| **ASVS** | 애플리케이션 보안 검증 표준 |
| **ZAP** | 보안 취약점 테스트 도구 |
| **Dependency-Check** | 의존성 취약점 스캐너 |

## OWASP Top 10:2025 목록

**2025년 11월 발표, 2026년 1월 최종 확정**됐다. **2021 이후 첫 대개정**으로, 175,000개 이상의 CVE와 248개 CWE, 실무자 설문을 분석했다.

| 순위 | 카테고리 | 핵심 위험 | 주요 대응 |
|------|----------|-----------|-----------|
| **A01** | Broken Access Control | 권한 검증 실패 — 남의 리소스·관리 기능 접근 | 서버측 권한 검증, **기본 거부(deny by default)** |
| **A02** | Security Misconfiguration | 기본 계정·불필요 기능·에러 노출 | 하드닝, 최소 권한, 에러 메시지 은닉 |
| **A03** | 🆕 Software Supply Chain Failures | 의존성·빌드·배포 경로 침해 | **SBOM**, 의존성 스캔(Trivy 등), 버전 핀·서명 |
| **A04** | Cryptographic Failures | 약한 암호·평문 저장·전송 | **TLS**, 강한 비밀번호 해싱(**Argon2id**) |
| **A05** | Injection | SQL·OS 명령·LDAP 인젝션 | **파라미터 바인딩**, 입력 검증 |
| **A06** | Insecure Design | 설계 단계의 구조적 결함 | 위협 모델링, 보안 설계 패턴 |
| **A07** | Authentication Failures | 약한 인증·세션 관리 | MFA, 안전한 세션·토큰 |
| **A08** | Software or Data Integrity Failures | 무결성 미검증(역직렬화·업데이트) | 서명 검증, 신뢰된 소스 |
| **A09** | Security Logging & Alerting Failures | 로깅·탐지·경보 부재 | 중앙 로깅, 이상 징후 알림 |
| **A10** | 🆕 Mishandling of Exceptional Conditions | 예외·에러 처리 미흡 | 안전한 실패(fail-safe), 정보 노출 차단 |

## 2021 → 2025 주요 변화

| 변화 | 내용 |
|------|------|
| 🆕 **신규 2개** | **A03 Software Supply Chain Failures**(공급망), **A10 Mishandling of Exceptional Conditions**(예외 처리) |
| 🔀 **흡수** | **SSRF**(2021 A10)가 **A01 Broken Access Control에 통합** |
| 📈 **상승** | **Security Misconfiguration** 2021 #5 → **2025 #2** |
| 👑 **유지** | **Broken Access Control**이 여전히 **#1** (가장 심각) |

특히 **A03 공급망**의 신규 진입은 실제로 프로덕션에서 벌어지는 공격(오염된 라이브러리·빌드 파이프라인 침해)을 반영한 것으로, 최근 보안 흐름의 핵심이다.

## 백엔드 개발자가 자주 만나는 항목

- **A01 접근 제어** — "이 사용자가 이 리소스에 권한이 있나"를 **매 요청 서버에서** 검증. 프런트 숨김만으로는 안 됨.
- **A03 공급망** — 의존성에 취약점이 없는지 스캔([Trivy](../../DevOps/Trivy/Trivy-개념.md)), 버전 고정. 무심코 당긴 라이브러리가 구멍.
- **A04 암호 실패** — 전송은 [TLS](../네트워크/보안/TLS/TLS.md), 비밀번호는 [Argon2id](비밀번호-해싱.md). 평문 저장·약한 해시 금지.
- **A05 인젝션** — 문자열 연결 쿼리 금지, **파라미터 바인딩** 필수.
- **A07 인증** — 세션·토큰 관리, [Spring Security](../../Spring/스프링-시큐리티/)로 표준 구현.

## 관련 문서

- [비밀번호 해싱](비밀번호-해싱.md) — A04 암호 실패의 핵심(Argon2id·bcrypt)
- [Trivy 개념](../../DevOps/Trivy/Trivy-개념.md) — A03 공급망: 의존성·이미지 취약점 스캔
- [TLS](../네트워크/보안/TLS/TLS.md) — A04: 전송 구간 암호화
- [Spring Security](../../Spring/스프링-시큐리티/) — A01·A07: 인증·인가 구현

## 참조

- [OWASP Top 10:2025](https://owasp.org/Top10/2025/)
- [OWASP Top 10:2025 Introduction](https://owasp.org/Top10/2025/0x00_2025-Introduction/)
