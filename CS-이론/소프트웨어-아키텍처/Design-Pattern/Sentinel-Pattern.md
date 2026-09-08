# Sentinel 패턴 (보초 값)

> 최종 업데이트: 2026-08-05 | Java 기준

## 개념

Sentinel(보초) 패턴은 **"특별한 뜻"을 전달하려고, 실제 데이터와 절대 겹치지 않는 유일한 값을 미리 정해두고 그것을 돌려주는 기법**이다. 반환 타입은 그대로 지키면서, **데이터가 아닌 신호**를 같은 타입에 실어 보낸다.

> 열차 전광판에 비유할 수 있다. 전광판(반환 타입)에 **역 이름만** 표시할 수 있는데 "종착"을 알려야 한다면? **"종착역"이라는 이름의 가상 역**을 하나 정해두고 그걸 띄운다. 형식은 역 이름이지만, 모두가 "이건 신호다"라고 약속한 것이다.

> ⚠️ Redis의 **Sentinel**(고가용성 감시 프로세스)과는 이름만 같고 무관하다.

## 왜 필요한가 — 타입 계약에 갇혔을 때

인터페이스를 구현하는 자리에서 반환 타입이 `RequestPayload`로 못박혀 있는데, **"이 레코드는 내 것이 아니다"**라는 신호를 보내야 하는 상황을 보자. 다른 선택지가 전부 막힌다.

| 시도 | 결과 |
|------|------|
| 다른 타입 반환 | ❌ 컴파일 불가 (계약 위반) |
| `null` 반환 | ❌ 이미 다른 뜻이 점유 (예: Kafka tombstone = "삭제") → **의미 충돌** |
| 예외 던지기 | ❌ 호출부가 "파싱 실패"로 오해 |
| **sentinel** | ✅ 타입은 맞추고, 뜻은 따로 전달 |

남는 길은 하나다 — **타입은 `RequestPayload`이지만, "특별하다고 약속된" 놈을 돌려주는 것.**

## 두 가지 종류

| 종류 | 방식 | 비교 방법 | 예 |
|------|------|-----------|-----|
| **Sentinel value** | 도메인에서 **못 쓰는 값**을 예약 | 값 비교 | `indexOf()`의 `-1`, C 문자열의 `\0`, `read()`의 `-1`(EOF) |
| **Sentinel object** | **유일한 인스턴스** 하나 | **주소(`==`)** | 아래 예시, Python `_MISSING = object()` |

**Sentinel object가 더 안전하다.** 예약 값(`-1` 등)은 "언젠가 진짜 그 값이 올 수 있다"는 위험이 남지만, **객체 주소는 우연히 겹칠 수가 없다.**

## 구현 — `static final` + `==`

핵심은 **인스턴스가 JVM에 딱 하나만 존재**하는 것이다. `static final`이 이를 보장한다.

```java
// ✅ 유일한 보초 — 클래스 로딩 시 한 번만 생성
private static final RequestPayload NOT_MINE = new RequestPayload();

public RequestPayload deserialize(byte[] data) {
    if (!isMine(data)) return NOT_MINE;   // 신호를 실어 보냄
    return delegate.parse(data);
}
```

```java
// 판별은 반드시 주소 비교
RequestPayload value = deserialize(record);
if (value == NOT_MINE) {
    return;   // 내 것 아님 → skip
}
```

`new`는 매번 **새 주소**의 객체를 만든다. `delegate.parse()`가 만들어 내는 payload들은 전부 다른 주소이므로, **파싱된 객체는 내용이 무엇이든 이 비교를 통과할 수 없다.**

```java
// ❌ 이러면 완전히 망가진다 — 매번 새 주소라 == 가 영원히 false
return new RequestPayload();
```

### 왜 `equals()`가 아니라 `==`인가

`equals()`는 "내용이 같으면 참"이라, **필드가 전부 비어 있는 진짜 payload**가 들어오면 오탐한다. 주소 비교(`==`)는 **"바로 그 보초 객체냐"**를 묻기 때문에 그럴 일이 없다. 이것이 sentinel object의 핵심 이점이다.

## 이미 쓰이고 있는 sentinel들

