# Record 레코드

> 최종 업데이트: 2026-06-22 | 기준 정보: Java 21 LTS (record 정식: Java 16)

## 개념

`record`는 **불변(immutable) 데이터를 담는 것이 목적인 클래스**를 간결하게 선언하는 키워드다. 필드 목록만 적으면 생성자·접근자·`equals`·`hashCode`·`toString`을 컴파일러가 자동으로 만들어 준다.

비유하자면, 일반 클래스가 "직접 조립하는 가구"라면 record는 "필요한 부품 목록만 적으면 완성품으로 배송되는 가구"다. 데이터를 단순히 "운반"하는 것이 역할이라 흔히 **데이터 캐리어(data carrier)**라고 부른다.

```java
public record Point(int x, int y) { }
```

이 한 줄이 아래 일반 클래스와 거의 동일한 일을 한다.

```java
public final class Point {
    private final int x;
    private final int y;
    public Point(int x, int y) { this.x = x; this.y = y; }
    public int x() { return x; }
    public int y() { return y; }
    @Override public boolean equals(Object o) { /* x, y 비교 */ }
    @Override public int hashCode() { /* x, y 기반 */ }
    @Override public String toString() { return "Point[x=" + x + ", y=" + y + "]"; }
}
```

## 배경/역사

전통적인 자바 DTO/VO는 필드 하나 추가할 때마다 생성자·getter·`equals`·`hashCode`·`toString`을 따라 고쳐야 했다. 이 반복되는 **보일러플레이트(boilerplate)** 가 오랜 불만이었고, Lombok의 `@Data`·`@Value` 같은 외부 라이브러리가 그 빈자리를 메워 왔다.

자바는 이를 언어 차원에서 해결하기 위해 record를 도입했다. Project Amber(언어 생산성 개선 프로젝트)의 결과물이다.

