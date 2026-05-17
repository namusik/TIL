# YAML (YAML Ain't Markup Language)

> 최종 업데이트: 2026-05-11 | YAML 1.2.2 기준

## 개념

YAML은 **사람이 읽고 쓰기 쉬운 데이터 직렬화 포맷**이다. 들여쓰기로 구조를 표현해서 마치 잘 정리된 메모처럼 보인다. 이름은 처음엔 "Yet Another Markup Language"였지만, 마크업이 아니라 **데이터 표현**이 본질이라는 의미로 **"YAML Ain't Markup Language"** (재귀 약어)로 바뀜.

> 비유: JSON이 "괄호와 따옴표로 빈틈없이 묶은 양식"이라면, YAML은 "들여쓰기와 빈 줄로 흐름을 보여주는 손글씨 메모". 같은 데이터를 표현해도 사람에게 훨씬 부드럽게 읽힌다.

## 배경/역사

- **2001년** Clark Evans, Ingy döt Net, Oren Ben-Kiki가 공동 설계. 출발 동기는 "XML은 사람이 못 읽겠고, INI는 표현력이 부족하다"는 불만.
- **2005년** YAML 1.1 — 가장 오래 광범위하게 쓰인 버전. 많은 라이브러리가 여전히 1.1 기본값(예: PyYAML).
- **2009년** YAML 1.2 — **JSON의 완전한 슈퍼셋**으로 재정의. boolean을 `true`/`false`로만 인정(1.1의 `yes`/`no`/`on`/`off` 제거).
- **2021년** YAML 1.2.2 — 스펙 문구를 명확화한 개정판. 새 기능 추가는 없음. 현재 최신.

> **Norway Problem(2005)**: YAML 1.1에서는 `NO`가 boolean `false`로 해석돼 노르웨이 국가 코드 `NO`가 거짓이 되는 사고가 자주 발생. 1.2에서 boolean 키워드 축소로 해결됐지만, 1.1 기본인 라이브러리에서는 아직도 만남.

## 기본 구조

YAML은 단 세 종류의 데이터 모양으로 모든 걸 표현한다.

| 종류 | 예시 | 비교 |
|---|---|---|
| 스칼라(Scalar) | `42`, `"hello"`, `true` | JSON의 단일 값 |
| 시퀀스(Sequence) | `- a`<br>`- b` | JSON 배열 |
| 매핑(Mapping) | `key: value` | JSON 객체 |

```yaml
# 매핑 + 시퀀스 + 스칼라가 섞인 전형적인 YAML
order:
  id: 1001
  customer: nam
  items:
    - name: 아메리카노
      price: 3000
    - name: 라떼
      price: 4500
  paid: true
  note: null
```

JSON으로 옮기면:

```json
{
  "order": {
    "id": 1001,
    "customer": "nam",
    "items": [
      {"name": "아메리카노", "price": 3000},
      {"name": "라떼", "price": 4500}
    ],
    "paid": true,
    "note": null
  }
}
```

## 문법 규칙

| 규칙 | 유효 | 불유효/주의 |
|---|---|---|
| 들여쓰기는 **공백만** (탭 금지) | 2칸·4칸 자유, 일관성만 유지 | 탭 사용 시 파싱 에러 |
| 매핑 `key: value` — 콜론 뒤 공백 필수 | `name: nam` | `name:nam` (스칼라로 잘못 파싱) |
| 시퀀스 항목은 `- ` (대시 + 공백) | `- item` | `-item` |
| 같은 레벨은 같은 들여쓰기 폭 | 모두 2칸 | 일부 2칸 + 일부 3칸 (에러) |
| 주석은 `#` | `# 메모` | `// 메모`, `/* */` |
| 문서 시작·끝 마커(선택) | `---` 시작, `...` 끝 | 한 파일에 여러 문서 구분에 활용 |
| 인라인(flow) 표기 허용 | `[1, 2, 3]`, `{a: 1}` | JSON 호환 표기 |

## 스칼라 표현 — 4가지 스타일

YAML의 진짜 매력이자 함정. 같은 문자열도 표기 방식에 따라 의미가 달라진다.

```yaml
# 1. 평문(plain) — 따옴표 없음. 가장 간단하지만 특수문자 주의
title: Hello World

# 2. 작은따옴표 — 이스케이프 없음. \n도 그냥 두 글자
quote1: 'a \n b'   # 결과: a \n b

# 3. 큰따옴표 — 이스케이프 처리. \n은 줄바꿈
quote2: "a \n b"   # 결과: a (줄바꿈) b

# 4. 블록 스칼라 — 여러 줄 문자열
literal: |
  줄바꿈을
  그대로
  보존
folded: >
  줄바꿈을
  공백으로
  접음
```

