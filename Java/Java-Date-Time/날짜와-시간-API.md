# Java 날짜와 시간 API (java.time)

> 최종 업데이트: 2026-06-23 | Java 8+ `java.time`(JSR-310) 기준

## 개념

`java.time`은 Java 8부터 들어온 **표준 날짜·시간 API**다. 핵심 설계는 세 가지 — **불변(immutable)**, **목적별로 타입을 쪼갬**(날짜만/시각만/시점 등), **[ISO 8601](../../CS-이론/데이터-포맷/ISO-8601-날짜시간-표기.md) 기반**. 그래서 타입 이름만 봐도 "이게 타임존을 아는 시점인지, 그냥 벽시계 값인지"가 드러난다.

> 비유: 옛날 `Date` 하나로 모든 걸 우겨넣던 것을, "날짜 전용 자", "시각 전용 자", "시점 전용 자"로 **연장을 용도별로 나눈 것**이다. 연장이 분리되니 헷갈릴 일이 준다.

## 배경/역사

| 시기 | 내용 |
|------|------|
| 1996 | `java.util.Date` — 가변(mutable)이라 버그 온상, 대부분 메서드 deprecated |
| 1997 | `java.util.Calendar` — 개선 시도였으나 **월(month)이 0부터** 시작하는 등 여전히 혼란 |
| ~2000년대 | **Joda-Time**(Stephen Colebourne) 라이브러리가 사실상 표준처럼 쓰임 |
| 2014 | Java 8에서 **JSR-310 `java.time`** 정식 도입 — Joda-Time 설계자가 직접 주도해 그 후계로 만듦 |

그래서 신규 코드는 `Date`/`Calendar`를 쓸 이유가 없다. `java.time`이 정답이다.

## 핵심 타입 한눈에

| 타입 | 담는 것 | 예시 |
|------|---------|------|
| `LocalDate` | 날짜만 | `2024-05-15` |
| `LocalTime` | 시각만 | `00:00:00` |
| `LocalDateTime` | 날짜+시각 (타임존 없음) | `2024-05-15T00:00` |
| `OffsetDateTime` | + UTC 오프셋 | `2024-05-15T00:00+09:00` |
| `ZonedDateTime` | + 지역 ID(DST 규칙) | `...+09:00[Asia/Seoul]` |
| `Instant` | UTC 절대 시점(기계용) | `2024-05-14T15:00:00Z` |
| `Duration` | **시간** 기반 양 | 2시간 30분 |
| `Period` | **날짜** 기반 양 | 1년 2개월 3일 |

## 핵심 축 — "벽시계 값이냐, 진짜 시점이냐"

이 API를 관통하는 기준은 **타임존 정보를 얼마나 들고 있느냐**다. 정보가 늘수록 "달력 위 표시"에서 "지구상 한 순간"으로 구체화된다.

| 타입 | 타임존 정보 | 의미 |
|------|-----------|------|
| `LocalDateTime` | 없음 | **벽시계 값**. "5월 15일 0시"라는 표시일 뿐, 어느 순간인지 미상 |
| `OffsetDateTime` | 오프셋 숫자(`+09:00`) | 오프셋만큼은 시점 확정. DST는 모름 |
| `ZonedDateTime` | 지역 ID(`Asia/Seoul`) | 지역 규칙(DST)까지 아는 완전한 시점 |
| `Instant` | UTC 기준 | 타임존을 떼낸 **순수 절대 시점**. 로그·DB·비교에 적합 |

핵심 함정은 `LocalDateTime`이다. 이름이 "DateTime"이라 시점 같지만, **오프셋이 없어 절대 시점이 아니다.** 시점을 저장·전송할 때 이걸 쓰면 [9시간 틀어지는 사고](../../CS-이론/데이터-포맷/ISO-8601-날짜시간-표기.md)가 난다.

## OffsetDateTime vs ZonedDateTime — DST가 가른다