| 사례 | 정체 |
|------|------|
| `Optional.empty()` | 내부적으로 **static 싱글턴** `EMPTY` — sentinel object |
| `list.indexOf(x)` → `-1` | "없음"을 뜻하는 예약 값 |
| `InputStream.read()` → `-1` | EOF 신호 |
| Kafka **tombstone**(`value = null`) | "이 키 삭제"를 뜻하는 예약 값 |
| `Collections.emptyList()` | 불변 싱글턴 |
| 연결 리스트·레드블랙트리의 **dummy/NIL 노드** | 경계 조건을 없애기 위한 sentinel node |

## ⚠️ 함정

**① 절대 밖으로 새면 안 된다** — sentinel은 **판별 지점 안쪽에서 소비되고 사라져야** 한다. 바깥으로 흘러나가면 다음 코드가 진짜 데이터로 알고 필드를 까다가 NPE를 낸다. **경계에서 반드시 걸러낼 것.**

**② 직렬화·복제하면 정체성이 깨진다** — 직렬화 후 역직렬화하면 **다른 주소의 새 객체**가 되어 `==`가 즉시 무력화된다. 그래서 sentinel은 **프로세스 안, 인메모리로만** 써야 한다(메시지 바디에 실어 보내면 안 됨).

**③ 문서화 없으면 지뢰다** — 남이 보면 "빈 객체를 왜 돌려주지?" 한다. 상수 이름(`NOT_MINE`)과 주석으로 **"이건 보초다"**를 명시해야 한다.

## Null Object 패턴과의 차이

닮았지만 목적이 다르다.

| | **Sentinel** | **Null Object** |
|---|-------------|-----------------|
| 목적 | **"특별한 상태"를 신호로 전달** | `null` 검사 없이 **안전하게 동작**시키기 |
| 사용법 | 호출부가 **판별해서 분기** | 호출부가 **그냥 쓴다**(아무 일도 안 하는 구현) |
| 예 | `NOT_MINE`, `-1` | `NullLogger`(호출해도 무동작) |

## 더 나은 대안 — sealed interface

**반환 타입을 내가 바꿀 수 있다면** sentinel보다 안전한 길이 있다. 상태를 타입으로 표현하는 것이다.

```java
// 상태를 타입으로 — 컴파일러가 분기 누락까지 잡아준다
sealed interface ParseResult {
    record Mine(RequestPayload payload) implements ParseResult {}
    record NotMine()                    implements ParseResult {}
    record Failed(String reason)        implements ParseResult {}
}
```

| | sentinel | sealed interface |
|---|---------|------------------|
| 타입 계약 변경 | **불필요** | 필요 |
| 컴파일러 검증 | 없음(주소 규약에 의존) | **있음**(분기 누락 시 오류) |
| 언제 쓰나 | **시그니처를 못 바꿀 때** | 내가 설계 주체일 때 |

→ **남의 인터페이스를 구현하는 자리처럼 시그니처가 고정된 상황**에서는 sentinel이 정석적 탈출구다. 반대로 내가 API를 설계한다면 sealed interface로 상태를 명시하는 것이 안전하다.

## 정리

> **Sentinel 패턴 = 타입 계약은 지키면서 "특별한 뜻"을 전달하려고, 실제 데이터와 절대 겹치지 않는 유일한 값을 정해두는 것. `static final`로 인스턴스를 하나만 만들고 `==`로 주소를 비교하면 우연한 충돌이 원리적으로 불가능하다. 단 밖으로 새면 안 되고 직렬화하면 정체성이 깨진다. 시그니처를 바꿀 수 있다면 sealed interface가 더 안전하다.**

## 관련 문서

- [디자인 패턴이란](디자인-패턴이란.md) — 패턴 분류 체계
- [Singleton Pattern](Creational-patterns/Singleton-Pattern.md) — sentinel object의 "유일한 인스턴스" 원리
- [Java Record](../../../Java/Java-Class/Java-Record.md) — sealed interface와 함께 쓰는 대안
- [클래스와 인스턴스](../../../Java/Java-Class/Java-Class-and-Instance.md) — 참조(주소) 비교와 인스턴스 정체성
