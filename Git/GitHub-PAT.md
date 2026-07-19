# GitHub Personal Access Token (PAT)

> 최종 업데이트: 2026-07-14 | GitHub 기준 (Fine-grained PAT GA)

## 개념

PAT(Personal Access Token)는 **GitHub 비밀번호 대신 쓰는 개인 인증 토큰**이다. HTTPS로 `git clone`/`push`/`pull`을 하거나 GitHub API·CLI를 호출할 때, 비밀번호 자리에 이 토큰을 넣어 신원을 증명한다.

> 호텔 카드키에 비유할 수 있다. 내 신분증(비밀번호)을 매번 맡기는 대신, **제한된 권한과 기한을 가진 임시 카드키(토큰)**를 발급받아 쓴다. 잃어버려도 그 카드만 무효화하면 되고, 신분증 자체는 안전하다.

## 배경/역사

| 시기 | 내용 |
|------|------|
| ~2021.8 | GitHub가 **git 작업의 비밀번호 인증을 폐지**. 이후 HTTPS 인증엔 PAT(또는 SSH) 필수 |
| 2022.10 | **Fine-grained PAT** 공개 프리뷰 도입 (레포·권한 세분화) |
| 2025.3 | Fine-grained PAT **정식 출시(GA)**, 조직 기본 활성화 |
| 이후 | Classic PAT는 아직 지원되나, GitHub는 장기적으로 **Classic 폐지**를 목표로 함 |

비밀번호 인증 폐지가 PAT를 필수로 만든 출발점이다. 계정 전체에 광범위했던 Classic의 보안 약점을 보완하려 Fine-grained가 나왔고, 지금은 이쪽이 권장 기본이다.

## PAT의 두 종류

| 구분 | Classic | **Fine-grained** (권장) |
|------|---------|------------------------|
| 권한 범위 | `repo`, `workflow` 등 **스코프 단위** — 계정 전체 리소스에 광범위 | **특정 리포지토리만** 지정, 권한을 항목별로 세밀하게 |
| 만료일 | 선택 (무기한 가능 ⚠️) | **필수** |
| 조직 통제 | 약함 | 조직이 승인·정책으로 통제 가능 |
| 상태 | 레거시(지원은 됨) | **GA, 기본 권장** |

> Fine-grained는 "이 토큰은 A 레포에 **읽기만**"처럼 콕 집어 줄 수 있어, 유출돼도 피해 범위가 좁다.

## 어디에 쓰나

- **HTTPS git 인증** — clone/push/pull (SSH 키를 안 쓸 때)
- **GitHub API / `gh` CLI** 인증
- **CI/CD·스크립트**에서 GitHub 리소스 접근

## 사용법

**발급**: `Settings → Developer settings → Personal access tokens` → 레포·권한·만료일 지정 → 생성. **생성 직후 한 번만 표시**되므로 그때 복사해 둔다.

**git 인증** — 비밀번호 자리에 토큰을 넣는다.
```sh
git clone https://github.com/user/repo.git
Username: your-username
Password: github_pat_xxxxxxxx   # ← 비밀번호가 아니라 PAT
```

**Credential Manager에 저장** — 매번 입력하지 않도록 자격증명 저장소에 물려둔다.
```sh
git config --global credential.helper store    # 또는 osxkeychain(mac), manager(win)
```

## ⚠️ 보안 — 비밀번호처럼 취급

- **코드·커밋에 절대 넣지 않는다.** 실수로 커밋하면 GitHub가 감지해 자동 무효화할 만큼 위험하다.
- **최소 권한 + 짧은 만료** — 필요한 레포·권한만, 만료일은 짧게.
- **URL에 토큰 박기 금지** — `https://<TOKEN>@github.com/...`은 셸 히스토리·로그에 남는다.
- 안전 저장: **Git Credential Manager**, 환경변수, secret manager.

## 토큰 로테이션 (Rotation)

로테이션은 **토큰을 주기적으로 새것으로 교체하고 옛 것을 폐기하는 것**이다. 토큰은 오래 살수록 유출 위험이 누적되므로, 정기 교체로 **노출 창(window)을 짧게** 제한한다.

> 자물쇠 열쇠를 주기적으로 바꾸는 것과 같다. 복사본이 돌아다녀도, 자물쇠를 주기적으로 갈면 옛 열쇠는 무용지물이 된다.

"로테이션 되게 하라"는 요구는 아래 세 가지를 갖추라는 뜻이다.

| 요건 | 내용 |
|------|------|
| ① **만료일 설정** | 무기한 금지. Fine-grained는 만료 필수라 자연스럽게 유도 |
| ② **교체하기 쉽게** | 토큰을 **하드코딩하지 말고** 한 곳(secret manager·환경변수·CI secret)에서 관리 → 갈 때 한 곳만 수정 |
| ③ **주기적 재발급·폐기** | 만료 전 새 토큰 발급 → 사용처 교체 → 옛 토큰 revoke |

②가 핵심이다. 토큰이 여기저기 박혀 있으면 로테이션이 지옥이 되므로, **"바꾸기 쉽게 구성해두는 것"이 곧 로테이션 가능하게 만드는 것**이다.

```
① 새 PAT 발급 (만료일 지정)
② secret/env 값만 교체 (코드 수정 X)
③ 정상 동작 확인
④ 옛 PAT revoke (Settings에서 폐기)
```

GitHub는 **만료 임박 시 이메일로 알림**을 준다. **자동 로테이션**까지 필요하면 PAT보다 **GitHub App(설치 토큰, 1시간 만료 자동 갱신)**이 적합하다 — PAT는 기본적으로 **수동 로테이션**이다.

## PAT vs SSH 키 vs GitHub App

| | PAT | SSH 키 | GitHub App |
|---|-----|--------|-----------|
| 방식 | HTTPS + 토큰 | 키 페어 | 설치 토큰 |
| 용도 | git + **API·CLI** | 주로 git | 조직·자동화 |
| 만료·로테이션 | 만료 설정, 수동 로테이션 | 만료 없음(수동 관리) | **자동 갱신(1시간)** |
| 적합 | 개인 git·API·간단한 CI | 순수 git 작업 | 서버·봇·대규모 자동화 |

개인이 git+API를 쓰면 PAT, 순수 git이면 SSH 키, 자동화·조직 규모면 GitHub App이 정석이다.

## 관련 문서

- [Git SSH Key 관리](Git-SSH-Key-관리.md) — 토큰 대신 키 페어로 인증하는 방식
- [Git Clone](Git-Clone.md) — HTTPS/SSH 저장소 복제
- [Git 멀티 계정 SSH 설정](Git-멀티-계정-SSH-설정.md) — 여러 GitHub 계정 분리
- [OAuth 2.0](../SSO/OAuth-2.0.md) — 토큰 기반 인증·인가의 일반 개념