가장 헷갈리는 두 타입이다. 차이는 **서머타임(DST)을 아느냐**다.

| | `OffsetDateTime` | `ZonedDateTime` |
|---|---|---|
| 들고 있는 것 | 오프셋 **숫자만** | **지역 ID** + 오프셋 |
| DST(서머타임) | 모름 — 고정 | 앎 — 규칙대로 자동 조정 |
| toString | `...T00:00+09:00` | `...T00:00+09:00[Asia/Seoul]` |

뉴욕에서 서머타임 전환일을 넘겨 `+1일` 하면 차이가 드러난다.

```java
ZonedDateTime z = ZonedDateTime.of(2024, 3, 9, 12, 0, 0, 0, ZoneId.of("America/New_York"));
OffsetDateTime o = z.toOffsetDateTime();

z.plusDays(1);   // 2024-03-10T12:00-04:00[America/New_York]  ← 오프셋 -05 → -04 자동 전환
o.plusDays(1);   // 2024-03-10T12:00-05:00                     ← -05:00 그대로 고정
```

`ZonedDateTime`은 지역을 알아 DST를 반영하고, `OffsetDateTime`은 숫자만 알아 고정이다. 한국은 현재 서머타임이 없어 둘이 똑같아 보이지만, **미국·유럽 시각을 다루는 순간** 이 차이가 버그로 터진다.

## Duration vs Period — 시간이냐 날짜냐

"기간"도 두 타입으로 갈린다. 단위 체계가 다르기 때문이다.

| | `Duration` | `Period` |
|---|---|---|
| 기준 | **시간**(초 단위) | **날짜**(연·월·일) |
| 예 | 2시간 30분, 90초 | 1년 2개월, 3일 |
| 쓰는 곳 | `Instant`/시각 계산 | `LocalDate` 계산 |

```java
Duration.ofMinutes(90);              // PT1H30M  (시간 기반)
Period.ofMonths(2);                  // P2M      (날짜 기반)
Duration.between(start, end);        // 두 시점 사이 '시간' 차
Period.between(birthday, today);     // 두 날짜 사이 '연/월/일' 차
```

## 포맷과 파싱 — DateTimeFormatter

문자열 ↔ 객체 변환은 `DateTimeFormatter`가 맡는다. `java.time`의 기본 포맷이 곧 ISO 8601이라, 별도 지정 없이도 ISO로 나온다.

```java
// ISO 8601 기본 — 지정 없이 바로
OffsetDateTime.parse("2024-05-15T00:00:00+09:00");   // 파싱
odt.toString();                                       // "2024-05-15T00:00+09:00"

// 커스텀 패턴
DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
LocalDateTime.parse("2024-05-15 09:30", f);
```

## Jackson 연동 — 직렬화·역직렬화

Spring 등에서 API로 시간을 주고받으면 **Jackson**이 `java.time` 타입을 JSON 문자열로 바꾼다. **`jackson-datatype-jsr310`**(JavaTimeModule)이 등록돼야 동작하며(Spring Boot는 자동 등록), 기본값이 epoch 숫자라 ISO 문자열로 뽑으려면 `WRITE_DATES_AS_TIMESTAMPS`를 꺼야 한다.

핵심 원칙은 **"보낼 땐 엄격하게, 받을 땐 관대하게"** — 네트워크 견고성 원칙 그대로다.

### 보낼 때(직렬화) — 엄격하게

`@JsonFormat`으로 출력 형식을 못 박는다.

```java
@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
private OffsetDateTime expiryDate;
```

`shape = STRING`은 숫자 타임스탬프 대신 문자열로, `pattern`은 그 형식이다(`'T'`는 리터럴 T, `SSS`는 밀리초). 오프셋을 찍는 **`X` 글자 수**가 결과를 가른다.

