# JSON (JavaScript Object Notation)

> 최종 업데이트: 2026-04-29 | RFC 8259 / ECMA-404 기준

## 개념

JSON은 **사람이 읽기 쉽고 기계가 파싱하기 쉬운 텍스트 기반 데이터 교환 포맷**이다. 이름은 "JavaScript Object Notation"이지만 실제로는 **언어 독립적**이며, 거의 모든 프로그래밍 언어가 JSON 라이브러리를 기본 제공한다.

> 비유: 국제 공용어 같은 것. 한국어(자바)로 만든 데이터를 영어(JSON)로 번역해 두면, 영어를 읽을 수 있는 누구든(파이썬·자바스크립트·Go…) 이해할 수 있다.

## 배경/역사

- **2001년** Douglas Crockford가 JavaScript 객체 리터럴 문법을 단순화해 데이터 교환 포맷으로 제안. 사실 그가 "발명"했다기보다는 **이미 존재하던 표기법을 표준화·홍보**한 쪽에 가까움.
- **2002년** json.org 사이트로 공개. 당시 XML이 표준이었지만 장황하다는 불만이 있었고, JSON이 빠르게 대안으로 부상.
- **2006년** RFC 4627로 IETF 표준화 (최상위는 객체/배열만 허용).
- **2013년** ECMA-404로 ECMAScript 표준 채택.
- **2014년** RFC 7159 — 최상위 제약 완화 (모든 값 타입 허용).
- **2017년** RFC 8259 — 현재 최신, **UTF-8 강제** 확정.

> Crockford 어록: "JSON을 발견(discovered)했다"고 표현. 새로 만든 게 아니라 기존 JS 문법에서 데이터 표현에 필요한 부분만 추출한 것이라는 뜻.

## 6가지 값 타입

JSON에서 유효한 "값"은 다음 6가지뿐이다. 최상위에도 이 중 어떤 것이든 올 수 있다.

| 타입 | 예시 | 설명 |
|---|---|---|
| 객체(Object) | `{"name":"nam"}` | 키-값 쌍의 모음 (순서 의미 없음) |
| 배열(Array) | `[1, 2, 3]` | 값들의 순서 있는 목록 |
| 문자열(String) | `"hello"` | 큰따옴표(`"`) 강제, UTF-8 |
| 숫자(Number) | `42`, `3.14`, `-1e5` | 정수·실수·지수 표기 |
| 불리언(Boolean) | `true`, `false` | 참/거짓 |
| 널(Null) | `null` | 비어있음 |

## 문법 규칙

JSON은 매우 엄격한 문법을 가진다. JavaScript 객체 리터럴과 비슷해 보이지만 더 까다롭다.

| 규칙 | 유효 | 불유효 |
|---|---|---|
| 키는 반드시 큰따옴표 | `{"a":1}` | `{a:1}`, `{'a':1}` |
| 문자열은 큰따옴표만 | `"hi"` | `'hi'` |
| 끝에 콤마(trailing comma) 금지 | `[1,2]` | `[1,2,]` |
| 주석 금지 | — | `// comment` |
| 숫자 앞 `+` 금지 | `42` | `+42` |
| 8진수·16진수 금지 | `255` | `0xFF`, `0o17` |
| `undefined` 없음 | — | `undefined` |
| `NaN`, `Infinity` 없음 | — | `NaN`, `Infinity` |

> **JSON ≠ JavaScript 객체.** JS 객체 리터럴은 더 관대해서 위 "불유효"도 허용된다. 그래서 JS의 `eval()`로 JSON을 파싱하면 안 된다(보안 + 정확성 모두).

## 다양한 형태의 유효한 JSON

```json
{"name": "nam", "age": 30}
```
```json
[1, 2, 3, 4]
```
```json
"single string"
```
```json
42
```
```json
true
```
```json
null
```
```json
{
  "user": {
    "name": "nam",
    "active": true,
    "scores": [88, 92, 75],
    "manager": null
  }
}
```

## 다른 데이터 포맷과 비교

| 포맷 | 예시 | 가독성 | 크기 | 스키마 | 주 용도 |
|---|---|---|---|---|---|
| JSON | `{"a":1}` | 좋음 | 중 | 약함 (JSON Schema 별도) | REST API, 설정, 로그 |
| XML | `<a>1</a>` | 보통 | 큼 | 강함 (XSD, DTD) | SOAP, 레거시, 문서형 데이터 |
| YAML | `a: 1` | 매우 좋음 | 작음 | 약함 | 사람 편집 설정 (k8s, CI) |
| TOML | `a = 1` | 좋음 | 작음 | 약함 | Rust Cargo, Python pyproject |
| CSV | `a\n1` | 표 형태 | 작음 | 없음 | 표 데이터 |
| Protocol Buffers | (binary) | 없음 | 매우 작음 | 강제 (.proto) | gRPC, 고성능 통신 |
| MessagePack | (binary) | 없음 | 매우 작음 | 약함 | JSON 호환 바이너리 |

> **JSON이 가장 널리 쓰이는 이유**: 단순함 + 모든 언어 지원 + 브라우저 네이티브 + 사람이 디버깅 가능. "충분히 좋아서" 표준이 됨.

## JSON 확장 / 변형