| 버전 | 시점 | 상태 | JEP |
|------|------|------|-----|
| Java 14 | 2020 | Preview | [JEP 359](https://openjdk.org/jeps/359) |
| Java 15 | 2020 | Second Preview | [JEP 384](https://openjdk.org/jeps/384) |
| Java 16 | 2021 | **정식(Standard)** | [JEP 395](https://openjdk.org/jeps/395) |
| Java 21 | 2023 | Record Pattern 정식 | [JEP 440](https://openjdk.org/jeps/440) |

## 자동 생성되는 멤버

필드 목록(record header)만 선언하면 다음이 자동 생성된다.

| 멤버 | 설명 |
|------|------|
| `private final` 필드 | 헤더에 적은 각 컴포넌트가 final 필드로 생성 |
| 정규 생성자(canonical constructor) | 모든 컴포넌트를 인자로 받는 생성자 |
| 접근자(accessor) | `getX()`가 아니라 **`x()`** — 필드명과 동일한 이름의 메서드 |
| `equals` / `hashCode` | 모든 컴포넌트 값이 같으면 동등 |
| `toString` | `Point[x=1, y=2]` 형태 |

접근자가 `getX()`가 아니라 `x()`인 점에 주의. 자바빈 규약(`getXxx`)을 따르지 않으므로, 이 규약에 의존하는 일부 프레임워크 연동 시 확인이 필요하다.

## 핵심 제약

record는 "데이터 캐리어"라는 목적에 맞게 의도적으로 제약이 걸려 있다.

- **암묵적으로 `final`** — 상속해서 확장할 수 없다.
- **다른 클래스를 상속(extends)할 수 없다** — 모든 record는 내부적으로 `java.lang.Record`를 상속하기 때문. 단, **인터페이스는 구현(implements) 가능**하다.
- **인스턴스 필드를 추가로 선언할 수 없다** — 모든 인스턴스 상태는 반드시 헤더에만 둔다. (단 `static` 필드는 추가 가능)
- **컴포넌트 필드는 `final`** — 생성 후 값 변경 불가. 이것이 record가 불변인 이유다.

```java
// 인터페이스 구현은 가능
public record Won(long amount) implements Comparable<Won> {
    @Override public int compareTo(Won o) { return Long.compare(amount, o.amount); }
}
```

## 생성자 — canonical / compact / 추가 생성자

record 생성자 문법은 처음 보면 독특하다. 원리부터 풀면 어렵지 않다.

### 1) 표준(canonical) 생성자는 자동 생성된다

헤더에 컴포넌트만 적으면, 컴파일러가 **모든 컴포넌트를 받아 그대로 필드에 대입하는** 정규 생성자를 만들어 준다. 아무것도 안 적으면 이 형태가 기본으로 들어간다.

```java
public record SearchDto(LocalDate regDate, Integer currentPage, Integer itemsPerPage) { }

// 컴파일러가 자동으로 만드는 것:
public SearchDto(LocalDate regDate, Integer currentPage, Integer itemsPerPage) {
    this.regDate = regDate;
    this.currentPage = currentPage;
    this.itemsPerPage = itemsPerPage;   // 파라미터 → 필드 대입
}
```

### 2) compact 생성자 = 그 표준 생성자를 커스텀하는 축약 문법

검증이나 보정 로직만 끼워 넣고 싶을 때, **파라미터 목록 `(...)` 과 `this.x = x` 대입을 전부 생략**하고 본문만 쓴다.

```java
public record SearchDto(LocalDate regDate, Integer currentPage, Integer itemsPerPage) {
    private static final int DEFAULT_ITEMS_PER_PAGE = 100;

    public SearchDto {                          // 괄호 없음 — 파라미터를 안 적는다
        if (itemsPerPage == null) {
            itemsPerPage = DEFAULT_ITEMS_PER_PAGE;   // 파라미터(지역변수)를 보정
        }
        // ← 본문 끝에서 컴파일러가 자동으로 끼워넣는다:
        //    this.regDate = regDate;
        //    this.currentPage = currentPage;
        //    this.itemsPerPage = itemsPerPage;   ← 위에서 바꾼 값(100)이 들어감
    }
}
```

여기서 **반드시 짚어야 할 원리**가 있다.

- compact 생성자엔 파라미터 목록이 없지만, 컴포넌트 이름(`regDate`/`currentPage`/`itemsPerPage`)이 **이미 파라미터(지역변수)로 존재**한다.
- 본문의 `itemsPerPage = 100`은 `this.itemsPerPage`가 아니라 **그 파라미터(지역변수)를 바꾸는 것**이다.
- 본문이 끝나는 순간, 컴파일러가 `this.xxx = xxx;` 들을 자동으로 붙인다. 이때 위에서 보정한 파라미터 값이 그대로 필드로 들어간다.

→ "지역변수를 바꿨는데 왜 필드가 바뀌지?"의 답은 **"본문 끝에서 컴파일러가 그 바뀐 파라미터로 필드를 대입해 주기 때문"** 이다. 그래서 compact 생성자 본문에서는 `this.itemsPerPage = ...`를 쓰지 않고 파라미터 자체를 손본다.

방어적 복사(defensive copy)도 같은 원리다. 가변 객체를 받아 파라미터 단계에서 불변으로 바꿔치면, 자동 대입 때 그 복사본이 필드에 들어간다.

```java
public record Team(String name, List<String> members) {
    public Team {
        members = List.copyOf(members);  // 파라미터를 불변 리스트로 교체 → 필드엔 복사본이 들어감
    }
}
```

### 3) compact vs full canonical — 다른 게 아니라 같은 것의 두 표기법

둘 다 **같은 표준 생성자**를 작성하는 방법이다. 동시에 쓸 수 없고 하나만 쓴다. 둘 다 안 쓰면 §1의 기본형이 자동 생성된다.

| 표기 | 모습 | 용도 |
|------|------|------|
| compact | `public Foo { ...검증... }` (괄호 없음) | 표준 생성자에 보정/검증만. 필드 대입은 자동 |
| full canonical(명시형) | `public Foo(A a, B b) { this.a = a; this.b = b; }` (다 직접 씀) | 완전한 제어가 필요할 때 (드묾) |

### 4) 추가 생성자는 반드시 표준 생성자를 호출한다

컴포넌트를 덜 받는 보조 생성자도 만들 수 있다. 단 이때는 **반드시 `this(...)`로 표준 생성자를 거쳐야** 한다. 직접 필드에 대입할 수 없다.

```java
public record SearchDto(LocalDate regDate, Integer currentPage, Integer itemsPerPage) {
    public SearchDto(LocalDate regDate) {
        this(regDate, 1, 100);   // 표준 생성자 호출 필수 — 검증/보정 로직도 함께 탄다
    }
}
```

## 메서드 추가와 정적 팩토리

인스턴스 필드는 못 늘리지만, **메서드·정적 메서드·정적 필드는 자유롭게 추가**할 수 있다.

```java
public record Range(int min, int max) {
    public int length() { return max - min; }            // 파생 값 계산 메서드

    public static Range of(int min, int max) {           // 정적 팩토리
        return new Range(min, max);
    }
}
```

정규 생성자 자체를 직접 재정의(파라미터를 명시하는 형태)할 수도 있지만, 검증 목적이라면 컴팩트 생성자가 더 간결하다.

## 로컬 레코드와 레코드 패턴

**로컬 레코드(Local Record, Java 16+)** — 메서드 내부에서만 쓰는 임시 묶음 데이터를 메서드 안에 선언할 수 있다. 스트림 중간 데이터를 묶을 때 유용하다.

```java
List<Order> top = orders.stream()
    .map(o -> {
        record Scored(Order order, double score) { }   // 메서드 안 로컬 record
        return new Scored(o, evaluate(o));
    })
    .sorted(Comparator.comparingDouble(Scored::score).reversed())
    .map(Scored::order)
    .toList();
```

**레코드 패턴(Record Pattern, Java 21 정식)** — record를 분해(deconstruction)하면서 패턴 매칭한다. 컴포넌트를 한 번에 꺼낼 수 있다.

```java
// 중첩 분해까지 가능
if (obj instanceof Point(int x, int y)) {
    System.out.println(x + ", " + y);   // 바로 x, y 사용
}

record Line(Point start, Point end) { }
switch (shape) {
    case Line(Point(var x1, var y1), Point(var x2, var y2)) -> ...;
}
```

## 일반 클래스 / Lombok과 비교

| 항목 | record | 일반 class | Lombok `@Value` |
|------|--------|-----------|-----------------|
| 보일러플레이트 | 컴파일러 자동 생성 | 직접 작성 | 애너테이션 프로세서가 생성 |
| 불변성 | 강제(필드 final) | 선택 | 강제 |
| 상속(extends) | 불가 | 가능 | 불가(final) |
| 인스턴스 필드 추가 | 불가 | 가능 | 가능 |
| 접근자 이름 | `x()` | 자유 | `getX()` |
| 외부 의존성 | 없음(언어 기능) | 없음 | Lombok 필요 |

핵심 차이: **불변 데이터 묶음**이면 record가 가장 간결하고 의존성도 없다. 가변 상태가 필요하거나 상속 계층을 설계해야 하면 일반 클래스를 쓴다.

## 실무에서의 위치

DTO, 값 객체(VO), 다중 반환값 묶음, `switch`/패턴 매칭 대상 등 "값을 담아 옮기는" 자리에 잘 맞는다. 직렬화도 지원되어 API 응답 DTO로 흔히 쓴다.

다만 JPA `@Entity`로는 부적합하다. JPA는 기본 생성자와 가변 필드를 요구하는데 record는 둘 다 제공하지 않기 때문이다. 영속 계층 엔티티는 일반 클래스로 두고, record는 조회 결과를 담는 프로젝션 DTO로 쓰는 조합이 일반적이다.

## 관련 문서

- [Java-Abstract-Class.md](Java-Abstract-Class.md) — 추상 클래스
- [Java-Interface.md](Java-Interface.md) — 인터페이스
- [Java-Enum.md](../Java-Enum/Java-Enum.md) — 또 다른 특수 클래스, 열거형
- [자바-직렬화 기본](../자바-직렬화/1\)-자바-직렬화-기본.md) — record의 직렬화