### 블록 스칼라 chomping 지시자

긴 텍스트 끝의 줄바꿈 처리 방식.

| 지시자 | 의미 |
|---|---|
| `|` / `>` | clip — 마지막 줄바꿈 **하나만** 유지 (기본) |
| `|-` / `>-` | strip — 마지막 줄바꿈 **모두 제거** |
| `|+` / `>+` | keep — 마지막 줄바꿈 **전부 유지** |

## 앵커(`&`)와 별칭(`*`) — 중복 제거

같은 값을 여러 곳에서 재사용. JSON에는 없는 기능.

```yaml
defaults: &defaults
  adapter: postgres
  host: localhost

development:
  <<: *defaults
  database: dev_db

production:
  <<: *defaults
  database: prod_db
  host: db.example.com   # 덮어쓰기
```

> `<<: *anchor`는 **머지 키(merge key)** 라는 별도 확장. YAML 1.1의 비공식 기능이라 라이브러리에 따라 지원 여부가 다름. Kubernetes는 직접 지원하지 않음 (Helm/Kustomize로 우회).

## 태그(`!!`) — 명시적 타입

평문 스칼라의 타입을 강제할 때 사용.

```yaml
port: !!str 8080      # 문자열 "8080"
count: !!int "42"     # 정수 42
ratio: !!float "1.5"  # 실수 1.5
```

대부분의 경우 자동 추론으로 충분하지만, "노르웨이 문제" 같은 모호한 케이스에 안전장치로 사용.

## 다중 문서

한 파일에 여러 YAML 문서를 `---`로 구분.

```yaml
---
kind: Service
name: web
---
kind: Deployment
name: web
```

Kubernetes manifest, Helm chart에서 일상적으로 쓰는 형태.

## 다른 데이터 포맷과 비교

| 포맷 | 가독성 | 크기 | 스키마 | 주 용도 |
|---|---|---|---|---|
| **YAML** | **매우 좋음** | 작음 | 약함 (JSON Schema 호환) | 설정 파일, k8s, CI, Ansible |
| JSON | 좋음 | 중 | 약함 | API, 로그 |
| TOML | 좋음 | 작음 | 약함 | Cargo, pyproject |
| XML | 보통 | 큼 | 강함 | 문서형, 엔터프라이즈 |
| INI | 좋음 | 작음 | 없음 | 단순 설정 (레거시) |

> **YAML 1.2는 JSON의 완전 슈퍼셋**이다. 모든 유효한 JSON은 그 자체로 유효한 YAML. 그래서 YAML 파서로 JSON도 읽을 수 있음. 단, 역은 성립하지 않음 (YAML에만 있는 앵커·태그·블록 스칼라).

### YAML이 설정 파일에서 이긴 이유

| 장점 | 설명 |
|---|---|
| 들여쓰기 가독성 | 중첩 구조가 한눈에 보임 |
| 주석 지원 | JSON에는 없음 (설정 파일의 큰 약점) |
| 멀티라인 문자열 | 블록 스칼라로 자연스럽게 표현 |
| 참조(앵커) | 중복 제거 |
| 가벼운 따옴표 | 대부분의 문자열에 따옴표 불필요 |

## 실무 사용 시나리오

| 영역 | 예시 |
|---|---|
| Kubernetes | `Deployment`, `Service`, `ConfigMap` 등 거의 모든 리소스 manifest |
| CI/CD | **GitHub Actions** (`.github/workflows/*.yml`), GitLab CI, CircleCI, Travis |
| 컨테이너 오케스트레이션 | `docker-compose.yml` |
| 자동화 | **Ansible** playbook, AWX |
| 패키지 관리 | **Helm Chart** (`values.yaml`, `Chart.yaml`) |
| API 명세 | **OpenAPI / Swagger** 스펙 |
| Spring Boot | `application.yml` (`application.properties` 대안) |
| Rails | `database.yml`, `secrets.yml` |
| 정적 사이트 | Jekyll·Hugo의 front matter |

## 흔한 함정

### 1. Norway Problem (YAML 1.1 한정)

```yaml
country_codes:
  - NO    # false 로 파싱됨 (1.1)
  - SE
  - DE
```

YAML 1.1 boolean 키워드: `y`, `Y`, `yes`, `Yes`, `YES`, `n`, `N`, `no`, `No`, `NO`, `true`, `True`, `TRUE`, `false`, `False`, `FALSE`, `on`, `On`, `ON`, `off`, `Off`, `OFF`. **1.2에서는 `true`/`false`만 boolean**.

→ 의심스러우면 `"NO"`처럼 명시적 따옴표. PyYAML 등 1.1 기본 라이브러리는 특히 주의.