| 이름 | 설명 |
|---|---|
| **JSONL / NDJSON** | 한 줄에 JSON 하나씩 (`{...}\n{...}\n`). 스트리밍·로그 용. 표준 JSON 파서로 한 줄씩 파싱 가능 |
| **JSON5** | 주석·trailing comma·작은따옴표 허용. 사람 편집용. 표준 JSON과 호환 안 됨 |
| **JSON-LD** | Linked Data (시맨틱 웹). `@context`로 타입 정의. Google 검색·구조화 데이터에서 사용 |
| **GeoJSON** | 지리 좌표 표현 표준 (RFC 7946) |
| **JSON Patch** (RFC 6902) | 부분 업데이트 표현 (`{"op":"add","path":"/a","value":1}`) |
| **JSON Pointer** (RFC 6901) | 특정 값 경로 표현 (`/user/0/name`) |
| **JSON Schema** | JSON 구조 검증용 스키마 (XML의 XSD에 해당) |
| **HAL / JSON:API** | REST API 응답 포맷 표준 (하이퍼미디어, 페이징 규약) |

## 자주 쓰는 도구

```bash
# jq — 커맨드라인 JSON 처리기 (CLI 표준)
echo '{"users":[{"name":"a"},{"name":"b"}]}' | jq '.users[].name'
# "a"
# "b"

# 파일에서 특정 필드만
curl https://api.example.com/users | jq '.[] | {id, name}'

# JSON 들여쓰기 정렬
cat data.json | jq .
```

| 도구 | 용도 |
|---|---|
| **jq** | CLI에서 JSON 추출/변환. 거의 표준 |
| **JSONPath** | XPath 같은 쿼리 언어 (`$.users[*].name`) |
| **JSON Schema validator** | 스키마 검증 (`ajv`, `jsonschema` 등) |
| **JSON Crack / JSON Hero** | 시각화 웹 도구 |

## 실무 사용 시나리오

| 상황 | 예시 |
|---|---|
| REST API | 요청/응답 본문 (`Content-Type: application/json`) |
| 설정 파일 | `package.json`, `tsconfig.json`, `.eslintrc.json` |
| 로그 | 구조화 로그 (`{"level":"info","msg":"..."}`), JSONL 형식 |
| 메시지 큐 | Kafka·RabbitMQ 메시지 페이로드 |
| 캐시 | Redis 값 (직렬화된 JSON 문자열) |
| 데이터베이스 | PostgreSQL `JSONB`, MongoDB BSON, MySQL `JSON` 컬럼 |
| LocalStorage | 브라우저 클라이언트 상태 저장 |

## 흔한 함정

### 1. 큰 정수 정밀도 손실

JSON 숫자는 **타입 구분이 없다** (정수/실수 통합). JavaScript는 `Number`가 64비트 부동소수점이라 **2^53 초과 정수에서 정밀도 손실** 발생.

```json
{"id": 9007199254740993}     ← JS에서 9007199254740992로 변형됨
```

→ 큰 정수는 **문자열로 직렬화**하는 게 안전. (Java `BigDecimal`, Twitter Snowflake ID 등)

### 2. 날짜 타입 부재

JSON에는 날짜 타입이 없다. 보통 ISO 8601 문자열로 표현.

```json
{"createdAt": "2026-04-29T10:30:00Z"}
```

→ Unix timestamp(숫자)도 가능하지만 사람이 읽기 어려움. ISO 8601 권장.

### 3. 키 중복

JSON 스펙은 **객체 키 중복을 명시적으로 금지하진 않지만 권장도 안 함**. 파서마다 동작이 다름 (마지막 값 채택 / 에러 / 배열로 합침).

```json
{"a": 1, "a": 2}     ← 파서에 따라 다름
```

### 4. 보안 — JSON Hijacking (역사적)

과거 IE/구형 브라우저에서 최상위가 배열인 JSON 응답을 `<script>` 태그로 가로챌 수 있던 취약점. 현대 브라우저에서는 패치됨. 그래도 **민감 데이터는 객체로 감싸서 응답**하는 게 관례.

```json
{"data": [...]}      ← 권장
[...]                ← 단독 배열은 피하기
```

### 5. 순환 참조 직렬화 불가

JSON은 트리 구조. 객체끼리 서로 참조하면 무한 루프.

```js
const a = {};
a.self = a;
JSON.stringify(a);   // TypeError: cyclic object value
```

→ 자바 Jackson은 `@JsonManagedReference`/`@JsonBackReference` 또는 `@JsonIdentityInfo`로 우회.

### 6. UTF-8 강제 (RFC 8259)

JSON은 반드시 **UTF-8 인코딩**이어야 한다. UTF-16/UTF-32는 RFC 8259부터 명시적으로 금지. 파일을 다른 인코딩으로 저장하면 비표준.

## 동작 흐름 — 직렬화/역직렬화

```
[자바 객체]                                 [JavaScript 객체]
   │                                              ▲
   │ Jackson.writeValueAsString()                 │ JSON.parse()
   ▼                                              │
[JSON 문자열] ──── 네트워크 전송 (HTTP) ────────►[JSON 문자열]
   ▲                                              │
   │ Jackson.readValue()                          │ JSON.stringify()
   │                                              ▼
[자바 객체]                                 [JavaScript 객체]
```

JSON은 **언어와 언어 사이의 공통 통화** 역할. 양쪽이 자기 언어 객체로 ↔ JSON 문자열로 변환하는 라이브러리만 있으면 통신 성립.

## 한 줄 요약

> **JSON = 언어 독립적인 텍스트 데이터 포맷, 6가지 값 타입, UTF-8, 엄격한 문법.** 단순함과 보편성으로 사실상 인터넷 데이터 교환 표준이 되었다.

## 관련 문서
- [[../../Java/자바 직렬화/2) Jackson]] — 자바에서 JSON 다루기
- [[../../Java/자바 직렬화/1) 자바 직렬화 기본]] — 직렬화 전반

## 참조
- RFC 8259: https://www.rfc-editor.org/rfc/rfc8259
- ECMA-404: https://www.ecma-international.org/publications-and-standards/standards/ecma-404/
- json.org: https://www.json.org/
- jq: https://jqlang.github.io/jq/
- JSON Schema: https://json-schema.org/