| 패턴 | 출력 | 비고 |
|------|------|------|
| `X` | `+09` 또는 `Z` | 시간만 — RFC 3339 거부 소지 |
| `XX` | `+0900` 또는 `Z` | 기본형 |
| `XXX` | `+09:00` 또는 `Z` | **확장형 — 권장** |

`X`는 `+09`(시간만)로 찍는데 [RFC 3339는 `+09:00`만](../../CS-이론/데이터-포맷/ISO-8601-날짜시간-표기.md) 인정하므로, 내보낼 땐 **`XXX`** 로 맞춰 어느 시스템이든 읽게 한다.

### 받을 때(역직렬화) — 관대하게

외부 응답은 형식을 통제할 수 없다. 그래서 **패턴을 박지 말고 `OffsetDateTime`으로 받는 게 정석**이다. 패턴이 없으면 Jackson이 ISO 기본 파서(`ISO_OFFSET_DATE_TIME`)를 쓰는데, 이놈이 `+09`·`+09:00`·밀리초 유무를 전부 흡수한다.

```java
private OffsetDateTime expiryDate;   // @JsonFormat 없이 — 들어오는 변형을 다 받음
```

반대로 **`@JsonFormat` 패턴을 박으면 그 모양만** 받아, 패턴 글자와 입력이 한 군데라도 어긋나면 깨진다.

| 들어오는 값 | `...SSSX` | `...SSSXXX` | 패턴 없음(ISO 기본) |
|------------|-----------|-------------|---------------------|
| `+09` | OK | **FAIL** | **OK** |
| `+09:00` | **FAIL** | OK | **OK** |

패턴을 고정하면 연동사가 형식을 살짝만 바꿔도 터지니, 받는 쪽에선 패턴을 빼는 게 견고하다.

#### 받아도 오프셋은 보존되지 않는다 — Jackson이 UTC로 정규화한다

`OffsetDateTime`으로 받으면 파싱은 되지만, **들어온 오프셋이 그대로 남지 않는다.** Jackson(jsr310)의 역직렬화 기본 정책 `ADJUST_DATES_TO_CONTEXT_TIME_ZONE`(기본 ON)이 수신 시각을 **컨텍스트 타임존(기본 UTC)으로 정규화**하기 때문이다. instant(절대 순간)는 유지한 채 오프셋만 `Z`로 갈아끼운다.

```
입력            : 2027-03-20T00:00:00.000+09:00
기본(ADJUST ON) → 2027-03-19T15:00Z        ← 같은 순간, 오프셋만 UTC로
ADJUST OFF      → 2027-03-20T00:00+09:00    ← 원본 오프셋 보존
```

타입이 무능해서가 아니라 정책 때문이다 — `OffsetDateTime`은 `+09:00`을 담을 능력이 있고, 정책을 끄면 실제로 보존된다. instant가 같으니 **비교·저장·표시엔 무해**하며, **원본 오프셋 자체가 필요한 경우에만** 함정이다. 그땐 정책을 끈다.

```java
ObjectMapper om = new ObjectMapper().registerModule(new JavaTimeModule());
om.disable(DeserializationFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE);  // 원본 오프셋 보존
```

컨텍스트 타임존 기본값은 UTC지만, Spring Boot는 `spring.jackson.time-zone` 프로퍼티로 바꿀 수 있다(예: `Asia/Seoul`로 두면 정규화 결과가 `+09:00`으로 나온다).

### 패턴 글자 — 오프셋과 존 ID는 다른 글자다

| 패턴 글자 | 찍는 것 | 예 |
|----------|---------|-----|
| `X` / `XXX` / `Z` | **오프셋**(숫자) | `+09:00` |
| `VV` | **지역 ID** | `Asia/Seoul` |
| `z` | 지역 이름(텍스트) | `KST` |

`@JsonFormat` 패턴에 오프셋 글자(`X`)만 있으면, `ZonedDateTime`이라도 **`[Asia/Seoul]` 존 ID는 직렬화되지 않는다**. 존 ID까지 찍으려면 `VV`가 필요하다.