### 2. 8진수 / 16진수 ("0으로 시작" 함정)

```yaml
zip: 01234        # YAML 1.1 → 8진수 668. YAML 1.2 → 문자열 "01234"
phone: 010-1234   # 평문은 OK지만 따옴표 권장
```

우편번호·전화번호·버전 문자열은 **반드시 따옴표로 감싸기**.

### 3. 탭 들여쓰기 금지

YAML 스펙은 들여쓰기에 **탭 사용 금지**. 에디터가 무심코 탭을 넣어주면 파서가 거부. `.editorconfig`나 에디터 설정으로 강제 공백 변환.

### 4. 콜론 뒤 공백 누락

```yaml
name:nam       # ❌ "name:nam"이라는 스칼라 하나로 파싱
name: nam      # ✅ 매핑
```

### 5. 안전하지 않은 역직렬화 (보안)

언어 라이브러리가 YAML에서 **임의 객체 인스턴스화**를 허용하면 RCE 가능.

```python
# Python — 절대 사용 금지
yaml.load(untrusted)           # 임의 객체 생성 가능 → RCE

# 안전
yaml.safe_load(untrusted)      # 기본 타입만 허용
```

Ruby `Psych.load` → `Psych.safe_load`, Java SnakeYAML도 `SafeConstructor`/`Constructor` 분리. **신뢰 안 되는 입력은 safe 변형만 사용**.

### 6. 멀티라인 스칼라 chomping 실수

```yaml
script: |
  #!/bin/bash
  echo hello
```

기본 `|`은 끝에 줄바꿈 하나 남김. 쉘 스크립트 등 줄바꿈이 의미 있으면 `|+`, 깔끔히 제거하려면 `|-`.

### 7. 들여쓰기 폭 불일치

```yaml
a:
  b: 1
   c: 2     # ❌ b는 2칸인데 c는 3칸
```

같은 레벨은 정확히 같은 폭. 들여쓰기 폭 자체는 자유지만 **일관성 필수**.

### 8. 모든 게 문자열로 보이는 함정

```yaml
version: 1.10       # 실수 1.1 로 파싱됨 (끝 0 손실)
version: "1.10"     # 안전
```

버전 번호는 항상 따옴표.

## 동작 흐름 — 직렬화/역직렬화

```mermaid
flowchart LR
  App[애플리케이션 객체] -- dump --> YamlStr[YAML 문자열/파일]
  YamlStr -- 디스크/Git/저장소 --> Loader[YAML 파서]
  Loader -- safe_load --> Tree[기본 타입 트리<br/>dict / list / 스칼라]
  Tree --> App2[설정 객체로 매핑]
```

JSON과 흐름은 같지만, YAML은 **사람이 직접 편집하는 단계**가 거의 항상 끼어 있어서 가독성과 주석 지원이 결정적인 차별점.

## 자주 쓰는 도구

```bash
# yq — jq의 YAML 버전 (CLI 표준)
yq '.order.items[].name' order.yaml

# YAML → JSON 변환
yq -o=json '.' config.yaml

# yamllint — 문법 + 스타일 린터
yamllint config.yaml
```

| 도구 | 용도 |
|---|---|
| **yq** | CLI에서 YAML 추출·변환. JSON 상호 변환 |
| **yamllint** | 들여쓰기·따옴표·라인 길이 등 스타일 검사 |
| **PyYAML / ruamel.yaml** (Python) | ruamel은 주석·순서 보존이 강점 |
| **SnakeYAML / SnakeYAML Engine** (Java) | YAML 1.1 / 1.2 각각 지원 |
| **js-yaml** (JS) | Node·브라우저에서 표준 |

## 한 줄 요약

> **YAML = 들여쓰기로 데이터를 표현하는 사람-친화 직렬화 포맷, JSON의 슈퍼셋, 주석과 앵커를 지원.** 가독성 덕에 Kubernetes·CI·Ansible 등 "사람이 직접 편집하는 설정"의 사실상 표준이 됨. 단, 1.1의 boolean 함정과 안전하지 않은 역직렬화는 항상 조심.

## 관련 문서
- [[JSON]] — YAML 1.2가 슈퍼셋으로 삼는 더 엄격한 포맷
- [[XML]] — 더 강력한 스키마·도구 체인을 가진 마크업 계열 대안

## 참조
- YAML 1.2.2 스펙: https://yaml.org/spec/1.2.2/
- YAML 공식: https://yaml.org/
- yq: https://mikefarah.gitbook.io/yq/
- yamllint: https://yamllint.readthedocs.io/
- Norway Problem 정리: https://hitchdev.com/strictyaml/why/implicit-typing-removed/