```
ZonedDateTime 원본 : 2024-05-15T00:00+09:00[Asia/Seoul]
...SSSXXX 로 직렬화 : 2024-05-15T00:00:00.000+09:00            ← 존 ID 증발
...SSSXXX'['VV']'  : 2024-05-15T00:00:00.000+09:00[Asia/Seoul]  ← 보존(단 비표준)
```

### ZonedDateTime + 존 ID 패턴의 함정

존 ID는 **원본 객체에만 있는 정보**다. 표준 문자열(오프셋만)로 한 번 나가면 소실되고, 오프셋만으론 [지역을 역추적할 수 없다](../../CS-이론/데이터-포맷/ISO-8601-날짜시간-표기.md). 그래서 방향별로 가능 여부가 갈린다.

| 방향 | `[Asia/Seoul]` 출처 | `VV` 패턴 |
|------|---------------------|-----------|
| 보낼 때 | 내 객체가 보유 | 붙일 수 있음(받는 쪽도 자바여야 읽음) |
| 받을 때 | 입력 문자열에 있어야 | 입력에 없으면 **파싱 실패** |

특히 외부가 `2023-04-25T00:00:00.000+09`만 주는데 받는 DTO에 존 ID까지 요구하는 패턴을 박으면 **무조건 깨진다**:

```java
@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX'['VV']'")
private ZonedDateTime expiryDate;
// 입력 "...+09" → XXX(+09:00 기대)도 안 맞고 [Asia/Seoul]도 없음 → DateTimeParseException
// Jackson이 InvalidFormatException으로 감싸고 → Spring은 400 Bad Request
```

이 패턴은 입력이 정확히 `...+09:00[Asia/Seoul]`일 때만 성공한다. 표준 ISO 응답엔 존 ID가 없으니, **외부 응답을 받을 땐 `ZonedDateTime`이 아니라 `OffsetDateTime` + 패턴 없음**이 정답이다.

## 자주 하는 변환

타입 사이는 명시적으로 변환한다. "정보를 더하거나(존 부여) 덜어내는(존 제거)" 관계로 보면 쉽다.

```java
Instant ins = odt.toInstant();              // 오프셋 떼고 UTC 절대 시점으로
OffsetDateTime back = ins.atOffset(ZoneOffset.ofHours(9));  // 다시 오프셋 부여
ZonedDateTime z = ins.atZone(ZoneId.of("Asia/Seoul"));      // 지역 부여
LocalDate d = zdt.toLocalDate();            // 날짜 부분만 추출
```

## 실무 원칙

- **저장·전송**: 타임존 모호함을 없애려 **UTC `Instant`** 또는 **`OffsetDateTime`** 으로. `LocalDateTime`으로 시점을 저장하지 말 것
- **지역 일정·반복 예약**: DST를 반영해야 하므로 **`ZonedDateTime`** (예: "뉴욕 사용자 매주 9시")
- **신규 코드에서 `Date`/`Calendar` 금지** — `java.time`으로 통일
- 모든 타입이 **불변**이라 `plusDays` 등은 **새 객체를 반환**한다. 원본은 안 바뀌니 반환값을 받아야 한다

## 관련 문서

- [ISO 8601 — 날짜·시간 표기](../../CS-이론/데이터-포맷/ISO-8601-날짜시간-표기.md) — `java.time`이 기반으로 삼는 문자열 표준
- [DB 서버 타임존](../../Database/MySQL/MySQL-날짜시간-저장.md) — 이 타입들을 DB에 저장·조회할 때의 타임존 처리
- [Jackson](../자바-직렬화/2\)-Jackson.md) — `@JsonFormat` 등 JSON 직렬화 라이브러리
- [Java-Record](../Java-Class/Java-Record.md) — 시간 값을 담는 불변 DTO 설계 시 참고
